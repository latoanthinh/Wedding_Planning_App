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
  ActivityIndicator
} from "react-native";
import Sound from "react-native-sound";
import Video from "react-native-video";
import DatePicker from "react-native-date-picker";
import { useNavigation } from "@react-navigation/native";
// Đã loại bỏ các import liên quan đến API
// import { useDispatch, useSelector } from "react-redux";
// import { createPlan } from "../redux/CreatePlanSlice";
import { AppContext } from "../AppContext";

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

const Thongtincoban = (props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // State answers lưu thông tin của từng câu hỏi
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
  // Loại bỏ loading vì không còn gọi API
  // const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  // Loại bỏ dispatch và error
  // const dispatch = useDispatch();
  const { user } = useContext(AppContext);
  // const { error } = useSelector((state) => state.createplan);

  // Nếu có user, cập nhật userId vào answers
  useEffect(() => {
    if (user && user._id) {
      setAnswers((prev) => ({ ...prev, userId: user._id }));
    }
  }, [user]);

  // Animated value cho hiệu ứng slide của card
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
    // Nếu là câu hỏi về ngân sách, chuyển đổi định dạng số (loại bỏ dấu chấm)
    if (surveyData[currentIndex].question.includes("Ngân sách")) {
      setAnswers((prev) => ({
        ...prev,
        budget: Number(prev.budget.replace(/\./g, "")),
      }));
    }
    Animated.timing(slideAnim, {
      toValue: -screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (currentIndex < surveyData.length - 1) {
        setCurrentIndex(currentIndex + 1);
        // Giữ nguyên thông tin đã nhập
      } else {
        // Thay vì gọi API, chỉ điều hướng đến màn GenPlan với dữ liệu mẫu
        navigation.navigate("GenPlan", { planId: "dummyId" });
      }
      slideAnim.setValue(screenWidth);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  // Xác định các trường bắt buộc nhập (với loại "text" ngoại trừ câu "Chúng tôi đã gợi ý..." )
  const isTextRequired =
    surveyData[currentIndex].type === "text" &&
    surveyData[currentIndex].question !==
      "Chúng tôi đã gợi ý cho bạn một số combo theo khảo sát của bạn!";

  // Lấy giá trị bắt buộc dựa trên câu hỏi hiện tại
  let requiredValue = "";
  if (isTextRequired) {
    if (currentIndex === 1) requiredValue = answers.guestCount;
    else if (currentIndex === 2) requiredValue = answers.budget;
    else if (currentIndex === 3) requiredValue = answers.planLocation;
  }

  const isNextDisabled =
    (isTextRequired && requiredValue.toString().trim() === "") ||
    (surveyData[currentIndex].question.includes("Ngân sách") &&
      Number(answers.budget.toString().replace(/\./g, "")) < 50000000);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Thông tin cơ bản</Text>
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
          {surveyData[currentIndex].type === "text" ? (
            <TextInput
              style={styles.input}
              placeholder="Nhập câu trả lời của bạn..."
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
              keyboardType={
                surveyData[currentIndex].numericOnly ? "numeric" : "default"
              }
            />
          ) : surveyData[currentIndex].type === "date" ? (
            <TouchableOpacity
              onPress={() => setOpenDatePicker(true)}
              style={styles.datePickerButton}
            >
              <Image
                source={require("../Assets/Images/calendar.png")}
                style={styles.calendarIcon}
              />
              <Text style={styles.dateText}>
                {`${answers.eventDate.getDate()}/${
                  answers.eventDate.getMonth() + 1
                }/${answers.eventDate.getFullYear()}`}
              </Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[styles.nextButton, isNextDisabled && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={isNextDisabled /* || loading */}  // Loading đã loại bỏ
          >
            {/* Nếu có loading, bạn có thể hiển thị ActivityIndicator, ở đây ta bỏ qua */}
            <Text style={styles.buttonText}>
              {currentIndex < surveyData.length - 1 ? "Tiếp theo" : "Hoàn thành"}
            </Text>
          </TouchableOpacity>
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
        {/* Loại bỏ thông báo lỗi vì không còn API */}
        {/* {error && <Text style={styles.errorText}>{error}</Text>} */}
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
    width: 10,
    height: 10,
    borderRadius: 5,
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
    borderRadius: 10,
    backgroundColor: "#fff",
    fontSize: 18,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ced4da",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarIcon: {
    width: 24,
    height: 24,
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
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 20,
    alignSelf: "center",
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginVertical: 12,
  },
  optionButton: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginVertical: 8,
    width: "45%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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
    marginTop: 6,
    textAlign: "center",
  },
});
