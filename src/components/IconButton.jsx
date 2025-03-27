import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * A reusable icon button component
 * 
 * @param {Object} props
 * @param {string} props.icon - Material icon name
 * @param {number} props.size - Icon size
 * @param {string} props.color - Icon color
 * @param {Function} props.onPress - Function to call when button is pressed
 * @param {Object} props.style - Additional style for the button
 * @param {Object} props.iconStyle - Additional style for the icon
 * @param {boolean} props.disabled - Whether the button is disabled
 * @returns {JSX.Element}
 */
const IconButton = ({ 
  icon, 
  size = 24, 
  color = '#000', 
  onPress, 
  style, 
  iconStyle,
  disabled = false
}) => {
  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Icon 
        name={icon} 
        size={size} 
        color={disabled ? '#ccc' : color} 
        style={iconStyle}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});

export default IconButton; 