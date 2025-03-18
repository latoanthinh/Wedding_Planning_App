import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';

export const requestOTP = createAsyncThunk(
  'forgotPassword/requestOTP',
  async (email, {rejectWithValue}) => {
    try {
      const response = await fetch(
        `https://apidatn.onrender.com/auth/forgot-password`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email}),
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Server error: ${response.status}`,
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Async thunk xác thực OTP: Gọi API POST /auth/verify-otp với body { email, otp }
export const verifyOTP = createAsyncThunk(
  'forgotPassword/verifyOTP',
  async ({email, otp}, {rejectWithValue}) => {
    try {
      const response = await fetch(
        `https://apidatn.onrender.com/auth/verify-otp`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email, otp}),
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Server error: ${response.status}`,
        );
      }
      const data = await response.json();
      return data; 
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Async thunk đặt lại mật khẩu: Gọi API POST /auth/reset-password với body { email, newPassword }
export const resetPassword = createAsyncThunk(
  'forgotPassword/resetPassword',
  async ({email, newPassword}, {rejectWithValue}) => {
    try {
      const response = await fetch(
        `https://apidatn.onrender.com/auth/reset-password`,
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email, newPassword}),
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Server error: ${response.status}`,
        );
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const forgotPasswordSlice = createSlice({
  name: 'forgotPassword',
  initialState: {
    status: 'idle',
    message: null, 
    error: null,
    step: 1,
  },
  reducers: {
    setStep: (state, action) => {
      state.step = action.payload;
    },
    // Reset toàn bộ state của forgotPassword nếu cần
    resetForgotPassword: state => {
      state.status = 'idle';
      state.message = null;
      state.error = null;
      state.step = 1;
    },
  },
  extraReducers: builder => {
    builder
      // Xử lý gửi OTP
      .addCase(requestOTP.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(requestOTP.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.message = action.payload.message;
        state.step = 2;     
      })
      .addCase(requestOTP.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Xử lý xác thực OTP
      .addCase(verifyOTP.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.message = action.payload.message;
        state.step = 3;     
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Xử lý đặt lại mật khẩu
      .addCase(resetPassword.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.message = action.payload.message;
        state.step = 4;     
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const {setStep, resetForgotPassword} = forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer;
