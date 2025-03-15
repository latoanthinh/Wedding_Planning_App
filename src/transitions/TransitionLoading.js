import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import LottieView from "lottie-react-native"; // Nếu muốn dùng animation

const TransitionLoading = ({ route, navigation }) => {
  const { nextScreen, params } = route.params;

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate(nextScreen, params);
    }, 2000); // Chuyển tiếp sau 2 giây

    return () => clearTimeout(timer);
  }, [navigation, nextScreen, params]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Đang tải gợi ý của bạn...</Text>
      {/* Optional: Thêm animation */}
      <LottieView
        source={require("../Assets/Animations/loading.json")} // Đường dẫn đến file animation
        autoPlay
        loop
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  text: {
    fontSize: 20,
    color: "#333",
    marginBottom: 20,
  },
  animation: {
    width: 200,
    height: 200,
  },
});

export default TransitionLoading;