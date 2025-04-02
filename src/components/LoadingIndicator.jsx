import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import LottieView from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * A standardized loading indicator component that can be used across the app
 * 
 * @param {Object} props
 * @param {string} [props.type='fullscreen'] - 'fullscreen', 'inline', or 'overlay'
 * @param {string} [props.text='Đang tải...'] - Text to display below the loading animation
 * @param {string} [props.size='large'] - Size of the loading indicator (small, medium, large)
 * @param {boolean} [props.useLottie=true] - Whether to use Lottie animation or ActivityIndicator
 * @param {string} [props.backgroundColor='#FBF9F6'] - Background color of the container
 * @param {object} [props.style] - Additional style for the container
 * @param {string} [props.color='#C8815F'] - Color of the ActivityIndicator (if not using Lottie)
 * @returns {React.ReactElement}
 */
const LoadingIndicator = ({
  type = 'fullscreen',
  text = 'Đang tải...',
  size = 'large',
  useLottie = true,
  backgroundColor = '#FBF9F6',
  style,
  color = '#C8815F'
}) => {
  const insets = useSafeAreaInsets();
  
  // Determine appropriate sizing based on the selected size
  const getSize = () => {
    switch (size) {
      case 'small': return { width: 60, height: 60 };
      case 'medium': return { width: 100, height: 100 };
      case 'large': 
      default: return { width: 150, height: 150 };
    }
  };
  
  // Determine ActivityIndicator size
  const getActivitySize = () => {
    switch (size) {
      case 'small': return 'small';
      case 'medium':
      case 'large':
      default: return 'large';
    }
  };

  const containerStyle = [
    {
      backgroundColor,
      paddingTop: insets.top,
      paddingBottom: insets.bottom
    },
    styles.baseContainer,
    type === 'fullscreen' && styles.fullscreenContainer,
    type === 'inline' && styles.inlineContainer,
    type === 'overlay' && styles.overlayContainer,
    style
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.loadingContent}>
        {useLottie ? (
          <LottieView
            source={require('../Assets/Animations/blackloading.json')}
            autoPlay
            loop
            style={[styles.loadingAnimation, getSize()]}
          />
        ) : (
          <ActivityIndicator size={getActivitySize()} color={color} />
        )}
        {text ? <Text style={styles.loadingText}>{text}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenContainer: {
    flex: 1,
  },
  inlineContainer: {
    paddingVertical: 20,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(251, 249, 246, 0.9)',
    zIndex: 1000,
  },
  loadingContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingAnimation: {
    width: 150,
    height: 150,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Playfair_me',
    textAlign: 'center',
  }
});

export default LoadingIndicator; 