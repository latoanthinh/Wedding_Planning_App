import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

const TransitionLoading = ({ route, navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace(route.params.nextScreen, {
        answers: route.params.params.answers
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../Assets/Animations/loading1.json')}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF5F0',
  },
  animation: {
    width: 200,
    height: 200,
  },
});

export default TransitionLoading;