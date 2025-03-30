import React, { createContext, useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AppState } from 'react-native';
import { updateUserOnlineStatus, setCurrentUserStatus } from './redux/UserActivitySlice';

// Create Context
export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [appLoaded, setAppLoaded] = useState(false);
  const [theme, setTheme] = useState('light');
  const [appState, setAppState] = useState(AppState.currentState);
  // Other app-wide state here

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error checking user data:', error);
      }
    };

    checkUser();
  }, []);

  // Set up axios interceptors
  useEffect(() => {
    // Add request interceptor to include token
    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Error getting token for request:', error);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle errors
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          // Token expired or invalid
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('userData');
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // Clean up interceptors when component unmounts
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Login function
  const login = async (userData, token) => {
    try {
      // Save user data and token to AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('token', token);
      
      // Update context state
      setUser(userData);
    } catch (error) {
      console.error('Error logging in:', error);
      throw new Error('Login failed');
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Try to set user status to offline, but don't wait for it
      if (user && user._id) {
        try {
          console.log('Setting user offline on logout');
          
          // Use optimistic UI update first
          store.dispatch(setCurrentUserStatus({
            isOnline: false,
            lastActive: new Date().toISOString()
          }));
          
          // Then try the API call
          store.dispatch(updateUserOnlineStatus({ 
            userId: user._id, 
            isOnline: false 
          })).catch(error => {
            console.log('Failed to update offline status during logout, but continuing:', error);
          });
        } catch (error) {
          console.error('Error updating status during logout:', error);
        }
      }
      
      // Clear storage and state
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userData');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Theme functions
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    AsyncStorage.setItem('theme', newTheme);
  };

  // Load saved theme
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();
  }, []);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const contextValue = {
    user,
    setUser,
    isLoading,
    setIsLoading,
    login,
    logout,
    theme,
    toggleTheme,
    appLoaded,
    setAppLoaded,
    appState
  };

  return (
    <AppContext.Provider value={contextValue}>
      <Provider store={store}>
        {children}
      </Provider>
    </AppContext.Provider>
  );
};

