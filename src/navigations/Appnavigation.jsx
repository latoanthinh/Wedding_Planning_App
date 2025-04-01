import React, { useContext, useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { GuestStackNavigation, StackNavigation } from './StackNavigation'
import { BackHandler, ToastAndroid } from 'react-native'
import { AppContext } from '../AppContext'

const Appnavigation = () => {
  const { user } = useContext(AppContext)
  
  // Handle app exit when pressing back at the root of the navigation
  useEffect(() => {
    let backPressedOnceToExit = false;
    
    const handleBackPress = () => {
      // Check if we're at the root navigation level
      // This is a simplified check that assumes we have a global navigation ref
      // The actual implementation within screens will use our HOC
      
      if (backPressedOnceToExit) {
        // If already pressed once, exit the app
        BackHandler.exitApp();
        return true;
      }
      
      // First time pressing back at root, show toast
      backPressedOnceToExit = true;
      ToastAndroid.show('Nhấn back lần nữa để thoát ứng dụng', ToastAndroid.SHORT);
      
      // Reset the flag after a delay
      setTimeout(() => {
        backPressedOnceToExit = false;
      }, 2000);
      
      return true;
    };
    
    // Add the event listener for the root level handler
    // This only triggers if no other handler intercepts the back press
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
    return () => backHandler.remove();
  }, []);

  return (
    <NavigationContainer>
      {
        user ? <StackNavigation /> : <GuestStackNavigation />
      }
    </NavigationContainer>
  )
}

export default Appnavigation