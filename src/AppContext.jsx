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

  useEffect(() => {
    const checkUser = async () => {
      try {
        const isLoggedOut = await AsyncStorage.getItem('isLoggedOut');
        if (isLoggedOut === 'true') {
          console.log('Vừa đăng xuất, không khôi phục user');
          setUser(null);
          return;
        }

        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          console.log('Khôi phục user từ AsyncStorage');
          setUser(JSON.parse(userData));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking user data:', error);
        setUser(null);
      }
    };

    checkUser();
  }, []);

  useEffect(() => {
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
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response && error.response.status === 401) {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('userData');
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const login = async (userData, token) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('token', token);
      setUser(userData);
    } catch (error) {
      console.error('Error logging in:', error);
      throw new Error('Login failed');
    }
  };

  const logout = async () => {
    try {
      console.log('Bắt đầu quá trình đăng xuất...');

      if (user && user._id) {
        try {
          console.log('Setting user offline on logout');
          store.dispatch(setCurrentUserStatus({
            isOnline: false,
            lastActive: new Date().toISOString()
          }));
          await store.dispatch(updateUserOnlineStatus({ 
            userId: user._id, 
            isOnline: false 
          })).unwrap();
          console.log('Updated offline status');
        } catch (error) {
          console.error('Error updating status during logout:', error);
        }
      }

      // Kiểm tra trạng thái "Ghi nhớ"
      const rememberMe = await AsyncStorage.getItem('rememberMe');
      console.log('Trạng thái rememberMe:', rememberMe);

      // Danh sách các key sẽ xóa
      const keysToRemove = ['token', 'userData'];

      // Nếu không chọn "Ghi nhớ", xóa thêm thông tin tài khoản
      if (rememberMe !== 'true') {
        keysToRemove.push('savedEmail', 'savedPassword', 'rememberMe');
      }

      console.log('Xóa các key từ AsyncStorage:', keysToRemove);
      await AsyncStorage.multiRemove(keysToRemove);
      await AsyncStorage.setItem('isLoggedOut', 'true');

      console.log('Đặt user state thành null...');
      setUser(null);

      console.log('Đăng xuất hoàn tất');
      return true;
    } catch (error) {
      console.error('Error logging out:', error);
      // Xử lý lỗi: vẫn đảm bảo xóa dữ liệu cần thiết
      const rememberMe = await AsyncStorage.getItem('rememberMe');
      const keysToRemove = ['token', 'userData'];
      if (rememberMe !== 'true') {
        keysToRemove.push('savedEmail', 'savedPassword', 'rememberMe');
      }
      await AsyncStorage.multiRemove(keysToRemove);
      await AsyncStorage.setItem('isLoggedOut', 'true');
      setUser(null);
      return true;
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    AsyncStorage.setItem('theme', newTheme);
  };

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