import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, Image, Alert, Modal,
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
      console.error('Invalid timestamp:', timestamp);
      return 'Invalid Time';
    }
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting timestamp:', error, 'Timestamp:', timestamp);
    return 'Unknown Time';
  }
};

// Utility function to format message date for separators
const formatMessageDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return 'Hôm nay';
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Hôm qua';
  }

  if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    return days[date.getDay()];
  }

  return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Utility to check if date separator should be shown
const shouldShowDate = (messages, index) => {
  if (index === 0) return true;
  const currentDate = new Date(messages[index].timestamp).toDateString();
  const prevDate = new Date(messages[index - 1].timestamp).toDateString();
  return currentDate !== prevDate;
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

// Utility to fetch with timeout
const fetchWithTimeout = async (url, options, timeout = 30000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmedMessages, setConfirmedMessages] = useState([]); // Track confirmed/canceled messages

  // Redux states
  const { chatHistory, chatStatus, sendStatus, error, sendError, socketConnected } = useSelector(
    (state) => state.chat
  );
  const { ChitietPlanData } = useSelector((state) => state.chitietplan);

  // Format user avatar if exists
  const formattedAvatar = user?.avatar ? formatAvatarUri(user.avatar) : null;

  // Log route.params.planId
  useEffect(() => {
    console.log('route.params.planId:', planId);
  }, [planId]);

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

  // Initialize WebSocket and handle real-time messages
  useEffect(() => {
    if (!user || contextLoading || !isReady) return;

    const initializeChat = async () => {
      try {
        // Initialize socket
        if (!socketService.socket || !socketService.isConnected()) {
          socketService.init(user);
          await waitForSocket();
        }

        // Listen for new messages
        socketService.socket.on('newMessage', (data) => {
          console.log('Received newMessage:', data);
          const { message, userId } = data;
          if (userId === user._id) {
            dispatch({
              type: 'chat/addSocketMessage',
              payload: {
                ...message,
                _id: message._id || `temp-${Date.now()}`,
                timestamp: message.createdAt || new Date().toISOString(),
                sender: message.senderType === 'user' ? 'user' : 'admin',
              },
            });
            socketService.socket.emit('markAsRead', { userId: user._id });
          }
        });

        // Listen for message sent confirmation
        socketService.socket.on('messageSent', (data) => {
          const { message } = data;
          dispatch({
            type: 'chat/addSocketMessage',
            payload: {
              ...message,
              _id: message._id || `temp-${Date.now()}`,
              timestamp: message.createdAt || new Date().toISOString(),
              sender: message.senderType === 'user' ? 'user' : 'admin',
            },
          });
        });

        // Fetch chat history
        await dispatch(fetchChatHistory(user._id)).unwrap();

        // Send plan message if applicable
        if (planId && !hasSentPlanMessage && ChitietPlanData) {
          const planData = ChitietPlanData.plan || ChitietPlanData;
          const userName = user?.fullname || user?.name || '';

          const messageContent = JSON.stringify({
            planId: planId,
            details: {
              name: planData.name || 'Không có tên',
              sanh: planData.SanhId?.name || 'Chưa chọn sảnh',
              caterings: planData.caterings?.map((item) => item.name) || [],
              decorates: planData.decorates?.map((item) => item.name) || [],
              presents: planData.presents?.map((item) => item.name) || [],
            },
          });

          console.log('Chuẩn bị gửi tin nhắn plan:', messageContent);

          const tempId = `temp-${Date.now()}`;
          const tempMessage = {
            _id: tempId,
            tempId,
            userId: user._id,
            receiverId: 'admin',
            content: messageContent,
            sender: 'user',
            timestamp: new Date().toISOString(),
            messageType: 'plan',
            userName,
          };
          dispatch({ type: 'chat/addSocketMessage', payload: tempMessage });

          try {
            if (socketService.socket && socketService.isConnected()) {
              const socketSent = socketService.sendMessage('admin', messageContent, tempId, 'plan');
              if (!socketSent) {
                throw new Error('Socket gửi thất bại');
              }
            } else {
              await dispatch(
                sendMessage({
                  senderId: user._id,
                  receiverId: 'admin',
                  message: messageContent,
                  senderType: 'user',
                  messageType: 'plan',
                  tempId,
                  userName,
                })
              ).unwrap();
            }
          } catch (error) {
            console.error('Lỗi gửi tin nhắn plan:', error);
            Alert.alert('Lỗi', 'Không thể gửi tin nhắn kế hoạch tự động.');
          }

          const images = [];
          if (planData.SanhId?.image) {
            images.push({ uri: formatAvatarUri(planData.SanhId.image), label: 'Sảnh cưới' });
          }

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
              userName,
            };
            dispatch({ type: 'chat/addSocketMessage', payload: imageMessage });

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
                userName,
              })
            ).unwrap();
          }

          await dispatch(fetchChatHistory(user._id)).unwrap();
          setHasSentPlanMessage(true);
        }
      } catch (err) {
        console.error('Lỗi khởi tạo chat:', err);
        Alert.alert('Lỗi', 'Không thể khởi tạo chat.');
      }
    };

    initializeChat();

    return () => {
      if (socketService.socket) {
        socketService.socket.off('newMessage');
        socketService.socket.off('messageSent');
        socketService.disconnect();
      }
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
        tempId,
        userId: user._id,
        receiverId: 'admin',
        content: messageContent,
        sender: 'user',
        timestamp: new Date().toISOString(),
        messageType: isImageMessage ? 'image' : 'text',
        userName,
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
          tempId,
          userName,
        })
      )
        .then(() => {
          dispatch(fetchChatHistory(user._id));
        })
        .catch((error) => {
          console.error('Exception sending message:', error);
        });
    } catch (err) {
      console.error('Error in handleSendMessage:', err);
      Alert.alert('Lỗi gửi tin nhắn', 'Không thể gửi tin nhắn. Vui lòng thử lại sau.', [{ text: 'OK' }]);
    }
  }, [messageText, imageData, user, dispatch]);

  // Handle scroll to check for scroll button visibility
  const handleScroll = ({ nativeEvent }) => {
    const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
    const isScrolledUp = contentSize.height - contentOffset.y - layoutMeasurement.height > 300;
    setShowScrollButton(isScrolledUp);
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  // Render message bubble
  const renderMessage = useCallback(
    ({ item, index }) => {
      if (!user) return null;

      const isUser = item.sender === 'user';
      const isImage = item.messageType === 'image';
      const isConfirmation = item.messageType === 'confirmation';
      const isPlan = item.messageType === 'plan';
      const isNewPlan = item.messageType === 'new_plan';
      const senderName = isUser ? user?.fullname || user?.name || 'Bạn' : 'Hỗ trợ khách hàng';
      const isMessageConfirmed = confirmedMessages.includes(item._id); // Check if message is confirmed/canceled

      let messageContent = item.content;
      let parsedContent = {};

      // Only attempt JSON parsing for specific message types with valid JSON-like content
      if ((isConfirmation || isPlan || isNewPlan) && typeof item.content === 'string') {
        if (item.content.trim().startsWith('{') || item.content.trim().startsWith('[')) {
          try {
            parsedContent = JSON.parse(item.content);
            messageContent = parsedContent.details
              ? JSON.stringify(parsedContent.details, null, 2)
              : parsedContent.newDetails
              ? JSON.stringify(parsedContent.newDetails, null, 2)
              : item.content;
          } catch (e) {
            console.error('Lỗi parse JSON:', {
              content: item.content,
              messageType: item.messageType,
              error: e.message,
            });
            messageContent = item.content;
            parsedContent = {};
          }
        } else {
          console.warn('Non-JSON content:', { content: item.content, messageType: item.messageType });
          messageContent = item.content;
          parsedContent = {};
        }
      }

      return (
        <>
          {shouldShowDate(chatHistory, index) && (
            <View style={styles.dateSeparator}>
              <Text style={styles.dateSeparatorText}>{formatMessageDate(item.timestamp)}</Text>
            </View>
          )}
          <View
            style={[
              styles.messageContainer,
              isUser ? styles.userMessageContainer : styles.adminMessageContainer,
            ]}
          >
            <View
              style={[styles.nameContainer, isUser ? styles.userNameContainer : styles.adminNameContainer]}
            >
              <Text
                style={[styles.senderName, isUser ? styles.userSenderName : styles.adminSenderName]}
              >
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
                  isConfirmation && styles.confirmationBubble,
                  (isPlan || isNewPlan) && styles.planBubble,
                ]}
              >
                {isImage ? (
                  <TouchableOpacity
                    onPress={() => {
                      setModalImage(item.content);
                      setShowImageModal(true);
                    }}
                  >
                    <Image
                      source={{ uri: item.content }}
                      style={styles.messageImage}
                      resizeMode="cover"
                      onError={(error) =>
                        console.log('Lỗi tải hình ảnh:', error.nativeEvent.error)
                      }
                    />
                  </TouchableOpacity>
                ) : isConfirmation && parsedContent.action === 'confirm' ? (
                  <View>
                    <Text style={[styles.messageText, styles.adminMessageText]}>
                      Vui lòng xác nhận kế hoạch của bạn.
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.confirmButton,
                        (isConfirming || isMessageConfirmed) && styles.confirmButtonDisabled,
                      ]}
                      onPress={async () => {
                        if (!parsedContent.planId) {
                          Alert.alert('Lỗi', 'Không tìm thấy ID kế hoạch để xác nhận.');
                          return;
                        }

                        setIsConfirming(true);
                        try {
                          const tempId = `temp-${Date.now()}`;
                          const userName = user?.fullname || user?.name || '';
                          const confirmMessage = `Tôi xác nhận kế hoạch ${parsedContent.planId}`;
                          dispatch({
                            type: 'chat/addSocketMessage',
                            payload: {
                              _id: tempId,
                              tempId,
                              userId: user._id,
                              receiverId: 'admin',
                              content: confirmMessage,
                              sender: 'user',
                              timestamp: new Date().toISOString(),
                              messageType: 'text',
                              userName,
                            },
                          });

                          if (socketService.socket && socketService.isConnected()) {
                            socketService.sendMessage('admin', confirmMessage, tempId, 'text');
                          } else {
                            await dispatch(
                              sendMessage({
                                senderId: user._id,
                                receiverId: 'admin',
                                message: confirmMessage,
                                senderType: 'user',
                                messageType: 'text',
                                tempId,
                                userName,
                              })
                            ).unwrap();
                          }

                          const response = await fetchWithTimeout(
                            `https://apidatn.onrender.com/plan/confirm-to-pending/${parsedContent.planId}`,
                            {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'user-id': user._id,
                              },
                              body: JSON.stringify({ status: 'not_deposited' }),
                            }
                          );
                          const result = await response.json();
                          if (!response.ok) {
                            throw new Error(result.message || 'Lỗi cập nhật trạng thái');
                          }
                          setConfirmedMessages((prev) => [...prev, item._id]); // Mark as confirmed
                          Alert.alert('Thành công', 'Kế hoạch đã được xác nhận.');
                          dispatch(fetchChatHistory(user._id));
                        } catch (error) {
                          console.error('Lỗi xác nhận:', {
                            planId: parsedContent.planId,
                            error: error.message,
                            stack: error.stack,
                          });
                          Alert.alert('Lỗi', `Không thể xác nhận kế hoạch: ${error.message}`);
                        } finally {
                          setIsConfirming(false);
                        }
                      }}
                      disabled={isConfirming || isMessageConfirmed}
                    >
                      <Text style={styles.confirmButtonText}>Xác nhận</Text>
                    </TouchableOpacity>
                  </View>
                ) : isNewPlan && parsedContent.action === 'new_plan' ? (
                  <View>
                    <Text style={[styles.messageText, styles.adminMessageText]}>
                      Kế hoạch mới đã được đề xuất:
                    </Text>
                    <Text style={[styles.messageText, styles.adminMessageText]}>
                      {messageContent}
                    </Text>
                    <View style={styles.buttonRow}>
                      {/* Nút Xác nhận kế hoạch mới */}
                      <TouchableOpacity
                        style={[
                          styles.confirmButton,
                          (isConfirming || isMessageConfirmed) && styles.confirmButtonDisabled,
                        ]}
                        onPress={async () => {
                          const originalPlanId = planId || (() => {
                            const planMessage = chatHistory.find(
                              (msg) => msg.messageType === 'plan' && msg.sender === 'user'
                            );
                            if (!planMessage) {
                              console.warn('Không tìm thấy tin nhắn plan trong chatHistory');
                              return null;
                            }
                            try {
                              const parsed = JSON.parse(planMessage.content);
                              if (!parsed.planId) {
                                console.warn('Tin nhắn plan không chứa planId:', planMessage.content);
                                return null;
                              }
                              return parsed.planId;
                            } catch (e) {
                              console.error('Lỗi parse JSON plan message:', {
                                content: planMessage.content,
                                error: e.message,
                              });
                              return null;
                            }
                          })();
                          
                          if (!originalPlanId || !parsedContent.planId) {
                            Alert.alert(
                              'Lỗi',
                              'Không tìm thấy ID kế hoạch gốc hoặc kế hoạch mới. Vui lòng kiểm tra lại.'
                            );
                            return;
                          }

                          setIsConfirming(true);
                          try {
                            const tempId = `temp-${Date.now()}`;
                            const userName = user?.fullname || user?.name || '';
                            const confirmMessage = `Tôi xác nhận kế hoạch mới ${parsedContent.planId}`;
                            dispatch({
                              type: 'chat/addSocketMessage',
                              payload: {
                                _id: tempId,
                                tempId,
                                userId: user._id,
                                receiverId: 'admin',
                                content: confirmMessage,
                                sender: 'user',
                                timestamp: new Date().toISOString(),
                                messageType: 'text',
                                userName,
                              },
                            });
                          
                            if (socketService.socket && socketService.isConnected()) {
                              socketService.sendMessage('admin', confirmMessage, tempId, 'text');
                            } else {
                              await dispatch(
                                sendMessage({
                                  senderId: user._id,
                                  receiverId: 'admin',
                                  message: confirmMessage,
                                  senderType: 'user',
                                  messageType: 'text',
                                  tempId,
                                  userName,
                                })
                              ).unwrap();
                            }
                          
                            const response = await fetchWithTimeout(
                              `https://apidatn.onrender.com/plan/override/${originalPlanId}`,
                              {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'user-id': user._id,
                                },
                                body: JSON.stringify({ newPlanId: parsedContent.planId }),
                              },
                              30000 // Tăng timeout lên 30 giây
                            );
                          
                            const result = await response.json();
                            console.log('API Response:', { status: response.status, body: result });
                          
                            if (!response.ok) {
                              throw new Error(result.message || 'Lỗi cập nhật trạng thái');
                            }
                          
                            setConfirmedMessages((prev) => [...prev, item._id]);
                            Alert.alert('Thành công', 'Kế hoạch đã được cập nhật.');
                            dispatch(fetchChatHistory(user._id)); // Làm mới lịch sử chat
                          } catch (error) {
                            console.error('Lỗi xác nhận kế hoạch mới:', {
                              originalPlanId,
                              newPlanId: parsedContent.planId,
                              error: error.message,
                              stack: error.stack,
                            });
                            Alert.alert('Lỗi', `Không thể xác nhận kế hoạch mới: ${error.message}`);
                          } finally {
                            setIsConfirming(false);
                          }
                        }}
                        disabled={isConfirming || isMessageConfirmed}
                      >
                        <Text style={styles.confirmButtonText}>Xác nhận</Text>
                      </TouchableOpacity>

                      {/* Nút Hủy kế hoạch mới */}
                      <TouchableOpacity
                        style={[
                          styles.cancelButton,
                          (isConfirming || isMessageConfirmed) && styles.cancelButtonDisabled,
                        ]}
                        onPress={() => {
                          if (!parsedContent.planId) {
                            Alert.alert('Lỗi', 'Không tìm thấy thông tin kế hoạch để hủy.');
                            return;
                          }

                          Alert.alert(
                            'Xác nhận hủy',
                            'Bạn có chắc muốn hủy kế hoạch mới này?',
                            [
                              { text: 'Hủy', style: 'cancel' },
                              {
                                text: 'Đồng ý',
                                onPress: async () => {
                                  setIsConfirming(true);
                                  try {
                                    const tempId = `temp-${Date.now()}`;
                                    const userName = user?.fullname || user?.name || '';
                                    const cancelMessage = `Tôi hủy kế hoạch mới ${parsedContent.planId}`;
                                    dispatch({
                                      type: 'chat/addSocketMessage',
                                      payload: {
                                        _id: tempId,
                                        tempId,
                                        userId: user._id,
                                        receiverId: 'admin',
                                        content: cancelMessage,
                                        sender: 'user',
                                        timestamp: new Date().toISOString(),
                                        messageType: 'text',
                                        userName,
                                      },
                                    });

                                    if (socketService.socket && socketService.isConnected()) {
                                      socketService.sendMessage('admin', cancelMessage, tempId, 'text');
                                    } else {
                                      await dispatch(
                                        sendMessage({
                                          senderId: user._id,
                                          receiverId: 'admin',
                                          message: cancelMessage,
                                          senderType: 'user',
                                          messageType: 'text',
                                          tempId,
                                          userName,
                                        })
                                      ).unwrap();
                                    }

                                    const response = await fetchWithTimeout(
                                      `https://apidatn.onrender.com/plan/cancel/${parsedContent.planId}`,
                                      {
                                        method: 'DELETE',
                                        headers: {
                                          'Content-Type': 'application/json',
                                          'user-id': user._id,
                                        },
                                      }
                                    );
                                    const result = await response.json();
                                    if (!response.ok) {
                                      throw new Error(result.message || 'Lỗi hủy kế hoạch');
                                    }
                                    setConfirmedMessages((prev) => [...prev, item._id]); // Mark as canceled
                                    Alert.alert('Thành công', 'Kế hoạch mới đã bị hủy.');
                                    dispatch(fetchChatHistory(user._id));
                                  } catch (error) {
                                    console.error('Lỗi hủy kế hoạch mới:', {
                                      newPlanId: parsedContent.planId,
                                      error: error.message,
                                      stack: error.stack,
                                    });
                                    Alert.alert('Lỗi', `Không thể hủy kế hoạch mới: ${error.message}`);
                                  } finally {
                                    setIsConfirming(false);
                                  }
                                },
                              },
                            ]
                          );
                        }}
                        disabled={isConfirming || isMessageConfirmed}
                      >
                        <Text style={styles.cancelButtonText}>Hủy</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : isPlan ? (
                  <Text
                    style={[styles.messageText, isUser ? styles.userMessageText : styles.adminMessageText]}
                  >
                    {messageContent}
                  </Text>
                ) : (
                  <Text
                    style={[styles.messageText, isUser ? styles.userMessageText : styles.adminMessageText]}
                  >
                    {messageContent}
                  </Text>
                )}
              </View>
              {isUser &&
                (formattedAvatar ? (
                  <Image
                    source={{ uri: formattedAvatar }}
                    style={styles.userAvatarImage}
                    onError={(error) =>
                      console.log('Lỗi tải avatar:', error.nativeEvent.error)
                    }
                  />
                ) : (
                  <View style={styles.userAvatarContainer}>
                    <Ionicons name="person" size={18} color="#fff" />
                  </View>
                ))}
            </View>
            <View
              style={[styles.timeContainer, isUser ? styles.userTimeContainer : styles.adminTimeContainer]}
            >
              <Text style={[styles.timeText, isUser ? styles.userTimeText : styles.adminTimeText]}>
                {formatMessageTime(item.timestamp)}
              </Text>
            </View>
          </View>
        </>
      );
    },
    [user, formattedAvatar, chatHistory, planId, dispatch, isConfirming, confirmedMessages]
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
          <Text style={styles.emptySubText}>
            Bắt đầu cuộc trò chuyện với đội hỗ trợ của chúng tôi ngay bây giờ!
          </Text>
        </View>
      );
    } else {
      return (
        <>
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
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />
          {showScrollButton && (
            <TouchableOpacity style={styles.scrollBottomButton} onPress={scrollToBottom}>
              <Ionicons name="arrow-down" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
        </>
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

      <Modal visible={showImageModal} transparent={true} onRequestClose={() => setShowImageModal(false)}>
        <View style={styles.imageModal}>
          <View style={styles.imageModalContent}>
            <Image source={{ uri: modalImage }} style={styles.imageModalImage} resizeMode="contain" />
            <TouchableOpacity
              style={styles.imageModalClose}
              onPress={() => setShowImageModal(false)}
            >
              <Ionicons name="close" size={30} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Chat;

// Styles
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
  dateSeparator: {
    alignSelf: 'center',
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginVertical: 10,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Playfair_me',
  },
  scrollBottomButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#7A60FF',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  imageModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    position: 'relative',
    width: '90%',
    height: '80%',
  },
  imageModalImage: {
    width: '100%',
    height: '100%',
  },
  imageModalClose: {
    position: 'absolute',
    top: -40,
    right: -40,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 10,
  },
  confirmationBubble: {
    backgroundColor: '#E6E6FA',
    padding: 16,
  },
  planBubble: {
    padding: 16,
    backgroundColor: '#E6E6FA',
  },
  confirmButton: {
    backgroundColor: '#7A60FF',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
    flex: 1,
  },
  confirmButtonDisabled: {
    backgroundColor: '#B0A1FF',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Playfair_me',
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  cancelButtonDisabled: {
    backgroundColor: '#FFB6B6',
  },
  cancelButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Playfair_me',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});