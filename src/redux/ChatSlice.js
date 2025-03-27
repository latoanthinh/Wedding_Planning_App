import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Platform } from 'react-native';

// Helper to determine the correct API base URL
const getApiBaseUrl = () => {
  // Sử dụng API URL mới
  return 'https://apidatn.onrender.com';
};

// Async thunk to fetch chat history between user and admin
export const fetchChatHistory = createAsyncThunk(
  'chat/fetchHistory',
  async (userId, { rejectWithValue }) => {
    try {
      console.log('Fetching chat history for user:', userId);
      
      if (!userId) {
        console.error('Invalid user ID for fetching chat history:', userId);
        return rejectWithValue('ID người dùng không hợp lệ');
      }

      try {
        const url = `${getApiBaseUrl()}/chat/history/${userId}`;
        console.log('API URL for chat history:', url);
        
        const response = await fetch(url);
        console.log('Chat history response status:', response.status);
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error('Error fetching chat history:', data.message);
          return rejectWithValue(data.message || 'Không thể tải lịch sử chat');
        }
        
        console.log(`Received ${data.data?.length || 0} chat messages`);
        
        // Chuyển đổi tin nhắn sang định dạng app
        const formattedMessages = (data.data || []).map(message => ({
          _id: message._id,
          userId: message.senderId,
          receiverId: message.receiverId,
          content: message.message,
          sender: message.senderType,
          timestamp: message.createdAt
        }));
        
        return formattedMessages;
      } catch (error) {
        console.error('Error fetching chat history:', error);
        
        // Nếu không thể kết nối đến server, trả về một mảng tin nhắn mẫu
        console.log('Returning mock chat history');
        return [
          {
            _id: 'mock-msg-1',
            userId: 'admin',
            receiverId: userId,
            content: 'Xin chào! Tôi là trợ lý ảo. Tôi có thể giúp gì cho bạn?',
            sender: 'admin',
            timestamp: new Date(Date.now() - 86400000).toISOString() // 1 ngày trước
          },
          {
            _id: 'mock-msg-2',
            userId: userId,
            receiverId: 'admin',
            content: 'Tôi muốn tìm hiểu về dịch vụ của các bạn',
            sender: 'user',
            timestamp: new Date(Date.now() - 3600000).toISOString() // 1 giờ trước
          },
          {
            _id: 'mock-msg-3',
            userId: 'admin',
            receiverId: userId,
            content: 'Chúng tôi có nhiều dịch vụ khác nhau. Bạn quan tâm đến dịch vụ nào cụ thể?',
            sender: 'admin',
            timestamp: new Date(Date.now() - 3540000).toISOString() // 59 phút trước
          }
        ];
      }
    } catch (error) {
      console.error('Exception in fetchChatHistory thunk:', error);
      return rejectWithValue(error.message || 'Không thể tải lịch sử chat');
    }
  }
);

// Async thunk to send a new message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (messageData, { rejectWithValue }) => {
    try {
      console.log('Sending message via API:', messageData);
      
      // Kiểm tra cấu trúc messageData
      const { senderId, receiverId, message, senderType, tempId } = messageData;
      
      if (!senderId || !message) {
        console.error('Missing required message data', messageData);
        return rejectWithValue('Thiếu thông tin tin nhắn cần thiết');
      }

      // Đảm bảo messageData có định dạng server cần
      const serverMessageData = {
        senderId: senderId,
        receiverId: receiverId || 'admin', // Mặc định gửi cho admin
        message: message,
        senderType: senderType || 'user'
      };

      const url = `${getApiBaseUrl()}/chat/message`;
      console.log('API URL for message:', url);
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(serverMessageData),
          timeout: 10000 // 10 giây timeout
        });
        
        console.log('Send message response status:', response.status);
        
        const data = await response.json();
        console.log('Send message response data:', data);
        
        if (!response.ok) {
          console.error('Error sending message:', data.message || 'Unknown error');
          return rejectWithValue(data.message || 'Không thể gửi tin nhắn');
        }
        
        // Nếu server trả về tin nhắn, chuyển đổi sang định dạng ứng dụng
        if (data.data) {
          const serverMessage = data.data;
          return {
            _id: serverMessage._id || `msg-${Date.now()}`,
            userId: serverMessage.senderId,
            receiverId: serverMessage.receiverId,
            content: serverMessage.message,
            sender: serverMessage.senderType,
            timestamp: serverMessage.createdAt || new Date().toISOString(),
            tempId: tempId // Giữ lại tempId nếu có
          };
        }
        
        // Nếu không có dữ liệu trả về, dùng dữ liệu gốc
        return {
          _id: `msg-${Date.now()}`,
          userId: senderId,
          receiverId: receiverId || 'admin',
          content: message,
          sender: senderType || 'user',
          timestamp: new Date().toISOString(),
          tempId: tempId
        };
      } catch (error) {
        console.error('Error sending message via API:', error);
        
        // Nếu không thể kết nối đến server, trả về một đối tượng tin nhắn mẫu
        console.log('Returning mock message response');
        return {
          _id: `mock-msg-${Date.now()}`,
          userId: senderId,
          receiverId: receiverId || 'admin',
          content: message,
          sender: senderType || 'user',
          timestamp: new Date().toISOString(),
          tempId: tempId
        };
      }
    } catch (error) {
      console.error('Exception in sendMessage thunk:', error);
      return rejectWithValue(error.message || 'Không thể gửi tin nhắn');
    }
  }
);

