import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const ChitietPlan = createAsyncThunk(
    'present/fetchDetail',
    async (planid, { rejectWithValue }) => {
      try {
        const response = await fetch(`https://apidatn.onrender.com/plan/${planid}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Lấy chi tiết thất bại: ${response.status} - ${text}`);
        }
  
        const data = await response.json();
        console.log('Dữ liệu trả về từ API:', data);
        if (!data.status) {
          throw new Error(data.message || 'Lấy chi tiết thất bại');
        }
  
        return data.data;
      } catch (error) {
        console.error('Lỗi fetch ChitietCatering:', error.message);
        return rejectWithValue(error.message);
      }
    }
  );
  
  const ChitietPlanSlice = createSlice({
    name: 'chitietplan',
    initialState: {
        ChitietPlanData: null,
        ChitietPlanStatus: 'idle',
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
        })
        .addCase(ChitietPlan.fulfilled, (state, action) => {
          state.ChitietPlanStatus = 'succeeded';
          state.ChitietPlanData = action.payload;
        })
        .addCase(ChitietPlan.rejected, (state, action) => {
          state.ChitietPlanStatus = 'failed';
          state.error = action.payload;
        });
    },
  });
  

export const { resetChitietPlan } = ChitietPlanSlice.actions;

export default ChitietPlanSlice.reducer; 