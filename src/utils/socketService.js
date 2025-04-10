import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../redux/store';
import { 
  setSocketConnected, 
  addSocketMessage, 
  setUnreadCount 
} from '../redux/ChatSlice';

let appContextRef = null;

const getSocketUrl = () => {
  return 'https://apidatn.onrender.com';
};

class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
    this.isAdmin = false;
    this.userName = '';
    this.isMockMode = false;
    this.retryAttempts = 0;
    this.maxRetryAttempts = 5;
    this.retryDelay = 3000;
  }

  setAppContext(context) {
    appContextRef = context;
    if (context && context.user) {
      this.updateUserInfoFromContext(context.user);
    }
  }

  updateUserInfoFromContext(user) {
    if (user) {
      const newUserName = user.fullname || user.name || '';
      const newUserId = user._id || user.id || this.userId;
      if (newUserName !== this.userName || newUserId !== this.userId) {
        this.userName = newUserName;
        this.userId = newUserId;
        console.log('Updated userName from AppContext:', this.userName);
        console.log('Updated userId from AppContext:', this.userId);
        if (this.isConnected()) {
          this.registerUser(this.userId);
        }
      }
    }
  }

  async getUserName() {
    if (this.userName) {
      console.log('UserName đã có sẵn:', this.userName);
      return this.userName;
    }

    if (appContextRef && appContextRef.user) {
      const userName = appContextRef.user.fullname || appContextRef.user.name || '';
      if (userName) {
        this.userName = userName;
        console.log('Lấy userName từ AppContext:', userName);
        return userName;
      }
    }

    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        const userName = userData.fullname || userData.name || '';
        this.userName = userName;
        console.log('Fallback: Lấy userName từ AsyncStorage:', userName);
        return userName;
      }
    } catch (error) {
      console.error('Lỗi khi đọc userName từ AsyncStorage:', error);
    }

    console.log('Không tìm thấy userName, sử dụng giá trị mặc định');
    this.userName = '';
    return this.userName;
  }

  isConnected() {
    return this.socket && this.socket.connected && !this.isMockMode;
  }

  getSafeUserId(userData) {
    if (!userData) {
      console.warn('userData is undefined or null in getSafeUserId');
      return null;
    }

    if (typeof userData === 'string') {
      console.log('userData is a string, assuming it is userId:', userData);
      return userData;
    }

    const userId = userData._id || userData.id;
    if (!userId) {
      console.warn('User ID not found in userData object:', userData);
      return null;
    }

    console.log('Successfully extracted userId from userData:', userId);
    return userId;
  }

  async init(userData, isAdmin = false) {
    try {
      console.log('SocketService.init called with userData:', userData ? 'Found' : 'Not found', 'isAdmin:', isAdmin);

      const userId = this.getSafeUserId(userData);
      if (!userId) {
        console.error('Cannot initialize socket without valid userId.');
        await this.initMockSocket();
        return;
      }

      this.userId = userId;
      this.isAdmin = isAdmin;

      if (userData) {
        this.userName = userData.fullname || userData.name || '';
        console.log('Saved user name from userData param:', this.userName);
      }

      await this.getUserName();
      await this.connect();
    } catch (error) {
      console.error('Error initializing socket:', error);
      await this.initMockSocket();
    }
  }

  async initMockSocket() {
    console.log('Khởi tạo mock socket do không thể kết nối đến server thật');
    this.isMockMode = true;
    await this.getUserName();

    const processedMessages = new Set();

    this.socket = {
      connected: true,
      id: `mock-socket-${Date.now()}`,
      connect: () => {
        console.log('Mock socket connect called');
        return true;
      },
      disconnect: () => {
        console.log('Mock socket disconnect called');
        this.isMockMode = false;
        return true;
      },
      on: (event, callback) => {
        console.log(`Mock socket on [${event}] registered`);
      },
      emit: (event, data, callback) => {
        console.log(`Mock socket emit [${event}]:`, data);

        if (callback && typeof callback === 'function') {
          setTimeout(() => {
            callback({ success: true, message: 'Mock acknowledgement' });
          }, 500);
        }

        if (event === 'sendMessage' && !this.isAdmin) {
          const messageKey = `${data.senderId}-${data.messageType}-${data.tempId || Date.now()}`;
          if (processedMessages.has(messageKey)) {
            console.log('Tin nhắn này đã được xử lý trước đó, bỏ qua:', messageKey);
            return true;
          }

          processedMessages.add(messageKey);

          setTimeout(() => {
            let replyMessage;
            if (data.messageType === 'image') {
              replyMessage = `Cảm ơn bạn đã gửi hình ảnh. Chúng tôi đã nhận được và sẽ xem xét nhanh nhất có thể.`;
            } else {
              replyMessage = `Xin chào! Đây là tin nhắn tự động từ hệ thống. Chúng tôi đã nhận được tin nhắn của bạn: "${data.message}"`;
            }

            const userSentName = data.userName || this.userName;
            console.log(`Mock socket: User sent message with name: ${userSentName}`);

            const serverReply = {
              _id: `mock-reply-${Date.now()}`,
              senderId: 'admin',
              receiverId: this.userId,
              message: replyMessage,
              senderType: 'admin',
              messageType: 'text',
              createdAt: new Date().toISOString(),
            };

            const appMessage = {
              _id: serverReply._id,
              userId: serverReply.senderId,
              receiverId: serverReply.receiverId,
              content: serverReply.message,
              sender: serverReply.senderType,
              timestamp: serverReply.createdAt,
              messageType: serverReply.messageType,
              userName: 'Hỗ trợ khách hàng',
            };

            console.log('Simulating admin reply (mock):', appMessage);
            store.dispatch(addSocketMessage(appMessage));
          }, 2000);
        }
        return true;
      },
    };

    console.log('Mock socket created successfully with ID:', this.socket.id);
    store.dispatch(setSocketConnected(true));

    setTimeout(() => {
      if (this.isMockMode) {
        console.log('Thử kết nối lại socket thật sau khi sử dụng mock socket');
        this.connect();
      }
    }, 30000);
  }

  setupEventListeners() {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    this.socket.on('connect', () => {
      console.log('Socket connected', this.socket.id);
      this.isMockMode = false;
      this.retryAttempts = 0;
      store.dispatch(setSocketConnected(true));
      this.registerUser(this.userId);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected, reason:', reason);
      store.dispatch(setSocketConnected(false));
      if (reason === 'io server disconnect' || reason === 'transport close') {
        console.log('Attempting to reconnect...');
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      store.dispatch(setSocketConnected(false));
      this.retryConnection();
    });

    this.socket.on('newMessage', (data) => {
      console.log('New message received:', {
        ...data,
        message: data.message?.messageType === 'image' ? '[Image data]' : data.message?.message?.substring(0, 30),
      });

      if (data.message) {
        const serverMessage = data.message;
        const formattedMessage = {
          _id: serverMessage._id || `msg-${Date.now()}`,
          content: serverMessage.message || '',
          sender: serverMessage.senderType || 'admin',
          timestamp: serverMessage.createdAt || new Date().toISOString(),
          userId: serverMessage.senderId,
          receiverId: serverMessage.receiverId,
          tempId: serverMessage.tempId,
          messageType: serverMessage.messageType || 'text',
          userName: serverMessage.userName || (serverMessage.senderType === 'user' && serverMessage.senderId === this.userId ? this.userName : 'Hỗ trợ khách hàng'),
        };

        const storeState = store.getState();
        const existingMessage = storeState.chat.chatHistory.find(
          (msg) =>
            msg._id === formattedMessage._id ||
            (formattedMessage.tempId && msg.tempId === formattedMessage.tempId) ||
            (msg.content === formattedMessage.content &&
              msg.sender === formattedMessage.sender &&
              msg.messageType === formattedMessage.messageType &&
              Math.abs(new Date(msg.timestamp).getTime() - new Date(formattedMessage.timestamp).getTime()) < 3000)
        );

        if (existingMessage) {
          console.log('Message already exists in store, skipping:', {
            id: formattedMessage._id,
            tempId: formattedMessage.tempId,
          });
          return;
        }

        if (serverMessage.senderId !== this.userId && !this.isAdmin) {
          const currentUnreadCount = storeState.chat.unreadCount || 0;
          store.dispatch(setUnreadCount(currentUnreadCount + 1));
        }

        store.dispatch(addSocketMessage(formattedMessage));
      }
    });

    this.socket.on('messageSent', (data) => {
      console.log('Message sent confirmation:', data);

      if (data.message) {
        const serverMessage = data.message;
        const formattedMessage = {
          _id: serverMessage._id || `msg-${Date.now()}`,
          content: serverMessage.message || '',
          sender: serverMessage.senderType || 'user',
          timestamp: serverMessage.createdAt || new Date().toISOString(),
          userId: serverMessage.senderId,
          receiverId: serverMessage.receiverId,
          tempId: serverMessage.tempId,
          messageType: serverMessage.messageType || 'text',
          userName: serverMessage.userName || (serverMessage.senderId === this.userId ? this.userName : 'Hỗ trợ khách hàng'),
        };

        const storeState = store.getState();
        let shouldAddMessage = true;

        if (formattedMessage.tempId) {
          const existingMessage = storeState.chat.chatHistory.find(
            (msg) => msg.tempId === formattedMessage.tempId || msg._id === formattedMessage.tempId
          );

          if (existingMessage) {
            console.log('Đã tìm thấy tin nhắn tạm thời tương ứng, chỉ cần cập nhật:', {
              existingId: existingMessage._id,
              tempId: formattedMessage.tempId,
            });
            shouldAddMessage = false;
          }
        }

        const duplicateMessage = storeState.chat.chatHistory.find(
          (msg) =>
            msg.content === formattedMessage.content &&
            msg.sender === formattedMessage.sender &&
            Math.abs(new Date(msg.timestamp) - new Date(formattedMessage.timestamp)) < 3000
        );

        if (duplicateMessage) {
          console.log('Phát hiện tin nhắn trùng lặp trong messageSent, không thêm:', {
            id: duplicateMessage._id,
            content: formattedMessage.content?.substring(0, 20),
          });
          shouldAddMessage = false;
        }

        if (shouldAddMessage) {
          console.log('Thêm tin nhắn từ messageSent vào store:', { id: formattedMessage._id });
          store.dispatch(addSocketMessage(formattedMessage));
        } else if (formattedMessage._id && formattedMessage.tempId) {
          store.dispatch(addSocketMessage(formattedMessage));
        }
      }
    });

    this.socket.on('messageReceived', (data) => {
      console.log('Server confirmed message receipt:', data);
    });

    this.socket.on('connect_timeout', () => {
      console.error('Socket connection timeout');
      this.retryConnection();
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      this.retryAttempts = 0;
      this.isMockMode = false;
      store.dispatch(setSocketConnected(true));
      this.registerUser(this.userId);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
      this.retryConnection();
    });

    this.socket.on('messagesRead', () => {
      console.log('Messages marked as read');
      store.dispatch(setUnreadCount(0));
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  retryConnection() {
    if (this.retryAttempts >= this.maxRetryAttempts) {
      console.log('Đã đạt số lần thử tối đa, chuyển sang mock socket');
      this.initMockSocket();
      return;
    }

    this.retryAttempts += 1;
    const delay = this.retryDelay * Math.pow(2, this.retryAttempts);
    console.log(`Thử kết nối lại lần ${this.retryAttempts}/${this.maxRetryAttempts} sau ${delay}ms`);
    setTimeout(() => {
      if (!this.isConnected() && !this.isMockMode) {
        this.connect();
      }
    }, delay);
  }

  async sendMessage(receiverId, content, tempId = null, messageType = 'text') {
    console.log('sendMessage called with:', {
      receiverId,
      messageType,
      contentLength: content?.length || 0,
      tempId,
    });

    if (!this.socket || !this.socket.connected) {
      console.error('Socket not connected. Cannot send message.');
      return false;
    }

    if (!this.userId) {
      console.error('User ID is missing. Please ensure user is logged in.');
      return false;
    }

    if (!receiverId) {
      console.error('Receiver ID is missing. Cannot send message.');
      return false;
    }

    if (!content || (messageType === 'text' && content.trim() === '')) {
      console.error('Message content is empty. Cannot send empty message.');
      return false;
    }

    if (messageType === 'image' && typeof content === 'string') {
      const base64Regex = /^data:image\/(png|jpeg|jpg|gif);base64,/;
      if (!base64Regex.test(content)) {
        console.error('Invalid image format. Image must be in base64 format with proper mime type.');
        return false;
      }
    }

    await this.getUserName();
    const userName = this.isAdmin ? "Hỗ trợ khách hàng" : this.userName;
    console.log('Using userName for message:', userName);

    const messageData = {
      senderId: this.userId,
      receiverId: receiverId,
      message: content,
      senderType: this.isAdmin ? 'admin' : 'user',
      messageType: messageType,
      tempId: tempId || `temp-${Date.now()}`,
      userName: userName,
    };

    console.log('Sending message via socket:', {
      ...messageData,
      message: messageType === 'image' ? '[Image data]' : messageData.message,
      userName: userName,
    });

    try {
      this.socket.emit('sendMessage', messageData, (acknowledgement) => {
        console.log('Message acknowledgement received:', acknowledgement);
      });
      return true;
    } catch (error) {
      console.error('Error sending message via socket:', error);
      return false;
    }
  }

  markAsRead(userId) {
    if (!this.socket || !this.socket.connected || !this.isAdmin) {
      console.error('Socket not connected or not admin');
      return false;
    }

    console.log('Marking messages as read for user:', userId);
    this.socket.emit('markAsRead', { userId });
    return true;
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket');
      this.socket.removeAllListeners(); // Xóa tất cả listener để tránh lỗi
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.isAdmin = false;
      this.userName = '';
      this.isMockMode = false;
      this.retryAttempts = 0;
      store.dispatch(setSocketConnected(false));
    }
  }

  async connect() {
    try {
      if (this.isConnected()) {
        console.log('Socket đã kết nối, không cần kết nối lại. Socket ID:', this.socket.id);
        this.registerUser(this.userId);
        return;
      }

      if (this.isMockMode) {
        console.log('Đang ở chế độ mock, không kết nối socket thật');
        return;
      }

      const socketUrl = getSocketUrl();
      console.log('Khởi tạo kết nối socket đến:', socketUrl);

      const socketOptions = {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 30000,
        transports: ['websocket', 'polling'],
        withCredentials: false,
        path: '/socket.io',
      };

      console.log('Socket options:', socketOptions);
      this.socket = io(socketUrl, socketOptions);
      this.setupEventListeners();

      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          if (!this.isConnected()) {
            console.error('Socket connection timeout after 10 seconds');
            this.retryConnection();
            reject(new Error('Timeout kết nối socket'));
          }
        }, 10000);

        this.socket.on('connect', () => {
          clearTimeout(timeoutId);
          console.log('Socket kết nối thành công:', this.socket.id);
          this.isMockMode = false;
          store.dispatch(setSocketConnected(true));
          this.registerUser(this.userId);
          resolve(true);
        });

        this.socket.on('connect_error', (error) => {
          clearTimeout(timeoutId);
          console.error('Lỗi kết nối socket:', error.message);
          store.dispatch(setSocketConnected(false));
          this.retryConnection();
          reject(error);
        });
      });
    } catch (error) {
      console.error('Lỗi khởi tạo socket:', error.message);
      store.dispatch(setSocketConnected(false));
      this.retryConnection();
      throw error;
    }
  }

  registerUser(userId) {
    if (!this.isConnected()) {
      console.log('Socket not connected, cannot register user');
      return;
    }
    if (!userId) {
      console.log('UserId không hợp lệ, không thể đăng ký');
      return;
    }
    if (this.isAdmin) {
      this.socket.emit('registerAdmin');
      console.log('Registered as admin');
    } else {
      this.socket.emit('registerUser', userId);
      console.log('Registered as user:', userId);
    }
  }
}