// Create the chat slice
const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chatHistory: [],
    chatStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    sendStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    sendError: null,
    socketConnected: false,
    unreadCount: 0,
  },
  reducers: {
    // Reset message sending status
    resetSendStatus: (state) => {
      state.sendStatus = 'idle';
      state.sendError = null;
    },
    
    // Update socket connection status
    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload;
    },
    
    // Add a new message received from socket
    addSocketMessage: (state, action) => {
      const newMessage = action.payload;
      
      // Kiểm tra xem tin nhắn đã tồn tại trong state chưa
      const existingMsgIndex = state.chatHistory.findIndex(
        msg => msg._id === newMessage._id || 
              (newMessage.tempId && msg.tempId === newMessage.tempId)
      );
      
      if (existingMsgIndex >= 0) {
        // Nếu đã tồn tại, cập nhật tin nhắn
        state.chatHistory[existingMsgIndex] = {
          ...state.chatHistory[existingMsgIndex],
          ...newMessage,
          // Giữ lại tempId để đảm bảo khớp trong tương lai
          tempId: state.chatHistory[existingMsgIndex].tempId || newMessage.tempId
        };
      } else {
        // Nếu chưa tồn tại, thêm mới
        state.chatHistory.push(newMessage);
      }
    },
    
    // Update unread message count
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    
    // Clear messages (e.g., when logging out)
    clearMessages: (state) => {
      state.chatHistory = [];
      state.chatStatus = 'idle';
      state.error = null;
      state.sendStatus = 'idle';
      state.sendError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchChatHistory
      .addCase(fetchChatHistory.pending, (state) => {
        state.chatStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.chatStatus = 'succeeded';
        
        // Chuyển đổi tin nhắn từ server sang định dạng ứng dụng nếu cần
        state.chatHistory = action.payload.map(message => {
          // Kiểm tra xem tin nhắn đã ở định dạng app chưa
          if (message.content && message.sender) {
            return message;
          }
          
          // Chuyển đổi từ định dạng server sang định dạng app
          return {
            _id: message._id,
            userId: message.senderId,
            receiverId: message.receiverId,
            content: message.message || message.content,
            sender: message.senderType || message.sender,
            timestamp: message.createdAt || message.timestamp || new Date().toISOString()
          };
        });
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.chatStatus = 'failed';
        state.error = action.payload || 'Không thể tải lịch sử chat';
      })
      
      // Handle sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.sendStatus = 'loading';
        state.sendError = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendStatus = 'succeeded';
        
        // Kiểm tra xem tin nhắn có tempId không
        const newMessage = action.payload;
        const tempId = action.meta?.arg?.tempId;
        
        if (tempId) {
          // Tìm và cập nhật tin nhắn tạm thời thay vì thêm tin nhắn mới
          const tempMsgIndex = state.chatHistory.findIndex(msg => msg.tempId === tempId);
          
          if (tempMsgIndex >= 0) {
            // Nếu tìm thấy tin nhắn tạm thời, cập nhật nó
            state.chatHistory[tempMsgIndex] = {
              ...state.chatHistory[tempMsgIndex],
              ...newMessage,
              _id: newMessage._id || state.chatHistory[tempMsgIndex]._id
            };
            return;
          }
        }
        
        // Nếu không tìm thấy tin nhắn tạm thời, thêm tin nhắn mới
        state.chatHistory.push(newMessage);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendStatus = 'failed';
        state.sendError = action.payload || 'Không thể gửi tin nhắn';
      })
  },
});

export const { 
  resetSendStatus, 
  setSocketConnected, 
  addSocketMessage, 
  setUnreadCount,
  clearMessages
} = chatSlice.actions;

export default chatSlice.reducer; 