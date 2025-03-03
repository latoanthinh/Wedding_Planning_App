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

const Thongtincoban = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({
    eventDate: new Date(),
    guestCount: "",
    budget: "",
    planLocation: "",
  });
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [videoPlayed, setVideoPlayed] = useState(false);
  const [answer, setAnswer] = useState("");
  const navigation = useNavigation();
  
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
        if (!success) {
          console.log("TTS playback failed");
        }
      });
    });
    return () => sound.release();
  };

  const handleNext = () => {
    Keyboard.dismiss();
    
    if (currentIndex === surveyData.length - 1) {
      const plan = generatePlanFromBudget(answers.budget);
      navigation.navigate("GenPlan", { plan });
    } else {
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(currentIndex + 1);
        setAnswer("");
        slideAnim.setValue(screenWidth);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  const isTextRequired = surveyData[currentIndex].type === "text" && surveyData[currentIndex].question !== "Chúng tôi đã gợi ý cho bạn một số combo theo khảo sát của bạn!";
  
  let isNextDisabled = isTextRequired && answer.trim() === "";

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
          <Text style={styles.question}>{surveyData[currentIndex].question}</Text>
          
          {surveyData[currentIndex].type === "text" ? (
            <TextInput
              style={styles.input}
              placeholder="Nhập câu trả lời của bạn..."
              onChangeText={setAnswer}
              value={answer}
              keyboardType={surveyData[currentIndex].numericOnly ? "numeric" : "default"}
            />
          ) : surveyData[currentIndex].type === "date" ? (
            <TouchableOpacity onPress={() => setOpenDatePicker(true)} style={styles.datePickerButton}>
              <Image
                source={require("../Assets/Images/calendar.png")}
                style={styles.calendarIcon}
              />
              <Text style={styles.dateText}>{`${answers.eventDate.getDate()}/${answers.eventDate.getMonth() + 1}/${answers.eventDate.getFullYear()}`}</Text>
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
          date={answers.eventDate}
          mode="date"
          onConfirm={(selectedDate) => {
            setOpenDatePicker(false);
            setAnswers((prev) => ({ ...prev, eventDate: selectedDate }));
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
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ced4da",
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
});