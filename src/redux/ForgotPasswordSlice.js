import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';



// Async thunk gửi OTP: Gọi API POST /auth/forgot-password với body { email }
export const requestOTP = createAsyncThunk(
  'forgotPassword/requestOTP',
  async (email, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://apidatn.onrender.com/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
      const data = await response.json();
      return data; // Ví dụ: { message: "OTP đã được gửi đến email của bạn" }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk xác thực OTP: Gọi API POST /auth/verify-otp với body { email, otp }
export const verifyOTP = createAsyncThunk(
  'forgotPassword/verifyOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://apidatn.onrender.com/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
      const data = await response.json();
      return data; // Ví dụ: { message: "OTP hợp lệ, bạn có thể đặt lại mật khẩu" }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk đặt lại mật khẩu: Gọi API POST /auth/reset-password với body { email, newPassword }
export const resetPassword = createAsyncThunk(
  'forgotPassword/resetPassword',
  async ({ email, newPassword }, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://apidatn.onrender.com/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }
      const data = await response.json();
      return data; // Ví dụ: { message: "Mật khẩu đã được đặt lại thành công" }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const forgotPasswordSlice = createSlice({
  name: 'forgotPassword',
  initialState: {
    status: 'idle',    // idle | loading | succeeded | failed
    message: null,     // Thông báo từ API
    error: null,       // Thông báo lỗi
    step: 1,           // Bước quy trình: 1 - nhập email, 2 - nhập OTP, 3 - đặt lại mật khẩu, 4 - thành công
  },
  reducers: {
    setStep: (state, action) => {
      state.step = action.payload;
    },
    // Reset toàn bộ state của forgotPassword nếu cần
    resetForgotPassword: (state) => {
      state.status = 'idle';
      state.message = null;
      state.error = null;
      state.step = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý gửi OTP
      .addCase(requestOTP.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(requestOTP.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.message = action.payload.message;
        state.step = 2; // Sau gửi OTP thành công, chuyển bước sang nhập OTP
      })
      .addCase(requestOTP.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Xử lý xác thực OTP
      .addCase(verifyOTP.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.message = action.payload.message;
        state.step = 3; // Sau xác thực OTP thành công, chuyển bước sang đặt lại mật khẩu
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Xử lý đặt lại mật khẩu
      .addCase(resetPassword.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.message = action.payload.message;
        state.step = 4; // Sau đặt lại mật khẩu thành công
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setStep, resetForgotPassword } = forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer;
