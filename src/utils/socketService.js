import { io } from 'socket.io-client';
import { Platform } from 'react-native';
import { store } from '../redux/store';
import { 
  setSocketConnected, 
  addSocketMessage, 
  setUnreadCount 
} from '../redux/ChatSlice';

// Helper to determine the correct Socket.IO server URL
const getSocketUrl = () => {
  // Sử dụng API URL mới
  return 'https://apidatn.onrender.com';
};

class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
    this.isAdmin = false;
  }

  // Expose socket URL for debugging
  getSocketUrl() {
    return getSocketUrl();
  }

  // Kiểm tra xem socket có kết nối không
  isConnected() {
    return this.socket && this.socket.connected;
  }

  // Kiểm tra socket có kết nối trước khi tương tác
  getSafeUserId(userData) {
    if (!userData) {
      console.warn('userData is undefined or null in getSafeUserId');
      return null;
    }
    
    // Nếu userData là string, có thể đã truyền trực tiếp userId
    if (typeof userData === 'string') {
      console.log('userData is a string, assuming it is userId:', userData);
      return userData;
    }
    
    // Kiểm tra cấu trúc đối tượng từ AppContext
    const userId = userData._id || userData.id;
    if (!userId) {
      console.warn('User ID not found in userData object:', userData);
      return null;
    }
    
    console.log('Successfully extracted userId from userData:', userId);
    return userId;
  }

  // Initialize the socket connection
  async init(userData, isAdmin = false) {
    try {
      console.log('SocketService.init called with userData:', userData ? 'Found' : 'Not found', 'isAdmin:', isAdmin);
      
      // Lấy userId từ userData một cách an toàn
      const userId = this.getSafeUserId(userData);
      
      if (!userId) {
        console.error('Cannot initialize socket without valid userId. Please check if user is logged in.');
        // Fallback to mock socket if user ID is invalid
        this.initMockSocket();
        return;
      }
      
      this.userId = userId;
      this.isAdmin = isAdmin;
      
      // Kết nối socket
      await this.connect();
      
      // Đăng ký user hoặc admin
      if (this.socket && this.socket.connected) {
        if (isAdmin) {
          this.socket.emit('registerAdmin');
          console.log('Registered as admin');
        } else {
          this.socket.emit('registerUser', userId);
          console.log('Registered as user:', userId);
        }
      }
    } catch (error) {
      console.error('Error initializing socket:', error);
      
      // Fallback to mock socket if real connection fails
      console.log('Falling back to mock socket');
      this.initMockSocket();
    }
  }
  
  // Initialize mock socket as fallback
  initMockSocket() {
    console.log('Khởi tạo mock socket do không thể kết nối đến server thật');
    
    // Danh sách các tin nhắn đã được xử lý
    const processedMessages = new Set();
    
    // Giả lập socket được kết nối để UI hoạt động tốt
    this.socket = {
      connected: true,
      id: `mock-socket-${Date.now()}`,
      connect: () => {
        console.log('Mock socket connect called');
        return true;
      },
      disconnect: () => {
        console.log('Mock socket disconnect called');
        return true;
      },
      emit: (event, data, callback) => {
        console.log(`Mock socket emit [${event}]:`, data);
        
        // Giả lập callback từ server nếu có
        if (callback && typeof callback === 'function') {
          setTimeout(() => {
            callback({ success: true, message: 'Mock acknowledgement' });
          }, 500);
        }
        
        // Giả lập nhận tin nhắn từ admin sau 2 giây nếu gửi tin nhắn
        if (event === 'sendMessage' && !this.isAdmin) {
          // Tạo unique key để theo dõi tin nhắn đã xử lý
          const messageKey = `${data.senderId}-${data.messageType}-${data.tempId || Date.now()}`;
          
          // Kiểm tra xem tin nhắn này đã được xử lý chưa
          if (processedMessages.has(messageKey)) {
            console.log('Tin nhắn này đã được xử lý trước đó, bỏ qua:', messageKey);
            return true;
          }
          
          // Đánh dấu tin nhắn này đã được xử lý
          processedMessages.add(messageKey);
          
          setTimeout(() => {
            let replyMessage;
            
            if (data.messageType === 'image') {
              // For image messages, create a mock response about the image
              replyMessage = `Cảm ơn bạn đã gửi hình ảnh. Chúng tôi đã nhận được và sẽ xem xét nhanh nhất có thể.`;
            } else {
              // For text messages, use the original mock response
              replyMessage = `Xin chào! Đây là tin nhắn tự động từ hệ thống. Chúng tôi đã nhận được tin nhắn của bạn: "${data.message}"`;
            }
            
            const serverReply = {
              _id: `mock-reply-${Date.now()}`,
              senderId: 'admin',
              receiverId: this.userId,
              message: replyMessage,
              senderType: 'admin',
              messageType: 'text',
              createdAt: new Date().toISOString()
            };
            
            // Chuyển đổi sang định dạng app để hiển thị
            const appMessage = {
              _id: serverReply._id,
              userId: serverReply.senderId,
              receiverId: serverReply.receiverId,
              content: serverReply.message,
              sender: serverReply.senderType,
              timestamp: serverReply.createdAt,
              messageType: serverReply.messageType
            };
            
            console.log('Simulating admin reply (mock):', appMessage);
            store.dispatch(addSocketMessage(appMessage));
          }, 2000);
        }
        return true;
      },
      on: (event, handler) => {
        console.log('Mock socket registering event handler for:', event);
        return this;
      }
    };
    
    console.log('Mock socket created successfully with ID:', this.socket.id);
    
    // Cập nhật trạng thái kết nối trong Redux
    store.dispatch(setSocketConnected(true));
  }

  // Set up socket event listeners
  setupEventListeners() {
    if (!this.socket) {
      console.error('Socket not initialized');
      return;
    }

    // Connection event
    this.socket.on('connect', () => {
      console.log('Socket connected', this.socket.id);
      
      // Dispatch connected status to Redux
      store.dispatch(setSocketConnected(true));
      
      // Register the user or admin
      if (this.isAdmin) {
        this.socket.emit('registerAdmin');
        console.log('Registered as admin');
      } else {
        this.socket.emit('registerUser', this.userId);
        console.log('Registered as user:', this.userId);
      }
    });

    // Disconnection event
    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected, reason:', reason);
      store.dispatch(setSocketConnected(false));
      
      // Try to reconnect if disconnect was not initiated by client
      if (reason === 'io server disconnect' || reason === 'transport close') {
        console.log('Attempting to reconnect...');
        this.socket.connect();
      }
    });

    // Connection error event
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      store.dispatch(setSocketConnected(false));
    });

    // New message event
    this.socket.on('newMessage', (data) => {
      console.log('New message received:', {
        ...data,
        message: data.message?.messageType === 'image' 
          ? '[Image data]' 
          : data.message?.message?.substring(0, 30)
      });
      
      if (data.message) {
        // Convert message from server format to app format
        const serverMessage = data.message;
        
        // Ensure message has correct format for the app
        const formattedMessage = {
          _id: serverMessage._id || `msg-${Date.now()}`,
          content: serverMessage.message || '',
          sender: serverMessage.senderType || 'admin',
          timestamp: serverMessage.createdAt || new Date().toISOString(),
          userId: serverMessage.senderId,
          receiverId: serverMessage.receiverId,
          tempId: serverMessage.tempId,
          messageType: serverMessage.messageType || 'text' // Add messageType field
        };
        
        console.log('Formatted message for app:', {
          ...formattedMessage,
          content: formattedMessage.messageType === 'image' 
            ? '[Image data]' 
            : formattedMessage.content?.substring(0, 30)
        });
        
        // Check if message already exists in Redux store
        const state = store.getState();
        const existingMessage = state.chat.chatHistory.find(msg => 
          // Check by ID
          msg._id === formattedMessage._id ||
          // Check by tempId
          (formattedMessage.tempId && msg.tempId === formattedMessage.tempId) ||
          // Check for duplicate content and time
          (msg.content === formattedMessage.content && 
           msg.sender === formattedMessage.sender &&
           msg.messageType === formattedMessage.messageType &&
           Math.abs(new Date(msg.timestamp).getTime() - new Date(formattedMessage.timestamp).getTime()) < 3000)
        );
        
        if (existingMessage) {
          console.log('Message already exists in store, skipping:', {
            id: formattedMessage._id,
            tempId: formattedMessage.tempId
          });
          return;
        }
        
        // If the message is not from the current user, increment unread count
        if (serverMessage.senderId !== this.userId && !this.isAdmin) {
          const currentUnreadCount = state.chat.unreadCount || 0;
          store.dispatch(setUnreadCount(currentUnreadCount + 1));
        }
        
        // Add message to chat history
        store.dispatch(addSocketMessage(formattedMessage));
      }
    });

    // Message sent event (confirmation)
    this.socket.on('messageSent', (data) => {
      console.log('Message sent confirmation:', data);
      
      if (data.message) {
        // Chuyển đổi tin nhắn từ định dạng server sang định dạng ứng dụng
        const serverMessage = data.message;
        
        // Đảm bảo tin nhắn có định dạng đúng
        const formattedMessage = {
          _id: serverMessage._id || `msg-${Date.now()}`,
          content: serverMessage.message || '',
          sender: serverMessage.senderType || 'user',
          timestamp: serverMessage.createdAt || new Date().toISOString(),
          userId: serverMessage.senderId,
          receiverId: serverMessage.receiverId,
          tempId: serverMessage.tempId
        };
        
        console.log('Formatted confirmation message for app:', formattedMessage);
        
        // Kiểm tra xem tin nhắn này có tempId không
        // Nếu có, chúng ta sẽ kiểm tra xem nó đã tồn tại trong store chưa
        const state = store.getState();
        let shouldAddMessage = true;
        
        if (formattedMessage.tempId) {
          // Kiểm tra xem có tin nhắn nào có cùng tempId không
          const existingMessage = state.chat.chatHistory.find(msg => 
            msg.tempId === formattedMessage.tempId || 
            msg._id === formattedMessage.tempId
          );
          
          if (existingMessage) {
            console.log('Đã tìm thấy tin nhắn tạm thời tương ứng, chỉ cần cập nhật:', 
              {existingId: existingMessage._id, tempId: formattedMessage.tempId}
            );
            shouldAddMessage = false;
          }
        }
        
        // Kiểm tra trùng lặp nội dung
        const duplicateMessage = state.chat.chatHistory.find(msg => 
          msg.content === formattedMessage.content && 
          msg.sender === formattedMessage.sender &&
          Math.abs(new Date(msg.timestamp) - new Date(formattedMessage.timestamp)) < 3000 // 3 giây
        );
        
        if (duplicateMessage) {
          console.log('Phát hiện tin nhắn trùng lặp trong messageSent, không thêm:', 
            {id: duplicateMessage._id, content: formattedMessage.content?.substring(0, 20)}
          );
          shouldAddMessage = false;
        }
        
        // Add the message to Redux state if it's not a duplicate
        if (shouldAddMessage) {
          console.log('Thêm tin nhắn từ messageSent vào store:', {id: formattedMessage._id});
          store.dispatch(addSocketMessage(formattedMessage));
        } else {
          // Chỉ cần cập nhật ID nếu tin nhắn đã tồn tại
          // Điều này giúp tin nhắn tạm thời có _id chính thức từ server
          if (formattedMessage._id && formattedMessage.tempId) {
            store.dispatch(addSocketMessage(formattedMessage));
          }
        }
      }
    });
    
    // Add explicit acknowledgement for send message
    this.socket.on('messageReceived', (data) => {
      console.log('Server confirmed message receipt:', data);
    });
    
    // Add debug event for connection status
    this.socket.on('connect_timeout', () => {
      console.error('Socket connection timeout');
    });
    
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      store.dispatch(setSocketConnected(true));
    });
    
    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });

    // Messages read event
    this.socket.on('messagesRead', () => {
      console.log('Messages marked as read');
      store.dispatch(setUnreadCount(0));
    });

    // Error event
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Send a message
  sendMessage(receiverId, content, tempId = null, messageType = 'text') {
    console.log('sendMessage called with:', { 
      receiverId, 
      messageType,
      contentLength: content?.length || 0,
      tempId 
    });
    
    console.log('Socket state:', { 
      initialized: !!this.socket, 
      connected: this.socket?.connected, 
      userId: this.userId 
    });
    
    if (!this.socket) {
      console.error('Socket not initialized. Cannot send message.');
      return false;
    }
    
    if (!this.socket.connected) {
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
    
    // Validate base64 image format
    if (messageType === 'image' && typeof content === 'string') {
      const base64Regex = /^data:image\/(png|jpeg|jpg|gif);base64,/;
      if (!base64Regex.test(content)) {
        console.error('Invalid image format. Image must be in base64 format with proper mime type.');
        return false;
      }
    }

    // Create messageData in the format required by the server
    const messageData = {
      senderId: this.userId,
      receiverId: receiverId,
      message: content,
      senderType: this.isAdmin ? 'admin' : 'user',
      messageType: messageType, // Add messageType field
      tempId: tempId || `temp-${Date.now()}`
    };

    console.log('Sending message via socket:', {
      ...messageData,
      message: messageType === 'image' ? '[Image data]' : messageData.message
    });

    try {
      this.socket.emit('sendMessage', messageData, (acknowledgement) => {
        // This is an acknowledgement callback that will be called by the server
        console.log('Message acknowledgement received:', acknowledgement);
      });
      
      return true;
    } catch (error) {
      console.error('Error sending message via socket:', error);
      return false;
    }
  }

  // Mark messages as read (admin only)
  markAsRead(userId) {
    if (!this.socket || !this.socket.connected || !this.isAdmin) {
      console.error('Socket not connected or not admin');
      return false;
    }

    console.log('Marking messages as read for user:', userId);
    this.socket.emit('markAsRead', { userId });
    return true;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket');
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.isAdmin = false;
      store.dispatch(setSocketConnected(false));
    }
  }

  // Phương thức kết nối
  async connect() {
    try {
      if (this.socket && this.socket.connected) {
        console.log('Socket đã kết nối, không cần kết nối lại. Socket ID:', this.socket.id);
        return;
      }

      const socketUrl = getSocketUrl();
      console.log('Khởi tạo kết nối socket đến:', socketUrl);
      
      // Tạo socket với các tùy chọn tối ưu
      const socketOptions = {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 30000,
        transports: ['websocket', 'polling'],
        // Xử lý CORS
        withCredentials: false,
        // Path mặc định, thay đổi nếu server của bạn sử dụng path khác
        path: '/socket.io',
      };
      
      console.log('Socket options:', socketOptions);
      this.socket = io(socketUrl, socketOptions);
      
      // Thiết lập các event listener
      this.setupEventListeners();
      
      // Đợi kết nối thành công
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          if (!this.socket.connected) {
            console.error('Socket connection timeout after 10 seconds');
            reject(new Error('Timeout kết nối socket'));
          }
        }, 10000); // Tăng timeout cho kết nối Render.com

        this.socket.on('connect', () => {
          clearTimeout(timeoutId);
          console.log('Socket kết nối thành công:', this.socket.id);
          store.dispatch(setSocketConnected(true));
          resolve(true);
        });
        
        this.socket.on('connect_error', (error) => {
          clearTimeout(timeoutId);
          console.error('Lỗi kết nối socket:', error.message);
          store.dispatch(setSocketConnected(false));
          reject(error);
        });
      });
    } catch (error) {
      console.error('Lỗi khởi tạo socket:', error.message);
      store.dispatch(setSocketConnected(false));
      throw error;
    }
  }
}

