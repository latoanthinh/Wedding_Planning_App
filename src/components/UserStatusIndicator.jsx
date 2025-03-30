import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getUserActivityStatus } from '../redux/UserActivitySlice';

/**
 * Component to display user online status
 * @param {Object} props - Component props
 * @param {string} props.userId - User ID to check status for
 * @param {string} props.size - Size of the indicator (small, medium, large)
 * @param {boolean} props.showText - Whether to show the status text
 * @param {Object} props.style - Additional style for the container
 * @param {Object} props.textStyle - Additional style for the text
 * @param {boolean} props.fallbackValue - Fallback online status if API fails (default: true)
 */
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
  
  // Status sizes
  const sizes = {
    small: 8,
    medium: 12,
    large: 16
  };
  
  // Get indicator size
  const indicatorSize = sizes[size] || sizes.medium;
  
  // Get user status from Redux store
  const { 
    currentUserStatus, 
    statusFetchStatus,
    error
  } = useSelector(state => state.userActivity);
  
  // Fetch user status on mount and set retry on failure
  useEffect(() => {
    const fetchStatus = async () => {
      if (userId) {
        try {
          setLastFetchAttempt(Date.now());
          await dispatch(getUserActivityStatus(userId)).unwrap();
          setFetchFailed(false);
        } catch (err) {
          console.log(`Status fetch failed for user ${userId}, using fallback:`, err);
          setFetchFailed(true);
        }
      }
    };
    
    fetchStatus();
    
    // Set up retry timer if fetch failed
    let retryTimer;
    if (fetchFailed) {
      // Only retry if last attempt was more than 30 seconds ago
      const timeSinceLastAttempt = Date.now() - lastFetchAttempt;
      if (timeSinceLastAttempt > 30000) {
        retryTimer = setTimeout(fetchStatus, 5000); // Retry after 5 seconds
      }
    }
    
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [userId, dispatch, fetchFailed, lastFetchAttempt]);
  
  // If no userId provided, return empty view
  if (!userId) {
    return null;
  }
  
  // If status is loading, show loading indicator
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
  
  // Use fallback if no status data or fetch failed
  let isOnline = fallbackValue;
  let inactiveTimeFormatted = "không xác định";
  
  // If we have valid status data, use it
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