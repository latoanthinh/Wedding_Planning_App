import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image, ActivityIndicator
} from "react-native";
import Sound from "react-native-sound";
import Video from "react-native-video";
import DatePicker from "react-native-date-picker";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from 'react-redux';
import { createPlan } from '../redux/CreatePlanSlice';
import { AppContext } from "../AppContext";

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
    question: "Địa điểm tổ chức đám cưới?",
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

const Thongtincoban = (props) => {

  // Dùng chung một state 'answer' cho các câu hỏi dạng text
  const [answers, setAnswers] = useState({
    eventDate: new Date(),
    guestCount: "",
    budget: "",
    planLocation: "",
    userId: "",
  });

  useEffect(() => {
    if (user && user._id) {
      setAnswers((prev) => ({ ...prev, userId: user._id }));
    }

  }, [user]); // Cập nhật userId khi user thay đổi


  const { user } = useContext(AppContext);
  const [videoPlayed, setVideoPlayed] = useState(false);
  const [ttsPlayed, setTtsPlayed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const { navigation } = props;
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.createplan);
  






  const handleNext = () => {
    
    if (currentIndex < surveyData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      dispatch(createPlan({
        eventDate: answers.eventDate.toISOString(),
        guestCount: answers.guestCount,
        budget: answers.budget,
        planLocation: answers.planLocation,
        userId: answers.userId
      }))
        .unwrap()
        .then((data) => {
          alert("Tạo kế hoạch thành công!");
          navigation.navigate("GenPlan", { planId: data.plan._id });
        })
        .catch((err) => alert("Lỗi: " + err));
    }
  };
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

  // const handleNext = () => {
  //   if (surveyData[currentIndex].question.includes("Ngân sách")) {
  //     setBudget(Number(answer));
  //   }
  //   if (currentIndex < surveyData.length - 1) {
  //     setCurrentIndex(currentIndex + 1);
  //     setAnswer("");
  //   } else {
  //     const plan = generatePlanFromBudget(budget);
  //     navigation.navigate("GenPlan", { plan, budget });
  //   }
  // };

  // Nếu là câu hỏi về ngân sách, disable nút khi answer chưa được nhập
  // const isNextDisabled =
  //   surveyData[currentIndex].question.includes("Ngân sách") &&
  //   answer.trim() === "";

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
        {surveyData[currentIndex].type === "text" && (
          <TextInput
            style={styles.input}
            placeholder="Nhập thông tin"
            value={
              currentIndex === 1
                ? answers.guestCount
                : currentIndex === 2
                ? answers.budget
                : answers.planLocation
            }
            onChangeText={(text) => setAnswers({
              ...answers,
              [currentIndex === 1 ? "guestCount" : currentIndex === 2 ? "budget" : "planLocation"]: text
            })}
          />
        )}
        {surveyData[currentIndex].type === "date" && (
          <TouchableOpacity
            onPress={() => setOpenDatePicker(true)}
            style={styles.datePickerButton}
          >
            <Text style={styles.dateText}>{answers.eventDate.toDateString()}</Text>
          </TouchableOpacity>
        )}
      </View>

      <DatePicker
        modal
        open={openDatePicker}
        date={answers.eventDate}
        mode="date"
        onConfirm={(selectedDate) => {
          setOpenDatePicker(false);
          setAnswers(prev => ({ ...prev, eventDate: selectedDate }));
        }}
        onCancel={() => setOpenDatePicker(false)}
      />

    <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Tiếp theo</Text>}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
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
    alignSelf: "center",
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0", // Màu nền nhẹ
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
  },
  nextButton: {
    backgroundColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
