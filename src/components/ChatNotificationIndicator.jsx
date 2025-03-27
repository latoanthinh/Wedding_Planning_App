import React, { useEffect, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { fetchChatHistory } from '../redux/ChatSlice';
import socketService from '../utils/socketService';
import { AppContext } from '../AppContext';

const ChatNotificationIndicator = () => {
  const dispatch = useDispatch();
  const { unreadCount, socketConnected } = useSelector((state) => state.chat);
  const { user } = useContext(AppContext);
  
  // Debug log
  console.log('ChatNotificationIndicator - Context user:', {
    unreadCount,
    socketConnected,
    contextUser: user ? `Found (ID: ${user._id})` : 'Not found'
  });

  // Initialize socket for receiving notifications when component mounts
  useEffect(() => {
    if (user && user._id) {
      // Initialize socket with user (if not already initialized)
      if (!socketConnected) {
        try {
          console.log('Initializing socket from ChatNotificationIndicator with user ID:', user._id);
          socketService.init(user);
          
          // Fetch chat history to count unread messages
          dispatch(fetchChatHistory(user._id));
        } catch (err) {
          console.error('Error initializing socket in ChatNotificationIndicator:', err);
        }
      }
    } else {
      console.log('Cannot initialize socket in ChatNotificationIndicator: No valid user available');
    }
  }, [user, socketConnected, dispatch]);

  // Don't render anything if there are no unread messages or no user
  if (unreadCount <= 0 || !user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  text: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default ChatNotificationIndicator; 