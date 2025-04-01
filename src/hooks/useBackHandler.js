import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { CommonActions } from '@react-navigation/native';

/**
 * Custom hook to handle hardware back button presses
 * @param {object} navigation - The navigation object from React Navigation
 * @param {string} routeName - The route name to navigate back to (e.g., 'TabNavigation')
 * @param {object} options - Additional options like specific tab to navigate to
 * @returns {void}
 */
export const useBackHandler = (navigation, routeName, options = {}) => {
  useEffect(() => {
    const backAction = () => {
      // Get the current navigation state
      const navState = navigation.getState();
      
      // Check if we need to navigate to a specific tab
      const { screen } = options;
      
      // Check if current screen is already at the routeName level
      // If routeName exists in the navigation state, that means the current screen 
      // is a child of that route and we should navigate back to it
      const routeIndex = navState.routes.findIndex(route => route.name === routeName);
      
      if (routeIndex !== -1) {
        // Navigate back to the Tab Navigator with specific screen if provided
        if (screen) {
          navigation.navigate(routeName, { screen });
        } else {
          navigation.navigate(routeName);
        }
        
        // Return true to prevent default back behavior
        return true;
      }
      
      // Let the default back behavior happen
      return false;
    };
    
    // Add event listener for hardware back press
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    
    // Clean up the event listener
    return () => backHandler.remove();
  }, [navigation, routeName, options]);
}; 