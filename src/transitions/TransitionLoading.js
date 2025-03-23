// TransitionLoading.js
import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const TransitionLoading = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { nextScreen, params } = route.params || {};

  useEffect(() => {
    if (!nextScreen || !params) {
      console.error("Missing nextScreen or params in TransitionLoading");
      return;
    }

    console.log("Data received in TransitionLoading:", { nextScreen, params });
    const timer = setTimeout(() => {
      console.log("Data sent to GenPlan:", params); // Log dữ liệu trước khi gửi
      navigation.navigate(nextScreen, { ...params });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, nextScreen, params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3E2723" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF5F0",
  },
});

export default TransitionLoading;