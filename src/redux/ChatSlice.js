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
        
        // Format messages for app display
        const formattedMessages = (data.data || []).map(message => ({
          _id: message._id,
          userId: message.senderId,
          receiverId: message.receiverId,
          content: message.message,
          sender: message.senderType,
          timestamp: message.createdAt,
          messageType: message.messageType || 'text' // Add messageType field with default
        }));
        
        return formattedMessages;
      } catch (error) {
        console.error('Error fetching chat history:', error);
        
        // Return mock messages if cannot connect to server
        console.log('Returning mock chat history');
        return [
          {
            _id: 'mock-msg-1',
            userId: 'admin',
            receiverId: userId,
            content: 'Xin chào! Tôi là trợ lý ảo. Tôi có thể giúp gì cho bạn?',
            sender: 'admin',
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            messageType: 'text'
          },
          {
            _id: 'mock-msg-2',
            userId: userId,
            receiverId: 'admin',
            content: 'Tôi muốn tìm hiểu về dịch vụ của các bạn',
            sender: 'user',
            timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            messageType: 'text'
          },
          {
            _id: 'mock-msg-3',
            userId: 'admin',
            receiverId: userId,
            content: 'Chúng tôi có nhiều dịch vụ khác nhau. Bạn quan tâm đến dịch vụ nào cụ thể?',
            sender: 'admin',
            timestamp: new Date(Date.now() - 3540000).toISOString(), // 59 minutes ago
            messageType: 'text'
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
      console.log('Sending message via API:', {
        ...messageData,
        message: messageData.messageType === 'image' ? '[Image data]' : messageData.message
      });
      
      // Check messageData structure
      const { senderId, receiverId, message, senderType, messageType = 'text', tempId } = messageData;
      
      if (!senderId || !message) {
        console.error('Missing required message data', messageData);
        return rejectWithValue('Thiếu thông tin tin nhắn cần thiết');
      }

      // Ensure messageData has format needed by server
      const serverMessageData = {
        senderId: senderId,
        receiverId: receiverId || 'admin', // Default to admin 
        message: message,
        senderType: senderType || 'user',
        messageType: messageType // Add messageType field
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
          timeout: 10000 // 10 second timeout
        });
        
        console.log('Send message response status:', response.status);
        
        const data = await response.json();
        console.log('Send message response data:', data);
        
        if (!response.ok) {
          console.error('Error sending message:', data.message || 'Unknown error');
          return rejectWithValue(data.message || 'Không thể gửi tin nhắn');
        }
        
        // If server returns message, convert to app format
        if (data.data) {
          const serverMessage = data.data;
          return {
            _id: serverMessage._id || `msg-${Date.now()}`,
            userId: serverMessage.senderId,
            receiverId: serverMessage.receiverId,
            content: serverMessage.message,
            sender: serverMessage.senderType,
            timestamp: serverMessage.createdAt || new Date().toISOString(),
            tempId: tempId, // Keep tempId if present
            messageType: serverMessage.messageType || 'text' // Add messageType field
          };
        }
        
        // If no data returned, use original data
        return {
          _id: `msg-${Date.now()}`,
          userId: senderId,
          receiverId: receiverId || 'admin',
          content: message,
          sender: senderType || 'user',
          timestamp: new Date().toISOString(),
          tempId: tempId,
          messageType: messageType
        };
      } catch (error) {
        console.error('Error sending message via API:', error);
        
        // Return mock message response if cannot connect to server
        console.log('Returning mock message response');
        return {
          _id: `mock-msg-${Date.now()}`,
          userId: senderId,
          receiverId: receiverId || 'admin',
          content: message,
          sender: senderType || 'user',
          timestamp: new Date().toISOString(),
          tempId: tempId,
          messageType: messageType
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
      
      console.log('addSocketMessage được gọi với tin nhắn:', {
        id: newMessage._id,
        tempId: newMessage.tempId,
        content: newMessage.messageType === 'image' 
          ? '[Image data]' 
          : (newMessage.content?.substring(0, 20) + (newMessage.content?.length > 20 ? '...' : '')),
        sender: newMessage.sender,
        messageType: newMessage.messageType
      });
      
      // Check if message already exists in state
      let existingMsgIndex = -1;
      
      // 1. Check by _id
      if (newMessage._id) {
        existingMsgIndex = state.chatHistory.findIndex(msg => msg._id === newMessage._id);
      }
      
      // 2. If not found by _id, check by tempId
      if (existingMsgIndex === -1 && newMessage.tempId) {
        existingMsgIndex = state.chatHistory.findIndex(msg => 
          msg.tempId === newMessage.tempId || 
          (msg._id && newMessage.tempId && msg._id.includes(newMessage.tempId)) ||
          (msg.tempId && newMessage._id && newMessage._id.includes(msg.tempId))
        );
      }
      
      // 3. Check for duplicate content within recent messages
      if (existingMsgIndex === -1 && newMessage.content && newMessage.timestamp) {
        // Only check 10 most recent messages for performance
        const recentMessages = state.chatHistory.slice(-10);
        
        const duplicate = recentMessages.find(msg => 
          msg.content === newMessage.content && 
          msg.sender === newMessage.sender &&
          msg.messageType === newMessage.messageType &&
          Math.abs(new Date(msg.timestamp).getTime() - new Date(newMessage.timestamp).getTime()) < 3000 // 3 seconds
        );
        
        if (duplicate) {
          console.log('Duplicate message detected, skipping:', {
            content: newMessage.messageType === 'image' ? '[Image data]' : newMessage.content?.substring(0, 20),
            existing: duplicate._id
          });
          return;
        }
      }
      
      if (existingMsgIndex >= 0) {
        // If exists, update message
        console.log('Cập nhật tin nhắn đã tồn tại tại vị trí:', existingMsgIndex);
        
        state.chatHistory[existingMsgIndex] = {
          ...state.chatHistory[existingMsgIndex],
          ...newMessage,
          // Keep original ID if new message doesn't have ID
          _id: newMessage._id || state.chatHistory[existingMsgIndex]._id,
          // Keep tempId to ensure future match
          tempId: state.chatHistory[existingMsgIndex].tempId || newMessage.tempId
        };
      } else {
        // If doesn't exist, add new
        console.log('Thêm tin nhắn mới vào state:', {
          id: newMessage._id,
          content: newMessage.content?.substring(0, 20)
        });
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
        
        // Convert messages from server to app format if needed
        state.chatHistory = action.payload.map(message => {
          // Check if message already in app format
          if (message.content && message.sender) {
            return message;
          }
          
          // Convert from server format to app format
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
        
        // Check if message has tempId
        const newMessage = action.payload;
        const tempId = action.meta?.arg?.tempId;
        
        if (tempId) {
          // Find and update temporary message instead of adding new message
          const tempMsgIndex = state.chatHistory.findIndex(msg => msg.tempId === tempId);
          
          if (tempMsgIndex >= 0) {
            // If found temporary message, update it
            state.chatHistory[tempMsgIndex] = {
              ...state.chatHistory[tempMsgIndex],
              ...newMessage,
              _id: newMessage._id || state.chatHistory[tempMsgIndex]._id
            };
            return;
          }
        }
        
        // If no temporary message found, add new message
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