import { StyleSheet, Text, View, Image, TouchableOpacity, StatusBar, Animated, Dimensions } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { useNavigation } from '@react-navigation/native'

const { width, height } = Dimensions.get('window');

const Welcome = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      })
    ]).start();

    // Navigate to Intro screen after 3 seconds
    const timer = setTimeout(() => {
      navigation.navigate('Intro');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      
      <Animated.View style={[styles.lineImageLeft, { opacity: fadeAnim }]}>
        <Image source={require('../Assets/Images/Line_wellcome2.jpg')} style={styles.lineImage} resizeMode="contain" />
      </Animated.View>
      
      <Animated.View style={[
        styles.contentContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        <Image source={require('../Assets/Images/logopng.png')} style={styles.image} resizeMode="contain" />
        <Text style={styles.title}>Lập Kế Hoạch Cưới</Text>
        <Text style={styles.subtitle}>"Đơn giản hóa trải nghiệm lập kế hoạch"</Text>
      </Animated.View>
      
      <Animated.View style={[styles.lineImageRight, { opacity: fadeAnim }]}>
        <Image source={require('../Assets/Images/Line_wellcome.png')} style={styles.lineImage} resizeMode="contain" />
      </Animated.View>
    </View>
  )
}
export default Welcome

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    padding: 20,
    width: width * 0.85,
  },
  image: {
    width: 150,
    height: 95,
    marginBottom: 25,
  },
  title: {
    textAlign: 'center',
    fontSize: 42,
    fontWeight: '600',
    color: '#3D3D3D',
    marginBottom: 10,
    letterSpacing: 1,
    fontFamily: 'Playfair_me',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 18,
    color: '#8A8A8A',
    fontStyle: 'italic',
    letterSpacing: 0.5,
    fontFamily: 'Playfair_me',
  },
  lineImage: {
    width: 300,
    height: 300,
    opacity: 0.9,
  },
  lineImageLeft: {
    position: 'absolute',
    top: -50,
    right: 0,
    opacity: 0.6,
    transform: [{ rotate: '-1deg' }],
  },
  lineImageRight: {
    position: 'absolute',
    bottom: -50,
    left: 0,
    opacity: 0.6,
    transform: [{ rotate: '-1deg' }],
  },
});