export const checkApiServer = async () => {
  try {
    const baseUrls = ['https://apidatn.onrender.com'];
    const endpoints = ['', '/chat/history/test-user', '/chat/message'];
    const results = {};

    for (const baseUrl of baseUrls) {
      for (const endpoint of endpoints) {
        const url = `${baseUrl}${endpoint}`;
        try {
          console.log(`Checking URL: ${url}`);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const response = await fetch(url, {
            method: endpoint === '/chat/message' ? 'POST' : 'GET',
            headers: endpoint === '/chat/message' ? { 'Content-Type': 'application/json' } : {},
            body: endpoint === '/chat/message'
              ? JSON.stringify({
                  userId: 'test-user',
                  receiverId: 'admin',
                  content: 'Test message',
                  sender: 'user',
                  timestamp: new Date().toISOString(),
                })
              : null,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          let contentText = '';
          try {
            const text = await response.text();
            contentText = text.substring(0, 100);
          } catch (e) {
            contentText = '(Error reading response body)';
          }

          results[url] = {
            status: response.status,
            ok: response.ok,
            text: contentText,
          };
        } catch (error) {
          results[url] = {
            error: error.message || 'Unknown error',
          };
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error checking API server:', error);
    return { error: error.message };
  }
};

const socketService = new SocketService();

export default socketService;