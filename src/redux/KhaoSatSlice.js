import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Thunk để gọi API /khaosat
export const fetchKhaoSatPlans = createAsyncThunk(
  'khaosat/fetchPlans',
  async ({ planprice, plansoluongkhach }, { rejectWithValue }) => {
    try {
      const response = await fetch('https://apidatn.onrender.com/plan/khaosat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planprice,
          plansoluongkhach,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Lấy danh sách kế hoạch thất bại: ${response.status} - ${text}`);
      }

      const data = await response.json();
      if (!data.status) {
        throw new Error(data.message || 'Lấy danh sách kế hoạch thất bại');
      }

      return data.data; // Trả về mảng plans
    } catch (error) {
      console.error('Lỗi fetch KhaoSatPlans:', error.message);
      return rejectWithValue(error.message);
    }
  }
);


const KhaoSatSlice = createSlice({
    name: 'khaosat',
    initialState: {
      plans: [], // Danh sách kế hoạch
      status: 'idle', // Trạng thái: idle, loading, succeeded, failed
      error: null, // Lưu lỗi nếu có
    },
    reducers: {
      resetKhaoSat: (state) => {
        state.plans = [];
        state.status = 'idle';
        state.error = null;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchKhaoSatPlans.pending, (state) => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(fetchKhaoSatPlans.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.plans = action.payload || []; // Gán danh sách plans, mặc định là mảng rỗng nếu không có dữ liệu
        })
        .addCase(fetchKhaoSatPlans.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload;
          state.plans = []; // Reset plans khi thất bại
        });
    },
  });
  
  export const { resetKhaoSat } = KhaoSatSlice.actions;
  export default KhaoSatSlice.reducer;