import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const ChitietCatering = createAsyncThunk(
  'chitietcatering/fetchDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://apidatn.onrender.com/catering/${id}`, {
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

      return data.data[0];
    } catch (error) {
      console.error('Lỗi fetch ChitietCatering:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

const chitietCateringSlice = createSlice({
  name: 'chitietcatering',
  initialState: {
    ChitietCateringData: null,
    ChitietCateringStatus: 'idle',
    error: null,
  },
  reducers: {
    resetChitietCatering: (state) => {
      state.ChitietCateringData = null;
      state.ChitietCateringStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(ChitietCatering.pending, (state) => {
        state.ChitietCateringStatus = 'loading';
        state.error = null;
      })
      .addCase(ChitietCatering.fulfilled, (state, action) => {
        state.ChitietCateringStatus = 'succeeded';
        state.ChitietCateringData = action.payload;
      })
      .addCase(ChitietCatering.rejected, (state, action) => {
        state.ChitietCateringStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetChitietCatering } = chitietCateringSlice.actions;
export default chitietCateringSlice.reducer;