import { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'react-native';
import { 
  updateUserOnlineStatus, 
  updateUserActivity, 
  setAutoUpdateActive,
  setCurrentUserStatus 
} from '../redux/UserActivitySlice';

/**
 * Hook to manage user activity status
 * @param {Object} options - Configuration options
 * @param {number} options.updateInterval - Interval in ms to update activity status (default: 60000)
 * @param {boolean} options.autoStart - Whether to start activity monitoring automatically (default: true)
 * @returns {Object} - Functions to control activity monitoring
 */
export const useUserActivity = (options = {}) => {
  const dispatch = useDispatch();
  const autoUpdateRef = useRef(null);
  const [apiErrorCount, setApiErrorCount] = useState(0);
  
  // Default options
  const {
    updateInterval = 60000, // Update every minute by default
    autoStart = true
  } = options;
  
  // Get user from Redux store
  const userData = useSelector(state => state.login.loginData?.user);
  const userId = userData?._id;
  
  // Get current activity status from Redux store
  const {
    currentUserStatus,
    autoUpdateActive,
    lastActivityUpdate,
    statusUpdateStatus,
    activityUpdateStatus
  } = useSelector(state => state.userActivity);
  
  // Reset error count when we get a successful update
  useEffect(() => {
    if (statusUpdateStatus === 'succeeded' || activityUpdateStatus === 'succeeded') {
      setApiErrorCount(0);
    }
  }, [statusUpdateStatus, activityUpdateStatus]);
  
  // Function to update user activity timestamp
  const updateActivity = async () => {
    if (userId) {
      try {
        // Always update UI optimistically
        dispatch(setCurrentUserStatus({
          lastActive: new Date().toISOString()
        }));
        
        // Try API call
        if (apiErrorCount < 3) {  // Only attempt API calls if we haven't had too many errors
          await dispatch(updateUserActivity(userId)).unwrap();
        }
      } catch (error) {
        console.error('Error updating activity:', error);
        setApiErrorCount(prev => prev + 1);
        
        // If we've had too many errors, temporarily stop trying API calls
        if (apiErrorCount >= 3) {
          console.log('Too many API errors, temporarily using local state only');
        }
      }
    }
  };
  
  // Function to set user as online
  const setUserOnline = async () => {
    if (userId) {
      console.log('Setting user online:', userId);
      
      try {
        // Always update UI optimistically
        dispatch(setCurrentUserStatus({ isOnline: true }));
        
        // Try API call
        if (apiErrorCount < 3) {  // Only attempt API calls if we haven't had too many errors
          await dispatch(updateUserOnlineStatus({ 
            userId, 
            isOnline: true 
          })).unwrap();
        }
      } catch (error) {
        console.error('Error setting user online:', error);
        setApiErrorCount(prev => prev + 1);
      }
    }
  };
  
  // Function to set user as offline
  const setUserOffline = async () => {
    if (userId) {
      console.log('Setting user offline:', userId);
      
      try {
        // Always update UI optimistically
        dispatch(setCurrentUserStatus({ isOnline: false }));
        
        // Try API call
        if (apiErrorCount < 3) {  // Only attempt API calls if we haven't had too many errors
          await dispatch(updateUserOnlineStatus({ 
            userId, 
            isOnline: false 
          })).unwrap();
        }
      } catch (error) {
        console.error('Error setting user offline:', error);
        setApiErrorCount(prev => prev + 1);
      }
    }
  };
  
  // Start activity monitoring
  const startActivityMonitoring = () => {
    if (!autoUpdateActive && userId) {
      console.log('Starting activity monitoring for user:', userId);
      
      // Set user as online
      setUserOnline();
      
      // Update activity status at regular intervals
      autoUpdateRef.current = setInterval(() => {
        updateActivity();
      }, updateInterval);
      
      // Set autoUpdateActive flag
      dispatch(setAutoUpdateActive(true));
    }
  };
  
  // Stop activity monitoring
  const stopActivityMonitoring = () => {
    if (autoUpdateActive) {
      console.log('Stopping activity monitoring');
      
      // Clear interval
      if (autoUpdateRef.current) {
        clearInterval(autoUpdateRef.current);
        autoUpdateRef.current = null;
      }
      
      // Set user as offline
      setUserOffline();
      
      // Reset autoUpdateActive flag
      dispatch(setAutoUpdateActive(false));
    }
  };
  
  // Start monitoring when component mounts if autoStart is true
  useEffect(() => {
    if (autoStart && userId && !autoUpdateActive) {
      startActivityMonitoring();
    }
    
    return () => {
      if (autoUpdateRef.current) {
        clearInterval(autoUpdateRef.current);
      }
    };
  }, [userId, autoUpdateActive]);
  
  // Listen for app state changes to update activity status appropriately
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground
        if (userId && !autoUpdateActive) {
          startActivityMonitoring();
        } else if (userId) {
          // Just update activity without restarting monitoring
          updateActivity();
        }
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App went to background
        if (autoUpdateActive) {
          stopActivityMonitoring();
        }
      }
    };
    
    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      // Clean up subscription
      subscription.remove();
      
      // Set user as offline when unmounting (if necessary)
      if (userId && autoUpdateActive) {
        setUserOffline();
      }
    };
  }, [userId, autoUpdateActive]);
  
  return {
    isOnline: currentUserStatus?.isOnline || false,
    lastActive: currentUserStatus?.lastActive,
    inactiveTime: currentUserStatus?.inactiveTimeInSeconds,
    inactiveTimeFormatted: currentUserStatus?.inactiveTimeFormatted,
    isUsingFallback: apiErrorCount >= 3,
    startActivityMonitoring,
    stopActivityMonitoring,
    updateActivity,
    setUserOnline,
    setUserOffline,
    resetApiErrorCount: () => setApiErrorCount(0)
  };
}; 