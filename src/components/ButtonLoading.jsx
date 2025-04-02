import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * A standardized button with loading state
 * 
 * @param {Object} props
 * @param {string} props.text - Button text to display when not loading
 * @param {boolean} props.loading - Whether the button is in loading state
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {Function} props.onPress - Function to call when the button is pressed
 * @param {Object} props.style - Additional style for the button
 * @param {Object} props.textStyle - Additional style for the button text
 * @param {string} props.color - Color of the button (primary, secondary, danger, success)
 * @param {string} props.size - Size of the button (small, medium, large)
 * @returns {React.ReactElement}
 */
const ButtonLoading = ({
  text,
  loading = false,
  disabled = false,
  onPress,
  style,
  textStyle,
  color = 'primary',
  size = 'medium'
}) => {
  // Determine colors based on type
  const getColors = () => {
    switch (color) {
      case 'secondary':
        return { bg: '#5D5F82', text: '#FFFFFF' };
      case 'danger':
        return { bg: '#FF6F61', text: '#FFFFFF' };
      case 'success':
        return { bg: '#4CAF50', text: '#FFFFFF' };
      case 'primary':
      default:
        return { bg: '#C8815F', text: '#FFFFFF' };
    }
  };

  // Determine sizes based on size
  const getSizes = () => {
    switch (size) {
      case 'small':
        return { 
          button: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 15 },
          text: { fontSize: 13 },
          indicator: 'small'
        };
      case 'large':
        return { 
          button: { paddingVertical: 14, paddingHorizontal: 30, borderRadius: 30 },
          text: { fontSize: 16 },
          indicator: 'small'
        };
      case 'medium':
      default:
        return { 
          button: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25 },
          text: { fontSize: 15 },
          indicator: 'small'
        };
    }
  };

  const colors = getColors();
  const sizes = getSizes();
  
  const buttonStyles = [
    styles.button,
    { backgroundColor: colors.bg },
    sizes.button,
    disabled ? { opacity: 0.6 } : null,
    style
  ];

  const textStyles = [
    styles.text,
    { color: colors.text },
    sizes.text,
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} size={sizes.indicator} />
      ) : (
        <Text style={textStyles}>{text}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  text: {
    fontFamily: 'Playfair_me',
    fontWeight: '600',
  }
});

export default ButtonLoading; 