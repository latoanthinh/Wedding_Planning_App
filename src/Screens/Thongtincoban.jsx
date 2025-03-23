import React, { useState, useEffect, useRef, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Keyboard,
  SafeAreaView,
  ScrollView,
} from "react-native";
import Sound from "react-native-sound";
import Video from "react-native-video";
import DatePicker from "react-native-date-picker";
import { useNavigation } from "@react-navigation/native";
import { AppContext } from "../AppContext";
import { useDispatch, useSelector } from "react-redux";
import { fetchKhaoSatPlans, resetKhaoSat } from "../redux/KhaoSatSlice";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

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
    question: "Chúng tôi đã gợi ý cho bạn một số combo theo khảo sát của bạn!",
    type: "info",
    ttsFile: require("../Assets/TTS/audio5.mp3"),
    videoFile: require("../Assets/Videos/video3.mp4"),
  },
];

const Thongtincoban = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({
    eventDate: new Date(),
    guestCount: "",
    budget: "",
    planLocation: "",
    userId: "",
  });
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [videoPlayed, setVideoPlayed] = useState(false);
  const [ttsPlayed, setTtsPlayed] = useState(false);

  const navigation = useNavigation();
  const { user } = useContext(AppContext);
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.khaosat);

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user && user._id) {
      setAnswers((prev) => ({ ...prev, userId: user._id }));
    }
  }, [user]);

  useEffect(() => {
    setTtsPlayed(false);
    setVideoPlayed(false);
    playTTS(surveyData[currentIndex].ttsFile);
  }, [currentIndex]);

  useEffect(() => {
    return () => {
      dispatch(resetKhaoSat());
    };
  }, [dispatch]);

  const playTTS = (ttsFile) => {
    const sound = new Sound(ttsFile, (error) => {
      if (error) {
        console.log("Error loading TTS sound", error);
        return;
      }
      sound.play((success) => {
        if (success) setTtsPlayed(true);
        else console.log("TTS playback failed");
      });
    });
    return () => sound.release();
  };

  // Thongtincoban.js (chỉ sửa phần handleNext)
