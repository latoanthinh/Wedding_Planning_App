import React, { useContext, useEffect, useCallback, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GuestStackNavigation, StackNavigation } from './StackNavigation';
import { BackHandler, ToastAndroid, ActivityIndicator, View, StyleSheet } from 'react-native';
import { AppContext } from '../AppContext';

const Appnavigation = () => {
    const { user } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(true);

    // Chờ user được cập nhật
    useEffect(() => {
        const checkUser = async () => {
            setTimeout(() => {
                setIsLoading(false);
            }, 500); // Đợi 500ms để đảm bảo user được cập nhật
        };
        checkUser();
    }, []);

    const handleBackPress = useCallback(() => {
        let backPressedOnceToExit = false;
        let timeoutId = null;

        return () => {
            if (backPressedOnceToExit) {
                BackHandler.exitApp();
                return true;
            }

            backPressedOnceToExit = true;
            ToastAndroid.show('Nhấn back lần nữa để thoát ứng dụng', ToastAndroid.SHORT);

            timeoutId = setTimeout(() => {
                backPressedOnceToExit = false;
            }, 2000);

            return true;
        };
    }, []);

    useEffect(() => {
        const backHandlerFn = handleBackPress();
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backHandlerFn);

        return () => {
            backHandler.remove();
        };
    }, [handleBackPress]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#200000" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? <StackNavigation /> : <GuestStackNavigation />}
        </NavigationContainer>
    );
};

export default Appnavigation;

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F9FC',
    },
});