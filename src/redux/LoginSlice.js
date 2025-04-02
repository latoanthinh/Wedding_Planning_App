import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';


//tạo hàm DangNhapTaiKhoan để thực hiện chức năng gọi API đăng nhap 
export const DangNhapTaiKhoan = createAsyncThunk('users/login', async (data) => {
  const response = await fetch('https://apidatn.onrender.com/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  

  if (!response.ok) {
    throw new Error(result.message || 'Đăng nhập thất bại');
  }

  return result;
});

//tạo Slice quản lý trạng thái khi gọi hàm DangnhapTaiKhoan
export const LoginSlice = createSlice({
  name: 'login',
  initialState: {
    loginData: {},
    loginStatus: 'idle',
  },
  reducers: {
    reset: (state) => {
      state.loginData = null;
      state.loginStatus = 'idle';
  },
  },
  extraReducers: builder => {
    builder
      .addCase(DangNhapTaiKhoan.pending, (state, action) => {
        state.loginStatus = 'loading';
      })
      .addCase(DangNhapTaiKhoan.fulfilled, (state, action) => {
        state.loginStatus = 'succeeded';
       
        state.loginData = action.payload; // Chỉ lưu phần user
    })
      .addCase(DangNhapTaiKhoan.rejected, (state, action) => {
        state.loginStatus = 'failed';
        console.log(action.error.message);
      });
  },
});

export default LoginSlice.reducer;
export const { reset } = LoginSlice.actions;
