import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { fetchChatHistory, sendMessage, resetSendStatus } from '../redux/ChatSlice';
import socketService from '../utils/socketService';
import { AppContext } from '../AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const Chat = ({ navigation }) => {
  const dispatch = useDispatch();
  const flatListRef = useRef(null);
  const { user } = useContext(AppContext);
  
  // States
  const [messageText, setMessageText] = useState('');
  
  // Redux states
  const { chatHistory, chatStatus, sendStatus, error, sendError, socketConnected } = useSelector(state => state.chat);
  
  // Debug info
  // console.log('Chat component rendering, context user:', {
  //   contextUser: user ? `Found (ID: ${user._id})` : 'Not found',
  //   chatStatus,
  //   sendStatus,
  //   hasMessages: chatHistory && chatHistory.length > 0
  // });
  
  // Nếu không tìm thấy user, hiển thị thông báo đăng nhập
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Hỗ trợ khách hàng</Text>
          </View>
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="person-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>Vui lòng đăng nhập để sử dụng tính năng chat</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.retryText}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // Initialize socket and fetch chat history
  useEffect(() => {
    // console.log('Chat component mounted, context user:', user);
    
    try {
      if (user && user._id) {
        // Initialize socket service if not already initialized
        if (!socketService.socket || !socketService.isConnected()) {
          // console.log('Initializing socket with user:', user._id);
          socketService.init(user);
        }
        
        // Fetch chat history
        // console.log('Fetching chat history for user:', user._id);
        dispatch(fetchChatHistory(user._id));
      } else {
        // console.error('Invalid user data, cannot initialize chat');
      }
    } catch (err) {
      // console.error('Error initializing chat:', err);
    }
    
    // Clean up
    return () => {
      // Optional: Disconnect socket when component unmounts
      // socketService.disconnect();
    };
  }, [dispatch, user]);

  // Show an alert if message sending failed
  useEffect(() => {
    if (sendStatus === 'failed' && sendError) {
      Alert.alert(
        'Lỗi gửi tin nhắn',
        sendError,
        [{ text: 'OK', onPress: () => dispatch(resetSendStatus()) }]
      );
    }
  }, [sendStatus, sendError, dispatch]);

  // Format date for messages
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today: show time only
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Yesterday
      return `Hôm qua ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      // Within the last week
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return `${days[date.getDay()]} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      // Older messages
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  };

  // Handle sending messages
  const handleSendMessage = useCallback(() => {
    // console.log('handleSendMessage called, messageText:', messageText);
    // console.log('Current context user:', user);
    
    if (!messageText.trim()) {
      // console.log('Cannot send empty message');
      return;
    }
    
    if (!user || !user._id) {
      // console.error('User not found or invalid user ID');
      Alert.alert(
        'Lỗi gửi tin nhắn',
        'Bạn cần đăng nhập để gửi tin nhắn.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // console.log('Attempting to send message with user:', user._id);
    
    try {
      // Tạo một tempId độc đáo cho tin nhắn tạm thời
      const tempId = `temp-${Date.now()}`;
      
      // Create a temporary message for optimistic UI update
      const tempMessage = {
        _id: tempId,
        tempId: tempId,  // Thêm tempId để có thể xác định tin nhắn này sau này
        userId: user._id,
        receiverId: 'admin',
        content: messageText.trim(),
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      
      // Add temporary message to UI immediately
      dispatch({ 
        type: 'chat/addSocketMessage', 
        payload: tempMessage 
      });
      
      // Clear input immediately để người dùng có thể tiếp tục gõ tin nhắn tiếp theo
      setMessageText('');
      
      // Try to send via Socket.IO first, if not available, use API
      let messageSent = false;
      
      if (socketService.socket && socketService.socket.connected) {
        messageSent = socketService.sendMessage('admin', messageText.trim(), tempId);
        // console.log('Socket message sent status:', messageSent ? 'Success' : 'Failed');
      }
      
      // If Socket.IO failed or not available, try API
      if (!messageSent) {
        // console.log('Socket not available or send failed, using API instead');
        dispatch(sendMessage({
          senderId: user._id,
          receiverId: 'admin',
          message: messageText.trim(),
          senderType: 'user',
          tempId: tempId // Truyền tempId để có thể cập nhật tin nhắn tạm thời
        })).then(result => {
          // console.log('API send message result:', result);
          if (result.error) {
            // console.error('API send message error:', result.error);
          }
        }).catch(error => {
          // console.error('API send message exception:', error);
        });
      }
    } catch (err) {
      // console.error('Error in handleSendMessage:', err);
      Alert.alert(
        'Lỗi gửi tin nhắn',
        'Không thể gửi tin nhắn. Vui lòng thử lại sau.',
        [{ text: 'OK' }]
      );
    }
  }, [messageText, user, dispatch]);

  // Retry loading chat history
  const handleRetryLoadHistory = useCallback(() => {
    if (user && user._id) {
      dispatch(fetchChatHistory(user._id));
    } else {
      Alert.alert(
        'Lỗi',
        'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.',
        [{ text: 'OK' }]
      );
    }
  }, [user, dispatch]);

  // Render message bubble
  const renderMessage = useCallback(({ item }) => {
    const isUser = item.sender === 'user';
    // Lấy tên người gửi
    const senderName = isUser 
      ? (user?.fullname || 'Bạn') 
      : 'Hỗ trợ khách hàng';
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.adminMessageContainer]}>
        <Text style={[styles.senderName, isUser ? styles.userSenderName : styles.adminSenderName]}>
          {senderName}
        </Text>
        <View style={styles.messageRow}>
          {!isUser && (
            <View style={styles.avatarContainer}>
              <Ionicons name="headset-outline" size={14} color="#fff" />
            </View>
          )}
          <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.adminBubble]}>
            <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.adminMessageText]}>
              {item.content}
            </Text>
            <Text style={[styles.timeText, isUser ? styles.userTimeText : styles.adminTimeText]}>
              {formatMessageTime(item.timestamp)}
            </Text>
          </View>
          {isUser && <View style={styles.spacer} />}
        </View>
      </View>
    );
  }, [user, formatMessageTime]);

  // Render message status indicators
  const renderSendingIndicator = useCallback(() => {
    if (sendStatus === 'loading') {
      return (
        <View style={styles.sendingContainer}>
          <ActivityIndicator size="small" color="#7A60FF" />
          <Text style={styles.sendingText}>Đang gửi...</Text>
        </View>
      );
    }
    return null;
  }, [sendStatus]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatHistory.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatHistory]);

  // Keyextractor for FlatList
  const keyExtractor = useCallback((item) => item._id || `msg-${Date.now()}-${Math.random()}`, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('TabNavigation', { screen: 'Message' })} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Hỗ trợ khách hàng</Text>
          <Text style={styles.headerSubtitle}>
            {socketConnected 
              ? 'Đang trực tuyến' 
              : 'Ngoại tuyến'}
          </Text>
        </View>
      </View>
      
      {chatHistory.length === 0 && chatStatus === 'loading' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7A60FF" />
          <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
        </View>
      ) : chatStatus === 'failed' ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error || 'Không thể tải tin nhắn'}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRetryLoadHistory}
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : chatHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={64} color="#7A60FF" />
          <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
          <Text style={styles.emptySubText}>Hãy bắt đầu cuộc trò chuyện với admin</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={chatHistory}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.messagesList}
        />
      )}
      
      {renderSendingIndicator()}
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            !messageText.trim() ? styles.sendButtonDisabled : {}
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Ionicons 
            name="send" 
            size={20} 
            color={!messageText.trim() ? "#CCC" : "#FFF"} 
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 40, // Balance for the back button
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Playfair_me',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Playfair_me',
  },
  backButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Playfair_me',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    fontFamily: 'Playfair_me',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#7A60FF',
    borderRadius: 20,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Playfair_me',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    fontFamily: 'Playfair_me',
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Playfair_me',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  messageContainer: {
    marginVertical: 8,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  adminMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: '#7A60FF',
  },
  adminBubble: {
    backgroundColor: '#F0F0F0',
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Playfair_me',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  adminMessageText: {
    color: '#333333',
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: 'Playfair_me',
  },
  userTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  adminTimeText: {
    color: '#999',
    textAlign: 'right',
  },
  sendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  sendingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontFamily: 'Playfair_me',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 10,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Playfair_me',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7A60FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  senderName: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'Playfair_me',
  },
  userSenderName: {
    color: '#7A60FF',
    textAlign: 'right',
    alignSelf: 'flex-end',
    marginRight: 8,
  },
  adminSenderName: {
    color: '#666',
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginLeft: 32, // Để căn lề với tin nhắn (24px icon + 8px margin)
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7A60FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  spacer: {
    width: 24,
  },
});

export default Chat; 