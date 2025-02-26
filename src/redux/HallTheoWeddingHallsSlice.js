import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const HallTheoWedding = createAsyncThunk(
  'chitietFlowers/fetch',
  async (productId, { rejectWithValue }) => {
    try {
      // Gọi API lấy danh sách sảnh theo productId
      const response = await fetch(`https://apidatn.onrender.com/lobby/by-hall/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache', // Tắt cache
        },
      });

      const data = await response.json();

      // Kiểm tra dữ liệu trả về
      if (!data || !data.status || !data.data) {
        throw new Error('No data or incorrect data format');
      }

      return data.data; // Trả về toàn bộ danh sách halls, không chỉ 1 phần tử
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const HallTheoWeddingHallsSlice = createSlice({
  name: 'halltheowedding',
  initialState: {
    HallTheoWeddingFlowersData: [],
    HallTheoWeddingFlowersStatus: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(HallTheoWedding.pending, (state) => {
        state.HallTheoWeddingFlowersStatus = 'loading';
      })
      .addCase(HallTheoWedding.fulfilled, (state, action) => {
        state.HallTheoWeddingFlowersStatus = 'succeeded';
        state.HallTheoWeddingFlowersData = action.payload; // Lưu toàn bộ danh sách halls
      })
      .addCase(HallTheoWedding.rejected, (state, action) => {
        state.HallTheoWeddingFlowersStatus = 'failed';
        state.error = action.payload; // Trả về lỗi chi tiết hơn
      });
  },
});

export default HallTheoWeddingHallsSlice.reducer;
