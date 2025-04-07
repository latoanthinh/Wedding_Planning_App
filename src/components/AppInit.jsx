import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AppState, ToastAndroid } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserOnlineStatus, setCurrentUserStatus } from '../redux/UserActivitySlice';
import { AppContext } from '../AppContext';

const AppInit = () => {
  const dispatch = useDispatch();
  const { appLoaded, setAppLoaded } = useContext(AppContext);
  const [initAttempted, setInitAttempted] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  const userData = useSelector(state => state.login.loginData?.user);
  const userId = userData?._id;

  useEffect(() => {
    const initializeApp = async () => {
      if (!appLoaded) {
        setAppLoaded(true);
      }
      setInitAttempted(true);
    };

    if (!initAttempted) {
      initializeApp().catch(error => {
        ToastAndroid.show('Khởi tạo ứng dụng thất bại', ToastAndroid.SHORT);
      });
    }
  }, [appLoaded, initAttempted]);

  useEffect(() => {
    let isMounted = true;

    const setUserOnline = async () => {
      if (userId && isMounted) {
        try {
          dispatch(setCurrentUserStatus({ isOnline: true }));
          if (errorCount < 3) {
            await dispatch(updateUserOnlineStatus({ userId, isOnline: true })).unwrap();
          }
        } catch (error) {
          if (isMounted) {
            setErrorCount(prev => prev + 1);
            ToastAndroid.show('Không thể cập nhật trạng thái online', ToastAndroid.SHORT);
          }
        }
      }
    };

    if (userId && appLoaded) {
      setUserOnline();
    }

    return () => {
      isMounted = false;
      if (userId) {
        dispatch(setCurrentUserStatus({ isOnline: false }));
        dispatch(updateUserOnlineStatus({ userId, isOnline: false }));
      }
    };
  }, [userId, appLoaded, dispatch, errorCount]);

  const handleAppStateChange = useCallback(async (nextAppState) => {
    if (!userId) return;

    const isOnline = nextAppState === 'active';
    dispatch(setCurrentUserStatus({ isOnline }));

    if (errorCount < 3) {
      try {
        await dispatch(updateUserOnlineStatus({ userId, isOnline })).unwrap();
        if (errorCount > 0) setErrorCount(0);
      } catch (error) {
        setErrorCount(prev => prev + 1);
        ToastAndroid.show(`Không thể cập nhật trạng thái ${isOnline ? 'online' : 'offline'}`, ToastAndroid.SHORT);
      }
    }
  }, [userId, errorCount, dispatch]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [handleAppStateChange]);

  return null;
};

export default AppInit;