const handleNext = () => {
  Keyboard.dismiss();

  const formattedBudget = Number(answers.budget.replace(/\./g, ""));

  if (currentIndex === 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (answers.eventDate < today) {
      alert("Vui lòng chọn ngày trong tương lai!");
      return;
    }
  } else if (currentIndex === 1) {
    if (!answers.guestCount || isNaN(answers.guestCount) || Number(answers.guestCount) <= 0) {
      alert("Vui lòng nhập số lượng khách hợp lệ!");
      return;
    }
  } else if (currentIndex === 2) {
    if (isNaN(formattedBudget) || formattedBudget <= 0) {
      alert("Vui lòng nhập ngân sách hợp lệ!");
      return;
    }
    if (formattedBudget < 50000000) {
      alert("Ngân sách tối thiểu là 50.000.000 VNĐ!");
      return;
    }
  }

  Animated.timing(slideAnim, {
    toValue: -screenWidth,
    duration: 300,
    useNativeDriver: true,
  }).start(() => {
    if (currentIndex < surveyData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const surveyParams = {
        eventDate: answers.eventDate.toISOString(),
        guestCount: answers.guestCount,
        budget: formattedBudget,
        userId: answers.userId,
      };
      console.log("Data sent to GenPlan:", surveyParams);

      dispatch(
        fetchKhaoSatPlans({
          planprice: formattedBudget.toString(),
          plansoluongkhach: answers.guestCount,
        })
      ).then((result) => {
        if (result.meta.requestStatus === "fulfilled") {
          navigation.navigate("GenPlan", surveyParams); // Truyền trực tiếp sang GenPlan
        } else {
          console.error("Error fetching plans:", result.payload);
          alert("Đã xảy ra lỗi khi lấy gợi ý kế hoạch. Vui lòng thử lại.");
          setCurrentIndex(currentIndex - 1);
        }
      });
    }
    slideAnim.setValue(screenWidth);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  });
};

  const isTextRequired =
    surveyData[currentIndex].type === "text" &&
    surveyData[currentIndex].question !==
      "Chúng tôi đã gợi ý cho bạn một số combo theo khảo sát của bạn!";
  let requiredValue = "";
  if (isTextRequired) {
    requiredValue =
      currentIndex === 1 ? answers.guestCount : currentIndex === 2 ? answers.budget : answers.planLocation;
  }

  const isNextDisabled =
    (isTextRequired && requiredValue.toString().trim() === "") ||
    status === "loading";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Thông tin cơ bản</Text>

        <View style={styles.videoContainer}>
          <Video
            source={surveyData[currentIndex].videoFile}
            style={styles.video}
            resizeMode="cover"
            muted={true}
            onEnd={() => setVideoPlayed(true)}
            paused={videoPlayed}
          />
        </View>

        <View style={styles.progressContainer}>
          {surveyData.map((_, index) => (
            <View
              key={index}
              style={[styles.progressDot, currentIndex === index && styles.progressDotActive]}
            />
          ))}
        </View>

        <Animated.View style={[styles.card, { transform: [{ translateX: slideAnim }] }]}>
          <Text style={styles.question}>{surveyData[currentIndex].question}</Text>

          {surveyData[currentIndex].type === "text" ? (
            <TextInput
              style={styles.input}
              placeholder="Nhập câu trả lời của bạn..."
              placeholderTextColor="#8C7F75"
              onChangeText={(text) => {
                if (surveyData[currentIndex].numericOnly) {
                  const numericText = text.replace(/[^0-9]/g, "");
                  if (surveyData[currentIndex].question.includes("Ngân sách")) {
                    const formattedText = numericText.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                    setAnswers((prev) => ({ ...prev, budget: formattedText }));
                  } else {
                    setAnswers((prev) => ({ ...prev, guestCount: numericText }));
                  }
                } else {
                  setAnswers((prev) => ({ ...prev, planLocation: text }));
                }
              }}
              value={
                currentIndex === 1
                  ? answers.guestCount
                  : currentIndex === 2
                  ? answers.budget
                  : answers.planLocation
              }
              keyboardType={surveyData[currentIndex].numericOnly ? "numeric" : "default"}
            />
          ) : surveyData[currentIndex].type === "date" ? (
            <TouchableOpacity onPress={() => setOpenDatePicker(true)} style={styles.datePickerButton}>
              <Image source={require("../Assets/Images/calendar.png")} style={styles.calendarIcon} />
              <Text style={styles.dateText}>
                {`${answers.eventDate.getDate()}/${answers.eventDate.getMonth() + 1}/${answers.eventDate.getFullYear()}`}
              </Text>
            </TouchableOpacity>
          ) : null}

          {status === "loading" && currentIndex === surveyData.length - 1 ? (
            <Text style={styles.loadingText}>Đang tải gợi ý...</Text>
          ) : (
            <TouchableOpacity
              style={[styles.nextButton, isNextDisabled && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={isNextDisabled}
            >
              <Text style={styles.buttonText}>
                {currentIndex < surveyData.length - 1 ? "Tiếp theo" : "Hoàn thành"}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        <DatePicker
          modal
          open={openDatePicker}
          date={answers.eventDate}
          mode="date"
          onConfirm={(selectedDate) => {
            setOpenDatePicker(false);
            setAnswers((prev) => ({ ...prev, eventDate: selectedDate }));
          }}
          onCancel={() => setOpenDatePicker(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Thongtincoban;

const styles = StyleSheet.create({
  loadingText: {
    textAlign: "center",
    fontSize: 18,
    color: "#3E2723",
    marginTop: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#FAF5F0",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  header: {
    fontSize: 30,
    fontFamily: "Playfair_me",
    marginBottom: 25,
    textAlign: "center",
    color: "#3E2723",
  },
  videoContainer: {
    width: "100%",
    height: screenHeight * 0.35,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D7CCC8",
    marginHorizontal: 6,
  },
  progressDotActive: {
    backgroundColor: "#3E2723",
    width: 24,
  },
  card: {
    backgroundColor: "#EFEBE9",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  question: {
    fontSize: 22,
    fontFamily: "Playfair_me",
    marginBottom: 20,
    textAlign: "center",
    color: "#000",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#8C7F75",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 18,
    marginBottom: 20,
    color: "#3E2723",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#8C7F75",
    borderRadius: 15,
    paddingVertical: 12,
    marginBottom: 20,
  },
  calendarIcon: {
    width: 28,
    height: 28,
    marginRight: 10,
    tintColor: "#4E342E",
  },
  dateText: {
    fontSize: 18,
    color: "#220000",
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Playfair_me",
  },
});