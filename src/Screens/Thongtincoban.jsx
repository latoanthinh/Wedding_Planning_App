import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Keyboard
} from "react-native";
import Sound from "react-native-sound";
import Video from "react-native-video";
import DatePicker from "react-native-date-picker";
import { useNavigation } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;

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
    numericOnly: true,
    ttsFile: require("../Assets/TTS/audio2.mp3"),
    videoFile: require("../Assets/Videos/video2.mp4"),
  },
  {
    question: "Ngân sách dự kiến cho đám cưới?",
    type: "text",
    numericOnly: true,
    ttsFile: require("../Assets/TTS/audio3.mp3"),
    videoFile: require("../Assets/Videos/video3.mp4"),
  },
  {
    question: "Bạn muốn tổ chức đám cưới của mình ở đâu?",
    type: "text",
    numericOnly: false,
    ttsFile: require("../Assets/TTS/audio4.mp3"),
    videoFile: require("../Assets/Videos/video3.mp4"),
  },
  {
    question: "Chúng tôi đã gợi ý cho bạn một số combo theo khảo sát của bạn!",
    type: "info",
    ttsFile: require("../Assets/TTS/audio5.mp3"),
    videoFile: require("../Assets/Videos/video3.mp4"),
  },
];

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

const generatePlanFromBudget = (budget) => {
  let leftover = budget;
  const plan = [];

  Object.keys(productsData).forEach((categoryKey) => {
    const items = productsData[categoryKey];
    items.sort((a, b) => a.price - b.price);
    let chosenItem = null;
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].price <= leftover) {
        chosenItem = items[i];
        leftover -= chosenItem.price;
        break;
      }
    }
    if (!chosenItem) {
      const cheapest = items[0];
      chosenItem = { ...cheapest, name: `${cheapest.name} (not enough budget)` };
    }
    plan.push({ category: categoryKey.toUpperCase(), ...chosenItem });
  });
  return plan;
};

const Thongtincoban = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [date, setDate] = useState(new Date());
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [budget, setBudget] = useState(0);
  const [videoPlayed, setVideoPlayed] = useState(false);
  const [ttsPlayed, setTtsPlayed] = useState(false);
  const navigation = useNavigation();


  const locationOptions = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ"];


  const slideAnim = useRef(new Animated.Value(0)).current;

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
    Keyboard.dismiss();
    if (surveyData[currentIndex].question.includes("Ngân sách")) {
      setBudget(Number(answer.replace(/\./g, "")));
    }
    Animated.timing(slideAnim, {
      toValue: -screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (currentIndex < surveyData.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setAnswer("");
        slideAnim.setValue(screenWidth);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        const plan = generatePlanFromBudget(budget);
        navigation.navigate("GenPlan", { plan, budget });
      }
    });
  };

  
  const isTextRequired =
    surveyData[currentIndex].type === "text" &&
    surveyData[currentIndex].question !== "Chúng tôi đã gợi ý cho bạn một số combo theo khảo sát của bạn!";

  const isNextDisabled =
    (isTextRequired && answer.trim() === "") ||
    (surveyData[currentIndex].question.includes("Ngân sách") &&
      Number(answer.replace(/\./g, "")) < 50000000);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Khảo sát</Text>
      <View style={styles.topContainer}>
        <Video
          source={surveyData[currentIndex].videoFile}
          style={styles.video}
          resizeMode="cover"
          muted={true}
          onEnd={() => setVideoPlayed(true)}
          paused={videoPlayed}
        />
      </View>
      <View style={styles.bottomContainer}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {surveyData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                currentIndex === index && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
        <Animated.View style={[styles.card, { transform: [{ translateX: slideAnim }] }]}>
          <Text style={styles.question}>
            {surveyData[currentIndex].question}
          </Text>
          {surveyData[currentIndex].type === "text" &&
            surveyData[currentIndex].question === "Bạn muốn tổ chức đám cưới của mình ở đâu?" ? (
              <View style={styles.optionsContainer}>
                {locationOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      answer === option && styles.optionButtonSelected,
                    ]}
                    onPress={() => setAnswer(option)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        answer === option && styles.optionButtonTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
          ) : surveyData[currentIndex].type === "text" ? (
            <View>
              <TextInput
                style={styles.input}
                placeholder="Nhập câu trả lời của bạn..."
                onChangeText={(text) => {
                  if (surveyData[currentIndex].numericOnly) {
                    const numericText = text.replace(/[^0-9]/g, "");
                    if (surveyData[currentIndex].question.includes("Ngân sách")) {
                      const formattedText = numericText.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                      setAnswer(formattedText);
                    } else {
                      setAnswer(numericText);
                    }
                  } else {
                    setAnswer(text);
                  }
                }}
                value={answer}
                keyboardType={
                  surveyData[currentIndex].numericOnly ? "numeric" : "default"
                }
              />
              {surveyData[currentIndex].question.includes("Ngân sách") &&
                answer.trim() !== "" &&
                Number(answer.replace(/\./g, "")) < 50000000 && (
                  <Text style={styles.errorText}>
                    Số tiền tối thiểu là 50.000.000
                  </Text>
              )}
              {isTextRequired && answer.trim() === "" && (
                <Text style={styles.errorText}>Trường này là bắt buộc</Text>
              )}
            </View>
          ) : surveyData[currentIndex].type === "date" ? (
            <TouchableOpacity
              onPress={() => setOpenDatePicker(true)}
              style={styles.datePickerButton}
            >
              <Image
                source={require("../Assets/Images/calendar.png")}
                style={styles.calendarIcon}
              />
              <Text style={styles.dateText}>{`${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`}</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[styles.nextButton, isNextDisabled && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={isNextDisabled}
          >
            <Text style={styles.buttonText}>
              {currentIndex < surveyData.length - 1 ? "Tiếp theo" : "Hoàn thành"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
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
      </View>
    </View>
  );
};

export default Thongtincoban;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  topContainer: {
    height: "40%",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    overflow: "hidden",
  },
  bottomContainer: {
    height: "60%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 20,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: "#333",
  },
  card: {
    width: "100%",
    height: "50%",
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
    justifyContent: "space-between",
  },
  question: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#555",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 18,
  },
  currencyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ced4da",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  calendarIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: "#333",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    textAlign: "center",
  },
  nextButton: {
    backgroundColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: "center",
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  optionButton: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 8,
    width: "45%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  optionButtonSelected: {
    backgroundColor: "#333",
  },
  optionButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  optionButtonTextSelected: {
    color: "#fff",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
  },
});
