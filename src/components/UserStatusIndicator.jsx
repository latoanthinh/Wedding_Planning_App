import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getUserActivityStatus } from '../redux/UserActivitySlice';

const UserStatusIndicator = ({ 
  userId, 
  size = 'medium', 
  showText = false, 
  style = {}, 
  textStyle = {},
  showLastActive = false,
  fallbackValue = true
}) => {
  const dispatch = useDispatch();
  const [fetchFailed, setFetchFailed] = useState(false);
  const [lastFetchAttempt, setLastFetchAttempt] = useState(0);

  const sizes = {
    small: 8,
    medium: 12,
    large: 16
  };
  const indicatorSize = sizes[size] || sizes.medium;

  const { 
    currentUserStatus, 
    statusFetchStatus,
    error
  } = useSelector(state => state.userActivity);

  // Fetch status function
  const fetchStatus = async () => {
    if (!userId) return;
    try {
      setLastFetchAttempt(Date.now());
      await dispatch(getUserActivityStatus(userId)).unwrap();
      setFetchFailed(false);
    } catch (err) {
      setFetchFailed(true);
    }
  };

  // Initial fetch and retry logic
  useEffect(() => {
    fetchStatus();

    // Retry logic only when fetch fails
    let retryTimer;
    if (fetchFailed && Date.now() - lastFetchAttempt > 30000) {
      retryTimer = setTimeout(fetchStatus, 5000);
    }

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [userId, dispatch]); // Only depend on userId and dispatch

  // Separate effect for handling retries
  useEffect(() => {
    let retryTimer;
    if (fetchFailed && Date.now() - lastFetchAttempt > 30000) {
      retryTimer = setTimeout(fetchStatus, 5000);
    }
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [fetchFailed, lastFetchAttempt]); // Depend on fetchFailed and lastFetchAttempt

  if (!userId) {
    return null;
  }

  if (statusFetchStatus === 'loading' && !fetchFailed) {
    return (
      <View style={[styles.container, style]}>
        <View style={[
          styles.indicator, 
          styles.loading,
          { width: indicatorSize, height: indicatorSize, borderRadius: indicatorSize / 2 }
        ]} />
        {showText && (
          <Text style={[styles.text, textStyle]}>Đang tải...</Text>
        )}
      </View>
    );
  }

  let isOnline = fallbackValue;
  let inactiveTimeFormatted = "không xác định";
  
  if (currentUserStatus && !fetchFailed) {
    isOnline = currentUserStatus.isOnline;
    inactiveTimeFormatted = currentUserStatus.inactiveTimeFormatted;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={[
        styles.indicator, 
        isOnline ? styles.online : styles.offline,
        fetchFailed && styles.fallback,
        { width: indicatorSize, height: indicatorSize, borderRadius: indicatorSize / 2 }
      ]} />
      
      {showText && (
        <Text style={[styles.text, fetchFailed && styles.fallbackText, textStyle]}>
          {isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
          {fetchFailed ? ' (tạm thời)' : ''}
        </Text>
      )}
      
      {showLastActive && !isOnline && !fetchFailed && (
        <Text style={[styles.lastActiveText, textStyle]}>
          Hoạt động cách đây {inactiveTimeFormatted}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#9E9E9E',
  },
  loading: {
    backgroundColor: '#FFC107',
  },
  fallback: {
    borderWidth: 1,
    borderColor: '#ccc',
    opacity: 0.7,
  },
  text: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  fallbackText: {
    fontStyle: 'italic',
    opacity: 0.8,
  },
  lastActiveText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default UserStatusIndicator;