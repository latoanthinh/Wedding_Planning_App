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
import { launchImageLibrary } from 'react-native-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { fetchChatHistory, sendMessage, resetSendStatus } from '../redux/ChatSlice';
import socketService from '../utils/socketService';
import { AppContext } from '../AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserStatusIndicator from '../components/UserStatusIndicator';
import { useBackHandler } from '../hooks/useBackHandler';

// Utility function to ensure avatar URL is properly formatted
const formatAvatarUri = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('data:') || avatar.startsWith('http')) {
    return avatar;
  }
  return `data:image/jpeg;base64,${avatar}`;
};

const Chat = ({ navigation }) => {
  const dispatch = useDispatch();
  const flatListRef = useRef(null);
  const { user, isLoading: contextLoading } = useContext(AppContext);

  // States
  const [messageText, setMessageText] = useState('');
  const [imageData, setImageData] = useState(null);

  // Redux states
  const { chatHistory, chatStatus, sendStatus, error, sendError, socketConnected } = useSelector(
    (state) => state.chat
  );

  // Format user avatar if exists
  const formattedAvatar = user?.avatar ? formatAvatarUri(user.avatar) : null;

  // Kiểm tra user khi component mount hoặc user thay đổi
  useEffect(() => {
    if (!contextLoading && !user) {
      console.log('User không tồn tại, chuyển hướng đến SignIn');
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    }
  }, [user, contextLoading, navigation]);

  // Initialize socket and fetch chat history
  useEffect(() => {
    if (!user || contextLoading) return; // Không gọi nếu không có user hoặc đang loading

    const initializeChat = async () => {
      try {
        // Initialize socket service
        if (!socketService.socket || !socketService.isConnected()) {
          socketService.init(user);
        }

        // Fetch chat history
        await dispatch(fetchChatHistory(user._id)).unwrap();
      } catch (err) {
        console.error('Error initializing chat:', err);
      }
    };

    initializeChat();

    // Cleanup
    return () => {
      // Đóng socket khi component unmount (tùy chọn)
      // socketService.disconnect();
      setMessageText('');
      setImageData(null);
    };
  }, [dispatch, user, contextLoading]);

  // Show alert if message sending failed
  useEffect(() => {
    if (!user) return;

    if (sendStatus === 'failed' && sendError) {
      Alert.alert('Lỗi gửi tin nhắn', sendError, [
        { text: 'OK', onPress: () => dispatch(resetSendStatus()) },
      ]);
    }
  }, [sendStatus, sendError, dispatch, user]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (!user || chatHistory.length === 0 || !flatListRef.current) return;

    setTimeout(() => {
      try {
        flatListRef.current.scrollToEnd({ animated: true });
      } catch (error) {
        console.log('Error scrolling to end:', error);
      }
    }, 50);
  }, [chatHistory, user]);

  // Format date for messages
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return `Hôm qua ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return `${days[date.getDay()]} ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  };

  // Handle picking image
  const pickImage = async () => {
    if (!user) return;

    try {
      const options = {
        mediaType: 'photo',
        includeBase64: true,
        maxHeight: 1200,
        maxWidth: 1200,
        quality: 0.8,
      };

      const result = await launchImageLibrary(options);

      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Lỗi', `Không thể chọn ảnh: ${result.errorMessage}`);
        return;
      }

      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];

        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert('Kích thước ảnh quá lớn', 'Vui lòng chọn ảnh có kích thước nhỏ hơn 5MB.');
          return;
        }

        const imageType = asset.type.split('/')[1] || 'jpeg';
        const formattedBase64 = `data:image/${imageType};base64,${asset.base64}`;
        setImageData(formattedBase64);
        setMessageText('');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại sau.');
    }
  };

  // Cancel image upload
  const cancelImage = () => {
    if (!user) return;
    setImageData(null);
  };

  // Handle sending messages
  const handleSendMessage = useCallback(() => {
    if (!user || !user._id) return;

    const isImageMessage = !!imageData;
    const messageContent = isImageMessage ? imageData : messageText.trim();

    if (!messageContent) return;

    try {
      const tempId = `temp-${Date.now()}`;
      if (isImageMessage) {
        setImageData(null);
      } else {
        setMessageText('');
      }

      const userName = user?.fullname || user?.name || '';
      const tempMessage = {
        _id: tempId,
        tempId: tempId,
        userId: user._id,
        receiverId: 'admin',
        content: messageContent,
        sender: 'user',
        timestamp: new Date().toISOString(),
        messageType: isImageMessage ? 'image' : 'text',
        userName: userName,
      };

      dispatch({ type: 'chat/addSocketMessage', payload: tempMessage });

      if (socketService.socket && socketService.socket.connected) {
        const socketSent = socketService.sendMessage(
          'admin',
          messageContent,
          tempId,
          isImageMessage ? 'image' : 'text'
        );
        if (socketSent) return;
      }

      dispatch(
        sendMessage({
          senderId: user._id,
          receiverId: 'admin',
          message: messageContent,
          senderType: 'user',
          messageType: isImageMessage ? 'image' : 'text',
          tempId: tempId,
          userName: userName,
        })
      ).catch((error) => {
        console.error('Exception sending message:', error);
      });
    } catch (err) {
      console.error('Error in handleSendMessage:', err);
      Alert.alert('Lỗi gửi tin nhắn', 'Không thể gửi tin nhắn. Vui lòng thử lại sau.', [{ text: 'OK' }]);
    }
  }, [messageText, imageData, user, dispatch]);

  // Render message bubble
  const renderMessage = useCallback(
    ({ item }) => {
      if (!user) return null;

      const isUser = item.sender === 'user';
      const isImage = item.messageType === 'image';
      const senderName = isUser ? (user?.fullname || user?.name || 'Bạn') : 'Hỗ trợ khách hàng';

      return (
        <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.adminMessageContainer]}>
          <View style={[styles.nameContainer, isUser ? styles.userNameContainer : styles.adminNameContainer]}>
            <Text style={[styles.senderName, isUser ? styles.userSenderName : styles.adminSenderName]}>
              {senderName}
            </Text>
          </View>

          <View style={[styles.messageRow, isUser && styles.userMessageRow]}>
            {!isUser && (
              <View style={styles.avatarContainer}>
                <Ionicons name="headset-outline" size={16} color="#fff" />
              </View>
            )}

            <View
              style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.adminBubble,
                isImage && (isUser ? styles.userImageBubble : styles.adminImageBubble),
              ]}
            >
              {isImage ? (
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert('Hình ảnh', '', [
                      { text: 'Đóng', style: 'cancel' },
                      { text: 'Xem đầy đủ', onPress: () => navigation.navigate('ImageViewer', { imageUri: item.content }) },
                    ])
                  }
                >
                  <Image
                    source={{ uri: item.content }}
                    style={styles.messageImage}
                    resizeMode="cover"
                    onError={(error) => console.log('Error loading message image:', error.nativeEvent.error)}
                  />
                </TouchableOpacity>
              ) : (
                <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.adminMessageText]}>
                  {item.content}
                </Text>
              )}
            </View>

            {isUser && (
              <>
                {formattedAvatar ? (
                  <Image
                    source={{ uri: formattedAvatar }}
                    style={styles.userAvatarImage}
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

          <View style={[styles.timeContainer, isUser ? styles.userTimeContainer : styles.adminTimeContainer]}>
            <Text style={[styles.timeText, isUser ? styles.userTimeText : styles.adminTimeText]}>
              {formatMessageTime(item.timestamp)}
            </Text>
          </View>
        </View>
      );
    },
    [user, formattedAvatar, formatMessageTime, navigation]
  );

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

  // Render content based on chat status
  const renderContent = () => {
    if (!user) return null;

    if (chatStatus === 'loading') {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7A60FF" />
          <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
        </View>
      );
    } else if (chatStatus === 'failed') {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error || 'Không thể tải lịch sử chat'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(fetchChatHistory(user._id))}
          >
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (chatHistory.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={64} color="#7A60FF" />
          <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
          <Text style={styles.emptySubText}>Bắt đầu cuộc trò chuyện với đội hỗ trợ của chúng tôi ngay bây giờ!</Text>
        </View>
      );
    } else {
      return (
        <FlatList
          ref={flatListRef}
          data={chatHistory}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messagesList}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={Platform.OS === 'android'}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
        />
      );
    }
  };

  if (contextLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7A60FF" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return null; // Không render nếu user không tồn tại
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('TabNavigation', { screen: 'Message' })}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Hỗ trợ khách hàng</Text>
          <View style={styles.statusRow}>
            <UserStatusIndicator style={styles.statusIndicator} isOnline={true} />
            <Text style={styles.headerSubtitle}>Đang hoạt động</Text>
          </View>
        </View>
      </View>

      {renderContent()}

      {renderSendingIndicator()}

      {imageData && (
        <View style={styles.imagePreviewContainer}>
          <View style={styles.imagePreviewContent}>
            <Image source={{ uri: imageData }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.cancelImageButton} onPress={cancelImage}>
              <Ionicons name="close-circle" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.imagePreviewText}>Hình ảnh đã sẵn sàng để gửi</Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainer}
      >
        <TouchableOpacity
          style={styles.imageButton}
          onPress={pickImage}
          disabled={!!imageData}
        >
          <Ionicons name="image-outline" size={24} color={imageData ? '#CCC' : '#7A60FF'} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder={imageData ? 'Ấn nút gửi để gửi ảnh...' : 'Nhập tin nhắn...'}
          placeholderTextColor="#999"
          multiline
          editable={!imageData}
        />

        <TouchableOpacity
          style={[styles.sendButton, (!messageText.trim() && !imageData) ? styles.sendButtonDisabled : {}]}
          onPress={handleSendMessage}
          disabled={!messageText.trim() && !imageData}
        >
          <Ionicons
            name="send"
            size={20}
            color={(!messageText.trim() && !imageData) ? '#CCC' : '#FFF'}
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;

// Styles giữ nguyên
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
    marginRight: 40,
  },
  headerTitle: {
    fontSize: 18,
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
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  userImageBubble: {
    padding: 4,
  },
  adminImageBubble: {
    padding: 4,
  },
  imagePreviewContainer: {
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  imagePreviewContent: {
    position: 'relative',
    width: 150,
    height: 150,
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },
  cancelImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
  },
  imagePreviewText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    fontFamily: 'Playfair_me',
  },
  imageButton: {
    padding: 10,
    marginRight: 5,
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  statusIndicator: {
    marginTop: 2,
    marginRight: 5,
  },
});