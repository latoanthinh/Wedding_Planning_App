import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to update user profile
export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      console.log('Starting update process for user ID:', id);
      console.log('Sending update request with data:', JSON.stringify(userData));
      
      // Check if id is valid
      if (!id) {
        console.error('Invalid user ID:', id);
        return rejectWithValue('ID người dùng không hợp lệ');
      }
      
      // Kiểm tra kết nối API trước
      try {
        const pingResponse = await fetch('https://apidatn.onrender.com/ping', { 
          method: 'GET',
          timeout: 5000 
        });
        console.log('API ping status:', pingResponse.status);
      } catch (pingError) {
        console.warn('API ping failed, may be offline:', pingError);
      }
      
      const response = await fetch(`https://apidatn.onrender.com/users/update/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData),
      }).catch(error => {
        console.error('Network error during fetch:', error);
        throw new Error('Lỗi kết nối mạng: ' + error.message);
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', JSON.stringify([...response.headers.entries()]));
      
      // Kiểm tra Content-Type của response
      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Server returned non-JSON response. Content-Type:', contentType);
        
        // Lấy text response để debug
        const textResponse = await response.text();
        console.log('Non-JSON response (first 200 chars):', textResponse.substring(0, 200));
        
        return rejectWithValue('Server trả về định dạng không hợp lệ. Vui lòng thử lại sau.');
      }
      
      const result = await response.json().catch(error => {
        console.error('Error parsing JSON response:', error);
        throw new Error('Lỗi khi xử lý phản hồi từ máy chủ');
      });
      
      console.log('Server response:', JSON.stringify(result));

      if (!response.ok) {
        console.error('Update failed with status:', response.status);
        console.error('Error message:', result.message || 'Không có thông báo lỗi');
        return rejectWithValue(result.message || 'Cập nhật thất bại');
      }

      return result;
    } catch (error) {
      console.error('Unhandled error during update:', error);
      console.error('Error stack:', error.stack);
      return rejectWithValue(error.message || 'Có lỗi xảy ra');
    }
  }
);

// Thêm thunk để kiểm tra API
export const checkApiStatus = createAsyncThunk(
  'users/checkApi',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('https://apidatn.onrender.com/users', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      console.log('API check status:', response.status);
      
      if (!response.ok) {
        return rejectWithValue('API không khả dụng');
      }
      
      return { status: 'online' };
    } catch (error) {
      console.error('API check failed:', error);
      return rejectWithValue('Không thể kết nối đến API');
    }
  }
);

// Create UserSlice to manage user state
export const UserSlice = createSlice({
  name: 'user',
  initialState: {
    userData: null,
    updateStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    updateError: null,
    serverResponse: null, // Store the full server response
    apiStatus: 'unknown', // 'unknown' | 'online' | 'offline'
  },
  reducers: {
    // Reset update status (useful after showing success/error messages)
    resetUpdateStatus: (state) => {
      state.updateStatus = 'idle';
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateUser.pending, (state) => {
        console.log('Update request pending...');
        state.updateStatus = 'loading';
        state.updateError = null;
        state.serverResponse = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        console.log('Update successful:', JSON.stringify(action.payload));
        state.updateStatus = 'succeeded';
        state.userData = action.payload.user;
        state.serverResponse = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        console.log('Update rejected. Payload:', action.payload);
        console.log('Error:', action.error);
        state.updateStatus = 'failed';
        state.updateError = action.payload || 'Cập nhật thất bại';
      })
      .addCase(checkApiStatus.fulfilled, (state) => {
        state.apiStatus = 'online';
      })
      .addCase(checkApiStatus.rejected, (state) => {
        state.apiStatus = 'offline';
      });
  },
});

export const { resetUpdateStatus } = UserSlice.actions;
export default UserSlice.reducer;