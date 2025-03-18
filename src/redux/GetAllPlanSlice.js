import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Hàm async gọi API với userId
export const Plan = createAsyncThunk('plan/all', async (userId, { rejectWithValue }) => {
  try {
    // Kiểm tra userId trước khi gọi API
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('UserId không hợp lệ');
    }

    const response = await fetch(`https://apidatn.onrender.com/plan/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch plans: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.data) {
      throw new Error('No data returned from API');
    }

    return data.data; // Dữ liệu trả về từ API
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Slice quản lý trạng thái
export const GetAllPlanSlice = createSlice({
  name: 'plan',
  initialState: {
    AllPlanData: [], // Khởi tạo là mảng rỗng
    AllPlanStatus: 'idle', // Trạng thái API
    error: null, // Thêm trường error để lưu thông báo lỗi
  },
  reducers: {
    resetAllPlan: (state) => {
      state.AllPlanData = [];
      state.AllPlanStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(Plan.pending, (state) => {
        state.AllPlanStatus = 'loading';
        state.error = null; // Reset lỗi khi bắt đầu gọi API
      })
      .addCase(Plan.fulfilled, (state, action) => {
        state.AllPlanStatus = 'succeeded';
        state.AllPlanData = Array.isArray(action.payload) ? action.payload : []; // Đảm bảo là mảng
      })
      .addCase(Plan.rejected, (state, action) => {
        state.AllPlanStatus = 'failed';
        state.AllPlanData = []; // Reset dữ liệu khi thất bại
        state.error = action.payload; // Lưu thông báo lỗi
      });
  },
});

export const { resetAllPlan } = GetAllPlanSlice.actions;
export default GetAllPlanSlice.reducer;