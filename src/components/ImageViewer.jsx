import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ImageViewer = ({ route, navigation }) => {
  const { imageUri } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Animation values
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  
  // Tracks if the image is being zoomed
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Handle double tap to zoom
  const doubleTapTimer = useRef(null);
  const doubleTapRef = useRef(false);
  const lastTapRef = useRef(0);
  
  // Pan responder for gesture handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only allow panning if zoomed in or trying to do a horizontal swipe
        return isZoomed || Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: (evt) => {
        // Double tap detection
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        
        if (lastTapRef.current && (now - lastTapRef.current) < DOUBLE_TAP_DELAY) {
          // Double tap detected
          doubleTapRef.current = true;
          clearTimeout(doubleTapTimer.current);
          
          // Toggle zoom
          if (isZoomed) {
            // Zoom out
            Animated.parallel([
              Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
                friction: 6,
              }),
              Animated.spring(pan, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: true,
                friction: 6,
              }),
            ]).start();
            setIsZoomed(false);
          } else {
            // Zoom in
            Animated.spring(scale, {
              toValue: 2.5,
              useNativeDriver: true,
              friction: 6,
            }).start();
            setIsZoomed(true);
          }
        } else {
          // Single tap - start timer to detect if it becomes a double tap
          lastTapRef.current = now;
          doubleTapRef.current = false;
          doubleTapTimer.current = setTimeout(() => {
            if (!doubleTapRef.current) {
              // If no double tap was detected, just close the viewer
              navigation.goBack();
            }
          }, DOUBLE_TAP_DELAY);
        }
        
        // Update animation state
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (evt, gestureState) => {
        // If zoomed in, allow panning the image
        if (isZoomed) {
          Animated.event(
            [null, { dx: pan.x, dy: pan.y }],
            { useNativeDriver: false }
          )(evt, gestureState);
        } else {
          // If not zoomed and swiping horizontally, add resistance for natural feel
          const maxDx = SCREEN_WIDTH / 3;
          const dx = Math.min(Math.max(gestureState.dx, -maxDx), maxDx);
          pan.x.setValue(dx / 3); // Add resistance factor
          
          // Fade out as user swipes
          const opacity = Math.max(1 - Math.abs(dx) / (SCREEN_WIDTH / 2), 0.5);
          pan.y.setValue(0); // No vertical movement when not zoomed
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (isZoomed) {
          // When zoomed, reset offset
          pan.flattenOffset();
          
          // Limit panning bounds when zoomed
          const maxPanX = (SCREEN_WIDTH * scale._value - SCREEN_WIDTH) / 2;
          const maxPanY = (SCREEN_HEIGHT * scale._value - SCREEN_HEIGHT) / 2;
          
          const clampedX = Math.min(Math.max(pan.x._value, -maxPanX), maxPanX);
          const clampedY = Math.min(Math.max(pan.y._value, -maxPanY), maxPanY);
          
          Animated.spring(pan, {
            toValue: { x: clampedX, y: clampedY },
            useNativeDriver: true,
            friction: 6,
          }).start();
        } else {
          // If not zoomed and significant horizontal swipe, close the image viewer
          if (Math.abs(gestureState.dx) > 100) {
            navigation.goBack();
          } else {
            // Reset position if the swipe wasn't enough to close
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: true,
              friction: 6,
            }).start();
          }
        }
      },
      onPanResponderTerminate: () => {
        pan.flattenOffset();
        
        // Reset to initial position
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          friction: 6,
        }).start();
      },
    })
  ).current;
  
  if (!imageUri) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FFF" />
          <Animated.Text style={styles.errorText}>Không thể tải hình ảnh</Animated.Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="rgba(0,0,0,0.7)" barStyle="light-content" />
      
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: pan.x.interpolate({
              inputRange: [-SCREEN_WIDTH / 3, 0, SCREEN_WIDTH / 3],
              outputRange: [0.7, 1, 0.7],
              extrapolate: 'clamp',
            }),
          },
        ]}
      />
      
      {/* Image container */}
      <Animated.View
        style={[
          styles.imageContainer,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: scale },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
        
        {error && (
          <View style={styles.errorOverlay}>
            <Ionicons name="alert-circle-outline" size={48} color="#FFF" />
            <Animated.Text style={styles.errorText}>Lỗi tải hình ảnh</Animated.Text>
          </View>
        )}
      </Animated.View>
      
      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
      
      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={28} color="#FFF" />
      </TouchableOpacity>
      
      {/* Info text */}
      <View style={styles.infoContainer}>
        <Animated.Text style={styles.infoText}>
          Nhấn đôi để phóng to • Vuốt để thoát
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    fontFamily: 'Playfair_me',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  infoText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontFamily: 'Playfair_me',
  },
});

export default ImageViewer; 