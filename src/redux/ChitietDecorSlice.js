import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const ChitietDecor = createAsyncThunk(
  'decorate/fetchDetail',
  async (decorId, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://apidatn.onrender.com/decorate/${decorId}`, {
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
      console.error('Lỗi fetch ChitietDecor:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

const ChitietDecorSlice = createSlice({
  name: 'chitietdecor',
  initialState: {
    ChitietDecorData: null,
    ChitietDecorStatus: 'idle',
    error: null,
  },
  reducers: {
    resetChitietDecor: (state) => {
      state.ChitietDecorData = null;
      state.ChitietDecorStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(ChitietDecor.pending, (state) => {
        state.ChitietDecorStatus = 'loading';
        state.error = null;
      })
      .addCase(ChitietDecor.fulfilled, (state, action) => {
        state.ChitietDecorStatus = 'succeeded';
        state.ChitietDecorData = action.payload;
      })
      .addCase(ChitietDecor.rejected, (state, action) => {
        state.ChitietDecorStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetChitietDecor } = ChitietDecorSlice.actions;
export default ChitietDecorSlice.reducer; 