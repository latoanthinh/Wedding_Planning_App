import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const Hall = createAsyncThunk('catering/fetchCaterings', async () => {
  const response = await fetch('https://apidatn.onrender.com/lobby/all', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  return data.data; // Dữ liệu trả về từ API
});

const HallSlice = createSlice({
name: 'getallcatering',
initialState: {
  HallData: [],
  HallStatus: 'idle', // idle, loading, succeeded, failed
  error: null,
},
reducers: {
  resetHall: (state) => {
    state.HallData = [];
    state.HallStatus = 'idle';
    state.error = null;
  },
},
extraReducers: (builder) => {
  builder
    .addCase(Hall.pending, (state) => {
      state.HallStatus = 'loading';
      state.error = null;
    })
    .addCase(Hall.fulfilled, (state, action) => {
      state.HallStatus = 'succeeded';
      state.HallData = action.payload;
    })
    .addCase(Hall.rejected, (state, action) => {
      state.cateringStatus = 'failed';
      state.error = action.payload;
    });
},
});

export const { resetHall } = HallSlice.actions;
export default HallSlice.reducer;
