import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';

const BASE_URL = 'https://apidatn.onrender.com';

const handleApiResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return { message: response.ok ? 'Thao tác thành công' : 'Có lỗi xảy ra' };
  }

  try {
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi parse JSON:', error);
    return { message: response.ok ? 'Thao tác thành công' : 'Có lỗi xảy ra' };
  }
};

// Helper function to make API request with retry
const makeApiRequest = async (url, options, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); 

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.status === 503) {
        console.log(`Lần thử ${i + 1}/${maxRetries} gặp lỗi 503, đang thử lại...`);
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1))); 
          continue;
        }
      }

      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Yêu cầu đã hết thời gian chờ');
      }
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
    }
  }
};

// Register user to trigger OTP sending
export const DangKyTaiKhoan = createAsyncThunk(
  'register/registerUser', 
  async (userData, { rejectWithValue }) => {
    try {
      const { name, email, password } = userData;
      console.log('Đăng ký với dữ liệu:', { name, email, password: '***' });
      
      const response = await makeApiRequest(
        `${BASE_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            name, 
            email, 
            password,
            phone: userData.phone || '',
            address: userData.address || '',
            role: userData.role || 'user',
            avatar: userData.avatar || ''
          }),
        }
      );
      
      console.log('Trạng thái phản hồi đăng ký:', response.status);
      
      if (!response.ok) {
        const errorData = await handleApiResponse(response);
        return rejectWithValue(errorData.message || 'Đăng ký thất bại');
      }
      
      return await handleApiResponse(response);
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      return rejectWithValue(error.message || 'Đăng ký thất bại');
    }
  }
);

// Request register OTP (resend)
export const requestRegisterOTP = createAsyncThunk(
  'register/requestOTP',
  async (email, { rejectWithValue }) => {
    try {
      console.log('Yêu cầu gửi lại OTP cho email:', email);
      
      const response = await makeApiRequest(
        `${BASE_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email, 
            name: 'Temporary Name',
            password: 'TemporaryPassword123',
          }),
        }
      );
      
      console.log('Trạng thái phản hồi OTP:', response.status);
      
      if (!response.ok) {
        const errorData = await handleApiResponse(response);
        return rejectWithValue(errorData.message || 'Lỗi khi gửi OTP');
      }
      
      return await handleApiResponse(response);
    } catch (error) {
      console.error('Lỗi gửi OTP:', error);
      return rejectWithValue(error.message || 'Lỗi khi gửi OTP');
    }
  }
);

// Verify OTP for registration
export const verifyRegisterOTP = createAsyncThunk(
  'register/verifyOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      console.log('Xác thực OTP cho email:', email, 'với mã:', otp);
      
      const response = await makeApiRequest(
        `${BASE_URL}/auth/verify-registration-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, otp }),
        }
      );
      
      console.log('Trạng thái phản hồi xác thực OTP:', response.status);
      
      if (!response.ok) {
        const errorData = await handleApiResponse(response);
        return rejectWithValue(errorData.message || 'Lỗi khi xác thực OTP');
      }
      
      return await handleApiResponse(response);
    } catch (error) {
      console.error('Lỗi xác thực OTP:', error);
      return rejectWithValue(error.message || 'Lỗi khi xác thực OTP');
    }
  }
);

// Create RegisterSlice to manage state
export const RegisterSlice = createSlice({
  name: 'register',
  initialState: {
    registerData: {},
    registerStatus: 'idle',
    otpRequestStatus: 'idle',
    otpVerifyStatus: 'idle',
    otpData: null,
    error: null,
  },
  reducers: {
    resetOtpStatus: (state) => {
      state.otpRequestStatus = 'idle';
      state.otpVerifyStatus = 'idle';
      state.otpData = null;
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder
      // DangKyTaiKhoan reducers
      .addCase(DangKyTaiKhoan.pending, (state) => {
        state.registerStatus = 'loading';
        state.error = null;
      })
      .addCase(DangKyTaiKhoan.fulfilled, (state, action) => {
        state.registerStatus = 'succeeded';
        state.registerData = action.payload;
      })
      .addCase(DangKyTaiKhoan.rejected, (state, action) => {
        state.registerStatus = 'failed';
        state.error = action.payload || action.error.message;
      })
      
      // requestRegisterOTP reducers
      .addCase(requestRegisterOTP.pending, (state) => {
        state.otpRequestStatus = 'loading';
        state.error = null;
      })
      .addCase(requestRegisterOTP.fulfilled, (state, action) => {
        state.otpRequestStatus = 'succeeded';
        state.otpData = action.payload;
      })
      .addCase(requestRegisterOTP.rejected, (state, action) => {
        state.otpRequestStatus = 'failed';
        state.error = action.payload || action.error.message;
      })
      
      // verifyRegisterOTP reducers
      .addCase(verifyRegisterOTP.pending, (state) => {
        state.otpVerifyStatus = 'loading';
        state.error = null;
      })
      .addCase(verifyRegisterOTP.fulfilled, (state, action) => {
        state.otpVerifyStatus = 'succeeded';
        state.otpData = action.payload;
      })
      .addCase(verifyRegisterOTP.rejected, (state, action) => {
        state.otpVerifyStatus = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const { resetOtpStatus } = RegisterSlice.actions;
export default RegisterSlice.reducer;