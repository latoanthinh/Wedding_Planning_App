import React, { useEffect, useState, useContext } from 'react';
import { AppState } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserOnlineStatus, setCurrentUserStatus } from '../redux/UserActivitySlice';
import { AppContext } from '../AppContext';

/**
 * Component that handles app-wide initialization
 * No UI is rendered by this component
 */
const AppInit = () => {
  const dispatch = useDispatch();
  const { appLoaded, setAppLoaded } = useContext(AppContext);
  const [initAttempted, setInitAttempted] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  // Get user from Redux store
  const userData = useSelector(state => state.login.loginData?.user);
  const userId = userData?._id;

  // Handle app initialization
  useEffect(() => {
    const initializeApp = async () => {
      console.log('Initializing app...');
      
      // Set app as loaded after initialization
      if (!appLoaded) {
        setAppLoaded(true);
      }
      
      setInitAttempted(true);
    };
    
    if (!initAttempted) {
      initializeApp().catch(error => {
        console.error('Error initializing app:', error);
      });
    }
  }, [appLoaded, initAttempted]);
  
  // Set user as online when the app starts if we have a valid user
  useEffect(() => {
    const setUserOnline = async () => {
      if (userId) {
        try {
          console.log('Setting user online on app init:', userId);
          
          // Always update UI optimistically
          dispatch(setCurrentUserStatus({ isOnline: true }));
          
          // Only try API if error count isn't too high
          if (errorCount < 3) {
            await dispatch(updateUserOnlineStatus({ 
              userId, 
              isOnline: true 
            })).unwrap();
          }
        } catch (error) {
          console.error('Error setting user online on app init:', error);
          setErrorCount(prev => prev + 1);
        }
      }
    };
    
    if (userId && appLoaded) {
      setUserOnline();
    }
    
    // Set user as offline when the component unmounts
    return () => {
      if (userId) {
        try {
          console.log('Setting user offline on app exit');
          dispatch(setCurrentUserStatus({ isOnline: false }));
          
          // This may not always execute reliably on app termination
          dispatch(updateUserOnlineStatus({ 
            userId, 
            isOnline: false 
          }));
        } catch (error) {
          console.error('Error setting user offline on app exit:', error);
        }
      }
    };
  }, [userId, appLoaded]);
  
  // Listen for app state changes to update user online status
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (!userId) return;
      
      if (nextAppState === 'active') {
        // App came to foreground
        try {
          console.log('App active, setting user online');
          
          // Always update UI optimistically
          dispatch(setCurrentUserStatus({ isOnline: true }));
          
          // Only try API if error count isn't too high
          if (errorCount < 3) {
            await dispatch(updateUserOnlineStatus({ 
              userId, 
              isOnline: true 
            })).unwrap();
            
            // Reset error count on success
            if (errorCount > 0) {
              setErrorCount(0);
            }
          }
        } catch (error) {
          console.error('Error setting user online on app active:', error);
          setErrorCount(prev => prev + 1);
        }
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App went to background
        try {
          console.log('App inactive, setting user offline');
          
          // Always update UI optimistically
          dispatch(setCurrentUserStatus({ isOnline: false }));
          
          // Only try API if error count isn't too high
          if (errorCount < 3) {
            await dispatch(updateUserOnlineStatus({
              userId,
              isOnline: false
            })).unwrap();
          }
        } catch (error) {
          console.error('Error setting user offline on app inactive:', error);
          setErrorCount(prev => prev + 1);
        }
      }
    };
    
    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      // Clean up subscription
      subscription.remove();
    };
  }, [userId, errorCount]);
  
  // This component doesn't render anything
  return null;
};

export default AppInit; 