import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Platform } from 'react-native';

// Helper to get the correct API URL based on device
const getApiUrl = () => {
  // For Android Emulator
  if (Platform.OS === 'android') {
    if (!__DEV__) {
      return 'https://apidatn.onrender.com';
    }
    return 'https://apidatn.onrender.com'; // Use the same for development and production
  }
  
  // For iOS Simulator or physical devices
  return 'https://apidatn.onrender.com';
};

// Base URL for API calls
const BASE_URL = getApiUrl();

// Helper to handle response errors
const handleResponseError = async (response) => {
  // First try to parse as JSON
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      // If not JSON, get text for better debugging
      const text = await response.text();
      console.error('Non-JSON response:', text.substring(0, 200) + '...');
      return { message: `Server responded with ${response.status}: ${response.statusText}` };
    }
  } catch (error) {
    console.error('Error parsing response:', error);
    return { message: 'Error parsing server response' };
  }
};

// Async thunk to update user's online status
export const updateUserOnlineStatus = createAsyncThunk(
  'userActivity/updateOnlineStatus',
  async ({ userId, isOnline }, { rejectWithValue }) => {
    try {
      console.log(`Updating user ${userId} status to ${isOnline ? 'online' : 'offline'}`);
      
      // Validate user ID
      if (!userId) {
        console.error('Invalid user ID:', userId);
        return rejectWithValue('ID người dùng không hợp lệ');
      }
      
      // Make API call to update status
      const endpoint = isOnline ? 'online' : 'offline';
      console.log(`API request URL: ${BASE_URL}/users/status/${endpoint}/${userId}`);
      
      const response = await fetch(`${BASE_URL}/users/status/${endpoint}/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log(`Status update response: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await handleResponseError(response);
        console.error('Status update failed:', errorData);
        return rejectWithValue(errorData.message || 'Cập nhật trạng thái thất bại');
      }
      
      const result = await response.json();
      return result.data;
      
    } catch (error) {
      console.error('Error updating user status:', error);
      // Return a more readable error for debugging
      const errorMessage = error.toString ? error.toString() : 'Unknown error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to update user's last active timestamp
export const updateUserActivity = createAsyncThunk(
  'userActivity/updateActivity',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        console.error('Invalid user ID for activity update:', userId);
        return rejectWithValue('ID người dùng không hợp lệ');
      }
      
      console.log(`API request URL: ${BASE_URL}/users/status/active/${userId}`);
      
      const response = await fetch(`${BASE_URL}/users/status/active/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log(`Activity update response: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await handleResponseError(response);
        console.error('Activity update failed:', errorData);
        return rejectWithValue(errorData.message || 'Cập nhật hoạt động thất bại');
      }
      
      const result = await response.json();
      return result.data;
      
    } catch (error) {
      console.error('Error updating user activity:', error);
      const errorMessage = error.toString ? error.toString() : 'Unknown error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to get user's activity status
export const getUserActivityStatus = createAsyncThunk(
  'userActivity/getStatus',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        console.error('Invalid user ID for status check:', userId);
        return rejectWithValue('ID người dùng không hợp lệ');
      }
      
      console.log(`API request URL: ${BASE_URL}/users/status/${userId}`);
      
      const response = await fetch(`${BASE_URL}/users/status/${userId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      console.log(`Status check response: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await handleResponseError(response);
        console.error('Status check failed:', errorData);
        return rejectWithValue(errorData.message || 'Kiểm tra trạng thái thất bại');
      }
      
      const result = await response.json();
      return result.data;
      
    } catch (error) {
      console.error('Error checking user status:', error);
      const errorMessage = error.toString ? error.toString() : 'Unknown error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to get all online users
export const getOnlineUsers = createAsyncThunk(
  'userActivity/getOnlineUsers',
  async (_, { rejectWithValue }) => {
    try {
      console.log(`API request URL: ${BASE_URL}/users/online/all`);
      
      const response = await fetch(`${BASE_URL}/users/online/all`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      console.log(`Online users fetch response: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await handleResponseError(response);
        console.error('Online users fetch failed:', errorData);
        return rejectWithValue(errorData.message || 'Lấy danh sách người dùng online thất bại');
      }
      
      const result = await response.json();
      return result.data;
      
    } catch (error) {
      console.error('Error fetching online users:', error);
      const errorMessage = error.toString ? error.toString() : 'Unknown error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Create UserActivitySlice to manage user activity state
export const UserActivitySlice = createSlice({
  name: 'userActivity',
  initialState: {
    currentUserStatus: null,
    onlineUsers: [],
    statusUpdateStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    activityUpdateStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    statusFetchStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    onlineUsersFetchStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    lastActivityUpdate: null,
    autoUpdateActive: false,
  },
  reducers: {
    // Set auto update mode (for background monitoring)
    setAutoUpdateActive: (state, action) => {
      state.autoUpdateActive = action.payload;
    },
    
    // Reset all status to idle (useful after showing error messages)
    resetStatus: (state) => {
      state.statusUpdateStatus = 'idle';
      state.activityUpdateStatus = 'idle';
      state.statusFetchStatus = 'idle';
      state.onlineUsersFetchStatus = 'idle';
      state.error = null;
    },
    
    // Manual update to the current user status (used for optimistic updates)
    setCurrentUserStatus: (state, action) => {
      if (!state.currentUserStatus) {
        state.currentUserStatus = {};
      }
      
      // Update the current user status with the provided values
      state.currentUserStatus = {
        ...state.currentUserStatus,
        ...action.payload
      };
      
      // If we're setting isOnline to false, also update the timestamp
      if (action.payload.isOnline === false) {
        state.currentUserStatus.lastActive = new Date().toISOString();
      }
      
      state.lastActivityUpdate = new Date().toISOString();
      console.log('Updated current user status locally:', state.currentUserStatus);
    }
  },
  extraReducers: (builder) => {
    builder
      // Update online status reducers
      .addCase(updateUserOnlineStatus.pending, (state) => {
        state.statusUpdateStatus = 'loading';
        state.error = null;
      })
      .addCase(updateUserOnlineStatus.fulfilled, (state, action) => {
        state.statusUpdateStatus = 'succeeded';
        state.currentUserStatus = action.payload;
        state.lastActivityUpdate = new Date().toISOString();
      })
      .addCase(updateUserOnlineStatus.rejected, (state, action) => {
        state.statusUpdateStatus = 'failed';
        state.error = action.payload;
      })
      
      // Update activity reducers
      .addCase(updateUserActivity.pending, (state) => {
        state.activityUpdateStatus = 'loading';
        state.error = null;
      })
      .addCase(updateUserActivity.fulfilled, (state, action) => {
        state.activityUpdateStatus = 'succeeded';
        state.lastActivityUpdate = new Date().toISOString();
        state.currentUserStatus = action.payload;
      })
      .addCase(updateUserActivity.rejected, (state, action) => {
        state.activityUpdateStatus = 'failed';
        state.error = action.payload;
      })
      
      // Get status reducers
      .addCase(getUserActivityStatus.pending, (state) => {
        state.statusFetchStatus = 'loading';
        state.error = null;
      })
      .addCase(getUserActivityStatus.fulfilled, (state, action) => {
        state.statusFetchStatus = 'succeeded';
        state.currentUserStatus = action.payload;
      })
      .addCase(getUserActivityStatus.rejected, (state, action) => {
        state.statusFetchStatus = 'failed';
        state.error = action.payload;
      })
      
      // Get online users reducers
      .addCase(getOnlineUsers.pending, (state) => {
        state.onlineUsersFetchStatus = 'loading';
        state.error = null;
      })
      .addCase(getOnlineUsers.fulfilled, (state, action) => {
        state.onlineUsersFetchStatus = 'succeeded';
        state.onlineUsers = action.payload;
      })
      .addCase(getOnlineUsers.rejected, (state, action) => {
        state.onlineUsersFetchStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { 
  setAutoUpdateActive, 
  resetStatus, 
  setCurrentUserStatus 
} = UserActivitySlice.actions;

export default UserActivitySlice.reducer; 