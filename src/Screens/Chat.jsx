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

// Utility function to format message timestamp
const formatMessageTime = (timestamp) => {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return 'Invalid Time';
    }
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Unknown Time';
  }
};

// Utility to wait for socket connection
const waitForSocket = async (timeout = 5000) => {
  return new Promise((resolve) => {
    if (socketService.socket && socketService.isConnected()) {
      return resolve(true);
    }
    const interval = setInterval(() => {
      if (socketService.socket && socketService.isConnected()) {
        clearInterval(interval);
        resolve(true);
      }
    }, 100);
    setTimeout(() => {
      clearInterval(interval);
      resolve(false);
    }, timeout);
  });
};

const Chat = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const flatListRef = useRef(null);
  const { user, isLoading: contextLoading } = useContext(AppContext);
  const { planId } = route?.params || {};

  // States
  const [messageText, setMessageText] = useState('');
  const [imageData, setImageData] = useState(null);
  const [hasSentPlanMessage, setHasSentPlanMessage] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Redux states
  const { chatHistory, chatStatus, sendStatus, error, sendError, socketConnected } = useSelector(
    (state) => state.chat
  );
  const { ChitietPlanData } = useSelector((state) => state.chitietplan);

  // Format user avatar if exists
  const formattedAvatar = user?.avatar ? formatAvatarUri(user.avatar) : null;

  // Check user on mount or change
  useEffect(() => {
    if (!contextLoading && !user) {
      console.log('User không tồn tại, chuyển hướng đến SignIn');
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    }
  }, [user, contextLoading, navigation]);

  // Check readiness for sending messages
  useEffect(() => {
    if (user && !contextLoading && ChitietPlanData) {
      setIsReady(true);
    }
  }, [user, contextLoading, ChitietPlanData]);

  // Scroll to bottom when chat history updates
  useEffect(() => {
    if (chatHistory.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatHistory]);

  // Initialize socket, fetch chat history, and send plan message
  useEffect(() => {
    if (!user || contextLoading || !isReady) return;

    const initializeChat = async () => {
      try {
        // Initialize socket service
        if (!socketService.socket || !socketService.isConnected()) {
          socketService.init(user);
          await waitForSocket();
        }

        // Fetch chat history
        await dispatch(fetchChatHistory(user._id)).unwrap();

        // Send automatic message if planId exists
        if (planId && !hasSentPlanMessage && ChitietPlanData) {
          console.log('ChitietPlanData:', ChitietPlanData);
          const planData = ChitietPlanData.plan || ChitietPlanData;
          const userName = user?.fullname || user?.name || '';

          // Format text message
          const messageContent = `
Tôi muốn thảo luận về kế hoạch:
- ID: ${planId}
- Tên kế hoạch: ${planData.name || 'Không có tên'}
`.trim();

          const tempId = `temp-${Date.now()}`;

          // Add temporary text message
          const tempMessage = {
            _id: tempId,
            tempId: tempId,
            userId: user._id,
            receiverId: 'admin',
            content: messageContent,
            sender: 'user',
            timestamp: new Date().toISOString(),
            messageType: 'text',
            userName: userName,
          };
          dispatch({ type: 'chat/addSocketMessage', payload: tempMessage });
          console.log('Sending text message:', messageContent);

          // Send text message
          if (socketService.socket && socketService.isConnected()) {
            const socketSent = socketService.sendMessage('admin', messageContent, tempId, 'text');
            if (!socketSent) {
              await dispatch(
                sendMessage({
                  senderId: user._id,
                  receiverId: 'admin',
                  message: messageContent,
                  senderType: 'user',
                  messageType: 'text',
                  tempId: tempId,
                  userName: userName,
                })
              ).unwrap();
            }
          } else {
            await dispatch(
              sendMessage({
                senderId: user._id,
                receiverId: 'admin',
                message: messageContent,
                senderType: 'user',
                messageType: 'text',
                tempId: tempId,
                userName: userName,
              })
            ).unwrap();
          }

          // Collect and send images
          const images = [];
          if (planData.SanhId?.image) {
            images.push({ uri: formatAvatarUri(planData.SanhId.image), label: 'Sảnh cưới' });
          }
          if (planData.caterings?.length > 0) {
            planData.caterings.forEach((item) => {
              if (item.image) {
                images.push({ uri: formatAvatarUri(item.image), label: `Dịch vụ ăn uống: ${item.name || 'Không có tên'}` });
              }
            });
          }
          if (planData.decorates?.length > 0) {
            planData.decorates.forEach((item) => {
              if (item.image) {
                images.push({ uri: formatAvatarUri(item.image), label: `Trang trí: ${item.name || 'Không có tên'}` });
              }
            });
          }
          if (planData.presents?.length > 0) {
            planData.presents.forEach((item) => {
              if (item.image) {
                images.push({ uri: formatAvatarUri(item.image), label: `Quà tặng: ${item.name || 'Không có tên'}` });
              }
            });
          }

          // Send images
          for (const image of images) {
            const imageTempId = `temp-img-${Date.now()}-${Math.random()}`;
            const imageMessage = {
              _id: imageTempId,
              tempId: imageTempId,
              userId: user._id,
              receiverId: 'admin',
              content: image.uri,
              sender: 'user',
              timestamp: new Date().toISOString(),
              messageType: 'image',
              userName: userName,
            };

            dispatch({ type: 'chat/addSocketMessage', payload: imageMessage });
            console.log('Sending image:', image.uri);

            if (socketService.socket && socketService.isConnected()) {
              const socketSent = socketService.sendMessage('admin', image.uri, imageTempId, 'image');
              if (socketSent) continue;
            }

            await dispatch(
              sendMessage({
                senderId: user._id,
                receiverId: 'admin',
                message: image.uri,
                senderType: 'user',
                messageType: 'image',
                tempId: imageTempId,
                userName: userName,
              })
            ).unwrap();
          }

          // Refresh chat history to sync with server
          await dispatch(fetchChatHistory(user._id)).unwrap();
          console.log('Chat history updated:', chatHistory);

          setHasSentPlanMessage(true);
        }
      } catch (err) {
        console.error('Error initializing chat:', err);
        if (planId && !hasSentPlanMessage) {
          Alert.alert('Lỗi', 'Không thể gửi tin nhắn tự động về kế hoạch. Vui lòng thử lại.');
        }
      }
    };

    initializeChat();

    return () => {
      setMessageText('');
      setImageData(null);
    };
  }, [dispatch, user, contextLoading, planId, hasSentPlanMessage, ChitietPlanData, isReady]);

  // Handle image picking
  const pickImage = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.7,
        includeBase64: true,
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.error('ImagePicker Error:', response.errorMessage);
          Alert.alert('Lỗi', 'Không thể chọn hình ảnh. Vui lòng thử lại.');
        } else if (response.assets && response.assets.length > 0) {
          const base64Image = `data:image/jpeg;base64,${response.assets[0].base64}`;
          setImageData(base64Image);
        }
      }
    );
  }, []);

  // Cancel image selection
  const cancelImage = useCallback(() => {
    setImageData(null);
  }, []);

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

      if (socketService.socket && socketService.isConnected()) {
        const socketSent = socketService.sendMessage(
          'admin',
          messageContent,
          tempId,
          isImageMessage ? 'image' : 'text'
        );
        if (socketSent) {
          // Refresh chat history after socket send
          dispatch(fetchChatHistory(user._id));
          return;
        }
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
      ).then(() => {
        // Refresh chat history after Redux send
        dispatch(fetchChatHistory(user._id));
      }).catch((error) => {
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
                    onError={(error) => console.log('Lỗi tải hình ảnh tin nhắn:', error.nativeEvent.error)}
                  />
                </TouchableOpacity>
              ) : (
                <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.adminMessageText]}>
                  {item.content}
                </Text>
              )}
            </View>
            {isUser && (
              formattedAvatar ? (
                <Image
                  source={{ uri: formattedAvatar }}
                  style={styles.userAvatarImage}
                  onError={(error) => console.log('Lỗi tải avatar người dùng:', error.nativeEvent.error)}
                />
              ) : (
                <View style={styles.userAvatarContainer}>
                  <Ionicons name="person" size={18} color="#fff" />
                </View>
              )
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
          keyExtractor={(item) => item._id || item.tempId}
          contentContainerStyle={styles.messagesList}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={Platform.OS === 'android'}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
          extraData={chatHistory.length}
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
    return null;
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

// Styles (unchanged)
const styles = StyleSheet.create({
  planBubble: {
    padding: 16,
    backgroundColor: '#E6E6FA', // Màu tím nhạt cho tin nhắn kế hoạch
  },
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