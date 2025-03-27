import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TouchableWithoutFeedback,
  RefreshControl,
  ScrollView,
} from 'react-native';
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { fetchChatHistory, setUnreadCount } from '../redux/ChatSlice';
import socketService from '../utils/socketService';
import { AppContext } from '../AppContext';

const Message = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AppContext);
  
  // Redux
  const {
    chatHistory,
    chatStatus,
    error,
    sendStatus,
    unreadCount,
    sendError,
  } = useSelector((state) => state.chat);
  
  // Log debug info
  console.log('Message screen - Context user:', {
    chatStatus,
    contextUser: user ? `Found (ID: ${user._id})` : 'Not found'
  });

  // Initialize socket when component mounts
  useEffect(() => {
    if (user && user._id) {
      // Initialize socket with user ID
      socketService.init(user._id);
      
      // Fetch chat history
      dispatch(fetchChatHistory(user._id));
    } else {
      console.log('Cannot initialize socket in Message screen: No valid user available');
    }
    
    // Don't disconnect the socket when leaving the screen
    // We want to keep receiving messages in background
  }, [user, dispatch]);

  // Xử lý kéo xuống để làm mới
  const onRefresh = useCallback(() => {
    if (user && user._id) {
      setRefreshing(true);
      dispatch(fetchChatHistory(user._id))
        .finally(() => {
          setTimeout(() => setRefreshing(false), 1000);
        });
    }
  }, [user, dispatch]);

  // Navigate to chat screen
  const navigateToChat = useCallback(() => {
    // Reset unread counter when entering chat
    dispatch(setUnreadCount(0));
    navigation.navigate('Chat');
  }, [navigation, dispatch]);

  // Format date for displaying last message time
  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today: show time only
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      // Yesterday
      return 'Hôm qua';
    } else if (diffDays < 7) {
      // Within the last week
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return days[date.getDay()];
    } else {
      // Older messages
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    }
  };

  // Get the last message
  const getLastMessage = () => {
    if (!chatHistory || chatHistory.length === 0) return null;
    return chatHistory[chatHistory.length - 1];
  };

  // Truncate message text if too long
  const truncateMessage = (text, maxLength = 40) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Get last message preview
  const lastMessage = getLastMessage();
  const lastMessageText = lastMessage ? truncateMessage(lastMessage.content) : 'Chưa có tin nhắn';
  const lastMessageTime = lastMessage ? formatLastMessageTime(lastMessage.timestamp) : '';
  const isLastMessageFromAdmin = lastMessage && lastMessage.sender === 'admin';

  // Log thông tin người dùng để debug
  useEffect(() => {
    console.log('Message component - Context user info:', {
      hasUser: !!user,
      userId: user?._id,
      chatHistoryLength: chatHistory?.length || 0,
      chatStatus,
      socketConnected: socketService.isConnected()
    });
  }, [user, chatHistory, chatStatus]);

  // Nếu không tìm thấy user, hiển thị thông báo đăng nhập
  if (!user) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <ScrollView style={styles.container}>
          <Text style={styles.title}>Tin nhắn</Text>
          
          <View style={styles.centerContent}>
            <Icon name="alert-circle-outline" size={50} color="#FF5858" />
            <Text style={styles.errorText}>Vui lòng đăng nhập để sử dụng tính năng chat</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.retryText}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#7A60FF']}
            tintColor="#7A60FF"
          />
        }
      >
        <Text style={styles.title}>Tin nhắn</Text>
        
        {chatStatus === 'loading' && !refreshing ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#7A60FF" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : chatStatus === 'failed' ? (
          <View style={styles.centerContent}>
            <Icon name="alert-circle-outline" size={50} color="#FF5858" />
            <Text style={styles.errorText}>{error || 'Không thể tải tin nhắn'}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => user && dispatch(fetchChatHistory(user._id))}
            >
              <Text style={styles.retryText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.chatListContainer}>
              <TouchableWithoutFeedback onPress={navigateToChat}>
                <View style={styles.chatItem}>
                  <View style={styles.avatarContainer}>
                    <Icon name="person" size={24} color="#fff" style={styles.avatarIcon} />
                    <View style={[styles.statusIndicator, socketService.isConnected() ? styles.connected : styles.disconnected]} />
                  </View>
                  
                  <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                      <Text style={styles.chatName}>Hỗ trợ khách hàng</Text>
                      <Text style={styles.timeText}>{lastMessageTime}</Text>
                    </View>
                    
                    <View style={styles.messagePreview}>
                      {isLastMessageFromAdmin && <Text style={styles.adminLabel}>Admin: </Text>}
                      <Text numberOfLines={1} style={styles.previewText}>
                        {lastMessageText}
                      </Text>
                      
                      {unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
            
            <View style={styles.emptyListContent}>
              <Image 
                source={require('../Assets/Images/comment.png')} 
                style={styles.emptyImage}
                resizeMode="contain"
              />
              <Text style={styles.emptyTitle}>Đây là tính năng chat hỗ trợ</Text>
              <Text style={styles.emptyDescription}>
                Bạn có thể liên hệ với đội ngũ hỗ trợ để được giải đáp mọi thắc mắc về dịch vụ cưới hỏi.
              </Text>
              
              <TouchableOpacity 
                style={styles.contactButton}
                onPress={navigateToChat}
              >
                <Text style={styles.contactButtonText}>Chat ngay</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Message;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    color: '#000',
    marginVertical: 20,
    alignSelf: 'center',
    fontFamily: 'Playfair_me',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Playfair_me',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF5858',
    textAlign: 'center',
    fontFamily: 'Playfair_me',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#000',
    borderRadius: 20,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Playfair_me',
  },
  chatListContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarIcon: {
    marginRight: 0,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#fff',
  },
  connected: {
    backgroundColor: '#1FD23C',
  },
  disconnected: {
    backgroundColor: '#FF5858',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Playfair_me',

  },
  timeText: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Playfair_me',
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminLabel: {
    fontSize: 14,
    color: '#7A60FF',
    fontFamily: 'Playfair_me',
  },
  previewText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    fontFamily: 'Playfair_me',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Playfair_me',
  },
  emptyListContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  emptyImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
    tintColor: '#000',
  },
  emptyTitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Playfair_me',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Playfair_me',
    marginBottom: 20,
  },
  contactButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Playfair_me',
  },
});
