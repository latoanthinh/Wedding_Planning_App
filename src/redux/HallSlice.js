import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Hàm async gọi API
export const Hall = createAsyncThunk('lobby/all', async () => {
  const response = await fetch('https://apidatn.onrender.com/lobby/all', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  return data.data; // Dữ liệu trả về từ API
});

// Slice quản lý trạng thái
export const HallSlice = createSlice({
  name: 'hall',
  initialState: {
    HallData: {}, // Dữ liệu hall
    HallStatus: 'idle', // Trạng thái API
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(Hall.pending, (state) => {
        state.HallStatus = 'loading';
      })
      .addCase(Hall.fulfilled, (state, action) => {
        state.HallStatus = 'succeeded';
        state.HallData = action.payload;
      })
      .addCase(Hall.rejected, (state) => {
        state.HallStatus = 'failed';
      });
  },
});

export default HallSlice.reducer;