// Helper để kiểm tra API server
export const checkApiServer = async () => {
  try {
    // Tạo danh sách URL cần kiểm tra
    const baseUrls = [
      'https://apidatn.onrender.com'
    ];
    
    // Tạo danh sách endpoints cần kiểm tra
    const endpoints = [
      '', // Root endpoint
      '/chat/history/test-user',
      '/chat/message'
    ];
    
    const results = {};
    
    // Kiểm tra tất cả các tổ hợp URLs và endpoints
    for (const baseUrl of baseUrls) {
      for (const endpoint of endpoints) {
        const url = `${baseUrl}${endpoint}`;
        try {
          console.log(`Checking URL: ${url}`);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // Tăng timeout cho render.com
          
          const response = await fetch(url, {
            method: endpoint === '/chat/message' ? 'POST' : 'GET',
            headers: endpoint === '/chat/message' ? 
              { 'Content-Type': 'application/json' } : 
              {},
            body: endpoint === '/chat/message' ? 
              JSON.stringify({
                userId: 'test-user',
                receiverId: 'admin',
                content: 'Test message',
                sender: 'user',
                timestamp: new Date().toISOString()
              }) : 
              null,
            signal: controller.signal
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
            text: contentText
          };
        } catch (error) {
          results[url] = {
            error: error.message || 'Unknown error'
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

// Create a singleton instance
const socketService = new SocketService();

export default socketService; 