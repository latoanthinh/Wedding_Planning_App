import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useBackHandler } from '../hooks/useBackHandler';

/**
 * Wrapper component to handle hardware back button presses
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The child components to render
 * @param {string} props.routeName - The route name to navigate back to (default: 'TabNavigation')
 * @param {string} props.screen - The specific screen in the Tab Navigator to navigate to (optional)
 * @param {Object} props.style - Additional styles for the container
 */
const BackHandlerWrapper = ({ 
  children, 
  routeName = 'TabNavigation', 
  screen,
  style 
}) => {
  const navigation = useNavigation();
  
  // Use our custom hook to handle back button presses
  useBackHandler(navigation, routeName, { screen });
  
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default BackHandlerWrapper; 