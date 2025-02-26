import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Sound from "react-native-sound";
import Video from "react-native-video";
import DatePicker from "react-native-date-picker";
import { useNavigation } from "@react-navigation/native";

const surveyData = [
  {
    question: "Ngày dự định tổ chức đám cưới?",
    type: "date",
    ttsFile: require("../Assets/TTS/audio1.mp3"),
    videoFile: require("../Assets/Videos/video1.mp4"),
  },
  {
    question: "Số lượng khách dự kiến?",
    type: "text",
    ttsFile: require("../Assets/TTS/audio2.mp3"),
    videoFile: require("../Assets/Videos/video2.mp4"),
  },
  {
    question: "Ngân sách dự kiến cho đám cưới?",
    type: "text",
    ttsFile: require("../Assets/TTS/audio3.mp3"),
    videoFile: require("../Assets/Videos/video3.mp4"),
  },
  {
    question: "Chúng tôi đã gợi ý cho bạn một số combo theo khảo sát của bạn!",
    type: "info",
    ttsFile: require("../Assets/TTS/audio3.mp3"),
    videoFile: require("../Assets/Videos/video3.mp4"),
  },
];

// Ví dụ danh sách sản phẩm ở mỗi hạng mục
const productsData = {
  dress: [
    {
      id: "dress1",
      name: "Simple Dress",
      price: 2000,
      rating: 4.5,
      discount: null,
      image: require("../Assets/Images/dresses1.png"),
    },
    {
      id: "dress2",
      name: "Elegant Dress",
      price: 4000,
      rating: 4.8,
      discount: "10% OFF",
      image: require("../Assets/Images/dresses1.png"),
    },
  ],
  hall: [
    {
      id: "hall1",
      name: "Small Hall",
      price: 3000,
      rating: 4.6,
      discount: null,
      image: require("../Assets/Images/house.png"),
    },
    {
      id: "hall2",
      name: "Luxury Hall",
      price: 7000,
      rating: 4.9,
      discount: "5% OFF",
      image: require("../Assets/Images/house.png"),
    },
  ],
  flowers: [
    {
      id: "flowers1",
      name: "Basic Flowers",
      price: 500,
      rating: 4.4,
      discount: null,
      image: require("../Assets/Images/dresse.png"),
    },
    {
      id: "flowers2",
      name: "Premium Flowers",
      price: 1500,
      rating: 4.8,
      discount: null,
      image: require("../Assets/Images/dresse.png"),
    },
  ],
  food: [
    {
      id: "food1",
      name: "Standard Buffet",
      price: 2000,
      rating: 4.7,
      discount: null,
      image: require("../Assets/Images/fb_btn.png"),
    },
    {
      id: "food2",
      name: "Deluxe Buffet",
      price: 5000,
      rating: 4.9,
      discount: "15% OFF",
      image: require("../Assets/Images/fb_btn.png"),
    },
  ],
};

// Hàm chọn 1 sản phẩm/hạng mục sao cho tổng không vượt quá budget
const generatePlanFromBudget = (budget) => {
  let leftover = budget;
  const plan = [];

  // Lặp qua từng category (dress, hall, flowers, food, ...)
  Object.keys(productsData).forEach((categoryKey) => {
    const items = productsData[categoryKey];
    // Sắp xếp item theo giá tăng dần
    items.sort((a, b) => a.price - b.price);

    // Tìm item đắt nhất có thể mua được với leftover
    let chosenItem = null;
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].price <= leftover) {
        chosenItem = items[i];
        leftover -= chosenItem.price; // trừ vào ngân sách còn lại
        break;
      }
    }

    // Nếu không mua nổi item nào => có thể chọn item rẻ nhất (nhưng ghi chú)
    if (!chosenItem) {
      const cheapest = items[0];
      chosenItem = {
        ...cheapest,
        name: `${cheapest.name} (not enough budget)`,
      };
    }

    plan.push({
      category: categoryKey.toUpperCase(), // PLACE, DRESS, ...
      ...chosenItem,
    });
  });

  return plan;
};

const Thongtincoban = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);

  // Lưu ngân sách
  const [budget, setBudget] = useState(0);

  const [videoPlayed, setVideoPlayed] = useState(false);
  const [ttsPlayed, setTtsPlayed] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    setTtsPlayed(false);
    setVideoPlayed(false);
    playTTS(surveyData[currentIndex].ttsFile);
  }, [currentIndex]);

  const playTTS = (ttsFile) => {
    const sound = new Sound(ttsFile, (error) => {
      if (error) {
        console.log("Error loading TTS sound", error);
        return;
      }
      sound.play((success) => {
        if (success) {
          setTtsPlayed(true);
        } else {
          console.log("TTS playback failed");
        }
      });
    });
    return () => sound.release();
  };

  const handleNext = () => {
    // Nếu là câu hỏi về ngân sách, lưu lại
    if (surveyData[currentIndex].question.includes("Ngân sách")) {
      setBudget(Number(answer)); // chuyển answer sang dạng số
    }

    // Kiểm tra xem có phải câu cuối không
    if (currentIndex < surveyData.length - 1) {
      // Chưa phải câu cuối => sang câu tiếp
      setCurrentIndex(currentIndex + 1);
      setAnswer("");
    } else {
      // Đã tới câu cuối => Tính combo dựa trên budget
      const plan = generatePlanFromBudget(budget);

      // Chuyển sang màn hình 'GenPlanScreen', kèm dữ liệu 'plan'
      navigation.navigate("GenPlan", { plan, budget });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thông tin cơ bản</Text>
      <Video
        source={surveyData[currentIndex].videoFile}
        style={styles.video}
        resizeMode="cover"
        muted={true}
        onEnd={() => setVideoPlayed(true)}
        paused={videoPlayed}
      />
      <View style={styles.card}>
        <Text style={styles.question}>{surveyData[currentIndex].question}</Text>

        {/* Nếu câu hỏi dạng text */}
        {surveyData[currentIndex].type === "text" && (
          <TextInput
            style={styles.input}
            placeholder="Nhập số tiền..."
            onChangeText={(text) => setAnswer(text)}
            value={answer}
            keyboardType="numeric"
          />
        )}

        {/* Nếu câu hỏi dạng date */}
        {surveyData[currentIndex].type === "date" && (
          <TouchableOpacity onPress={() => setOpenDatePicker(true)} style={styles.datePickerButton}>
            <Text style={styles.dateText}>{date.toDateString()}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* DatePicker */}
      <DatePicker
        modal
        open={openDatePicker}
        date={date}
        mode="date"
        onConfirm={(selectedDate) => {
          setOpenDatePicker(false);
          setDate(selectedDate);
        }}
        onCancel={() => setOpenDatePicker(false)}
      />

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {currentIndex < surveyData.length - 1 ? "Tiếp theo" : "Hoàn thành"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Thongtincoban;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  video: {
    width: "90%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  card: {
    width: "90%",
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  question: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  datePickerButton: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  dateText: {
    fontSize: 16,
    color: "#000",
  },
  nextButton: {
    backgroundColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
