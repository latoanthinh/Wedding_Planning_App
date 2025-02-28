import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


// Hàm async gọi API
export const Invitations = createAsyncThunk('plan/all', async () => {
    try {
      const response = await fetch('https://apidatn.onrender.com/invitation/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }
      const data = await response.json();
      if (!data.data) {
        throw new Error('No data returned from API');
      }
      return data.data; // Dữ liệu trả về từ API
    } catch (error) {
      throw error;
    }
  });
  
  // Slice quản lý trạng thái
  export const InvitationsSlice = createSlice({
    name: 'plan',
    initialState: {
        InvitationsData: [], // Khởi tạo là mảng rỗng thay vì object
        InvitationsStatus: 'idle', // Trạng thái API
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(Invitations.pending, (state) => {
          state.AllPlanStatus = 'loading';
        })
        .addCase(Invitations.fulfilled, (state, action) => {
          state.InvitationsStatus = 'succeeded';
          state.InvitationsData = Array.isArray(action.payload) ? action.payload : []; // Đảm bảo là mảng
        })
        .addCase(Invitations.rejected, (state) => {
          state.InvitationsStatus = 'failed';
          state.AllPlanData = []; // Reset dữ liệu khi thất bại
        });
    },
  });
  
  export default InvitationsSlice.reducer;