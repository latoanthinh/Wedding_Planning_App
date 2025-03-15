import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Thunk để lấy chi tiết kế hoạch
export const ChitietPlan = createAsyncThunk(
  'plan/fetchDetail',
  async (planid, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://apidatn.onrender.com/plan/${planid}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Lấy chi tiết thất bại: ${response.status} - ${text}`);
      }
      const data = await response.json();
      console.log('API Response:', data);
      return data.data; // Trả về data.data
    } catch (error) {
      console.error('Lỗi fetch ChitietPlan:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Slice xử lý trạng thái
const ChitietPlanSlice = createSlice({
  name: 'chitietplan',
  initialState: {
    ChitietPlanData: null,
    ChitietPlanStatus: 'idle', // idle, loading, succeeded, failed
    error: null,
  },
  reducers: {
    resetChitietPlan: (state) => {
      state.ChitietPlanData = null;
      state.ChitietPlanStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(ChitietPlan.pending, (state) => {
        state.ChitietPlanStatus = 'loading';
        state.error = null;
        state.ChitietPlanData = null; // Reset data khi bắt đầu tải
      })
      .addCase(ChitietPlan.fulfilled, (state, action) => {
        state.ChitietPlanStatus = 'succeeded';
        state.ChitietPlanData = action.payload;
        state.error = null;
      })
      .addCase(ChitietPlan.rejected, (state, action) => {
        state.ChitietPlanStatus = 'failed';
        state.error = action.payload;
        state.ChitietPlanData = null; // Reset data khi thất bại
      });
  },
});

export const { resetChitietPlan } = ChitietPlanSlice.actions;

export default ChitietPlanSlice.reducer;