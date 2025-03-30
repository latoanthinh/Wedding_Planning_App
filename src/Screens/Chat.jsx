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
  Image,
  
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { fetchChatHistory, sendMessage, resetSendStatus } from '../redux/ChatSlice';
import socketService from '../utils/socketService';
import { AppContext } from '../AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserStatusIndicator from '../components/UserStatusIndicator';

// Utility function to ensure avatar URL is properly formatted
const formatAvatarUri = (avatar) => {
  if (!avatar) return null;
  
  // If it's already a properly formatted URI with data: or http: prefix, return as is
  if (avatar.startsWith('data:') || avatar.startsWith('http')) {
    return avatar;
  }
  
  // Otherwise, assume it's a base64 string that needs the data:image prefix
  return `data:image/jpeg;base64,${avatar}`;
};

const Chat = ({ navigation }) => {
  const dispatch = useDispatch();
  const flatListRef = useRef(null);
  const { user } = useContext(AppContext);
  
  // States
  const [messageText, setMessageText] = useState('');
  
  // Format user avatar if exists
  const formattedAvatar = user?.avatar ? formatAvatarUri(user.avatar) : null;
  
  // Debug logging for avatar
  useEffect(() => {
    if (user) {
      console.log('Chat user data:', {
        hasAvatar: !!user.avatar,
        avatarType: user.avatar ? typeof user.avatar : 'none',
        avatarLength: user.avatar ? user.avatar.length : 0,
        avatarStartsWith: user.avatar ? user.avatar.substring(0, 20) + '...' : 'none',
        formattedAvatar: formattedAvatar ? 'Formatted' : 'Not available',
        userName: user.fullname || user.name || 'Unknown'
      });
    } else {
      console.log('No user data available in Chat component');
    }
  }, [user, formattedAvatar]);
  
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
      const messageContent = messageText.trim();
      
      // Xóa input ngay lập tức để UX tốt hơn
      setMessageText('');
      
      // Create a temporary message for optimistic UI update
      const tempMessage = {
        _id: tempId,
        tempId: tempId,  // Thêm tempId để có thể xác định tin nhắn này sau này
        userId: user._id,
        receiverId: 'admin',
        content: messageContent,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      
      // Add temporary message to UI immediately
      dispatch({ 
        type: 'chat/addSocketMessage', 
        payload: tempMessage 
      });
      
      // Kiểm tra trạng thái socket
      console.log('Socket state before sending:', 
        socketService.isConnected() ? 'Connected' : 'Disconnected'
      );
      
      // Try to send via Socket.IO first
      if (socketService.socket && socketService.socket.connected) {
        const socketSent = socketService.sendMessage('admin', messageContent, tempId);
        console.log('Message sent via socket:', socketSent ? 'Success' : 'Failed');
        
        if (socketSent) {
          // Nếu socket gửi thành công, không cần gửi qua API
          return;
        }
      }
      
      // If Socket.IO failed or not available, use API
      console.log('Socket not available or send failed, using API instead');
      dispatch(sendMessage({
        senderId: user._id,
        receiverId: 'admin',
        message: messageContent,
        senderType: 'user',
        tempId: tempId // Truyền tempId để có thể cập nhật tin nhắn tạm thời
      })).then(result => {
        console.log('API send message result:', result);
        if (result.error) {
          console.error('API send message error:', result.error);
        }
      }).catch(error => {
        console.error('API send message exception:', error);
      });
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
      ? (user?.fullname || user?.name || 'Bạn') 
      : 'Hỗ trợ khách hàng';
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.adminMessageContainer]}>
        <View style={[styles.nameContainer, isUser ? styles.userNameContainer : styles.adminNameContainer]}>
          <Text style={[styles.senderName, isUser ? styles.userSenderName : styles.adminSenderName]}>
            {senderName}
          </Text>
        </View>
        
        <View style={[styles.messageRow, isUser && styles.userMessageRow]}>
          {/* Admin avatar */}
          {!isUser && (
            <View style={styles.avatarContainer}>
              <Ionicons name="headset-outline" size={16} color="#fff" />
            </View>
          )}
          
          {/* Message bubble */}
          <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.adminBubble]}>
            <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.adminMessageText]}>
              {item.content}
            </Text>
          </View>
          
          {/* User avatar */}
          {isUser && (
            <>
              {formattedAvatar ? (
                <Image 
                  source={{ uri: formattedAvatar }} 
                  style={styles.userAvatarImage}
                  defaultSource={require('../Assets/Images/mask.png')}
                  onError={(error) => console.log('Error loading user avatar:', error.nativeEvent.error)}
                />
              ) : (
                <View style={styles.userAvatarContainer}>
                  <Ionicons name="person" size={18} color="#fff" />
                </View>
              )}
            </>
          )}
        </View>
        
        {/* Time stamp outside the bubble */}
        <View style={[styles.timeContainer, isUser ? styles.userTimeContainer : styles.adminTimeContainer]}>
          <Text style={[styles.timeText, isUser ? styles.userTimeText : styles.adminTimeText]}>
            {formatMessageTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  }, [user, formattedAvatar, formatMessageTime]);

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

  // Scroll to bottom when new messages are added or when chat history is initially loaded
  useEffect(() => {
    if (chatHistory.length > 0 && flatListRef.current) {
      // Sử dụng thời gian ngắn hơn cho việc cuộn khi có tin nhắn mới
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [chatHistory]);
  
  // Scroll to bottom when component mounts and chat status is ready
  useEffect(() => {
    let scrollTimer;
    if (chatStatus === 'succeeded' && chatHistory.length > 0 && flatListRef.current) {
      // Sử dụng một loạt các timer để đảm bảo sẽ cuộn được trong mọi trường hợp
      scrollTimer = setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: false });
        
        // Thêm cuộn thứ hai sau đó để đảm bảo cuộn hoạt động
        setTimeout(() => {
          if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: false });
          }
        }, 100);
      }, 200);
    }
    return () => {
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [chatStatus, chatHistory]);
  
  // Auto scroll to bottom on content size change và ưu tiên cao nhất 
  const onContentSizeChange = useCallback(() => {
    if (flatListRef.current && chatHistory.length > 0) {
      // Không dùng timeout để tránh độ trễ khi nội dung thay đổi
      flatListRef.current.scrollToEnd({ animated: false });
    }
  }, [chatHistory]);
  
  // Optimized layout handler for first render
  const onLayout = useCallback(() => {
    if (flatListRef.current && chatHistory.length > 0) {
      // Sử dụng một sequence các lần cuộn để đảm bảo nó hoạt động mượt mà
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: false });
      }, 10);
      
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: false });
      }, 50);
      
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [chatHistory]);

  // Keyextractor for FlatList
  const keyExtractor = useCallback((item) => item._id || `msg-${Date.now()}-${Math.random()}`, []);

  // Tối ưu hiệu suất renderItem với memo
  const memoizedRenderMessage = useCallback(renderMessage, [user, formattedAvatar, formatMessageTime]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Hỗ trợ khách hàng</Text>
          <View style={styles.statusRow}>
            <UserStatusIndicator 
              userId="admin" // Assuming admin has ID 'admin', adjust as needed  
              size="small"
              showText={true}
              style={styles.statusIndicator}
              textStyle={styles.statusText}
            />
          </View>
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
          renderItem={memoizedRenderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={onContentSizeChange}
          onLayout={onLayout}
          initialNumToRender={15} // Chỉ render số lượng vừa đủ lúc đầu
          maxToRenderPerBatch={10} // Giới hạn số lượng render mỗi batch
          windowSize={10} // Window size tối ưu
          removeClippedSubviews={Platform.OS === 'android'} // Tăng hiệu suất trên Android
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10
          }}
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
    // fontWeight: 'bold',
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
    marginVertical: 10,
    maxWidth: '85%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  adminMessageContainer: {
    alignSelf: 'flex-start',
  },
  nameContainer: {
    width: '100%',
    marginBottom: 4,
  },
  userNameContainer: {
    alignItems: 'flex-end',
    paddingRight: 52,
  },
  adminNameContainer: {
    alignItems: 'flex-start',
    paddingLeft: 52,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: '100%',
    marginBottom: 2,
  },
  userBubble: {
    backgroundColor: '#000222',
    marginRight: 8,
  },
  adminBubble: {
    backgroundColor: '#F0F0F0',
    marginLeft: 8,
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
  senderName: {
    fontSize: 12,
    fontFamily: 'Playfair_me',
  },
  userSenderName: {
    color: '#000222',
    textAlign: 'right',
  },
  adminSenderName: {
    color: '#666',
    textAlign: 'left',
  },
  timeContainer: {
    width: '100%',
    marginTop: 2,
  },
  userTimeContainer: {
    alignItems: 'flex-end',
    paddingRight: 52,
  },
  adminTimeContainer: {
    alignItems: 'flex-start',
    paddingLeft: 52,
  },
  timeText: {
    fontSize: 9,
    fontFamily: 'Playfair_me',
    color: '#999',
  },
  userTimeText: {
    textAlign: 'right',
  },
  adminTimeText: {
    textAlign: 'left',
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
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#7A60FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  userAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000222',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  userAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  spacer: {
    width: 20,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  statusIndicator: {
    marginTop: 2,
  },
  statusText: {
    fontSize: 11,
    color: '#666',
  },
});

export default Chat; 