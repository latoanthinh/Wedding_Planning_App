import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Hàm async gọi API
export const Plan = createAsyncThunk('plan/all', async () => {
  try {
    const response = await fetch('https://apidatn.onrender.com/plan/all', {
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
export const GetAllPlanSlice = createSlice({
  name: 'plan',
  initialState: {
    AllPlanData: [], // Khởi tạo là mảng rỗng thay vì object
    AllPlanStatus: 'idle', // Trạng thái API
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(Plan.pending, (state) => {
        state.AllPlanStatus = 'loading';
      })
      .addCase(Plan.fulfilled, (state, action) => {
        state.AllPlanStatus = 'succeeded';
        state.AllPlanData = Array.isArray(action.payload) ? action.payload : []; // Đảm bảo là mảng
      })
      .addCase(Plan.rejected, (state) => {
        state.AllPlanStatus = 'failed';
        state.AllPlanData = []; // Reset dữ liệu khi thất bại
      });
  },
});

export default GetAllPlanSlice.reducer;