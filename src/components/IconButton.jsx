import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

/**
 * A reusable icon button component
 * 
 * @param {Object} props
 * @param {string} props.icon - Material icon name
 * @param {number} props.size - Icon size
 * @param {string} props.color - Icon color
 * @param {Function} props.onPress - Function to call when button is pressed
 * @param {Object} props.style - Additional style for the button
 * @returns {JSX.Element}
 */
const IconButton = ({ 
  icon, 
  size = 24, 
  color = '#333',
  onPress,
  style
}) => {
  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <MaterialIcons name={icon} size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});

export default IconButton; 