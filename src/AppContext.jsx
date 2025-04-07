import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AppState, ToastAndroid } from 'react-native';
import { updateUserOnlineStatus, setCurrentUserStatus } from './redux/UserActivitySlice';
import { connectSocketToAppContext } from './utils/socketAppContextIntegration';
import socketService from './utils/socketService';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [appLoaded, setAppLoaded] = useState(false);
    const [theme, setTheme] = useState('light');
    const [appState, setAppState] = useState(AppState.currentState);
    const contextValueRef = useRef(null);

    useEffect(() => {
        contextValueRef.current = {
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
            appState,
        };

        console.log('AppContext useEffect triggered with user:', user ? user.name : 'No user');
        connectSocketToAppContext(contextValueRef.current);
    }, [user]);

    useEffect(() => {
        const checkUser = async () => {
            try {
                setIsLoading(true);
                const isLoggedOut = await AsyncStorage.getItem('isLoggedOut');
                if (isLoggedOut === 'true') {
                    setUser(null);
                    return;
                }

                const userData = await AsyncStorage.getItem('userData');
                if (userData) {
                    const parsedUserData = JSON.parse(userData);
                    setUser(parsedUserData);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Lỗi kiểm tra user:', error);
                ToastAndroid.show('Không thể kiểm tra dữ liệu người dùng', ToastAndroid.SHORT);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkUser();
    }, []);

    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            async (config) => {
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    console.log('Phiên đăng nhập hết hạn, ngắt kết nối socket');
                    socketService.disconnect();
                    await AsyncStorage.multiRemove(['token', 'userData']);
                    setUser(null);
                    ToastAndroid.show('Phiên đăng nhập hết hạn', ToastAndroid.SHORT);
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    const login = useCallback(async (userData, token) => {
        setIsLoading(true);
        try {
            await AsyncStorage.multiSet([
                ['userData', JSON.stringify(userData)],
                ['token', token],
            ]);
            await AsyncStorage.setItem('isLoggedOut', 'false');
            setUser(userData);
            ToastAndroid.show('Đăng nhập thành công', ToastAndroid.SHORT);
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            ToastAndroid.show('Đăng nhập thất bại', ToastAndroid.SHORT);
            throw new Error('Login failed');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            console.log('Đăng xuất, ngắt kết nối socket');
            socketService.disconnect();

            if (user?._id) {
                store.dispatch(setCurrentUserStatus({
                    isOnline: false,
                    lastActive: new Date().toISOString(),
                }));
                await store.dispatch(updateUserOnlineStatus({
                    userId: user._id,
                    isOnline: false,
                })).unwrap();
            }

            const rememberMe = await AsyncStorage.getItem('rememberMe');
            const keysToRemove = ['token', 'userData'];
            if (rememberMe !== 'true') {
                keysToRemove.push('savedEmail', 'savedPassword', 'rememberMe');
            }

            await AsyncStorage.multiRemove(keysToRemove);
            await AsyncStorage.setItem('isLoggedOut', 'true');
            setUser(null);
            ToastAndroid.show('Đăng xuất thành công', ToastAndroid.SHORT);
            return true;
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
            ToastAndroid.show('Đăng xuất thất bại, thử lại sau', ToastAndroid.SHORT);
            const rememberMe = await AsyncStorage.getItem('rememberMe');
            const keysToRemove = ['token', 'userData'];
            if (rememberMe !== 'true') {
                keysToRemove.push('savedEmail', 'savedPassword', 'rememberMe');
            }
            await AsyncStorage.multiRemove(keysToRemove);
            await AsyncStorage.setItem('isLoggedOut', 'true');
            setUser(null);
            return true;
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const toggleTheme = useCallback(async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        await AsyncStorage.setItem('theme', newTheme);
    }, [theme]);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('theme');
                if (savedTheme) {
                    setTheme(savedTheme);
                }
            } catch (error) {
                ToastAndroid.show('Không thể tải theme', ToastAndroid.SHORT);
            }
        };

        loadTheme();
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', setAppState);
        return () => subscription.remove();
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
        appState,
    };

    return (
        <AppContext.Provider value={contextValue}>
            <Provider store={store}>
                {children}
            </Provider>
        </AppContext.Provider>
    );
};