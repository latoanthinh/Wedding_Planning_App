import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchPresents = createAsyncThunk('present/fetchpresents', async () => {
  const response = await fetch('https://apidatn.onrender.com/present/all', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  return data.data; // Dữ liệu trả về từ API
});

const GetAllPresentSlice = createSlice({
name: 'getallpresent',
initialState: {
    presents: [],
    presentStatus: 'idle', // idle, loading, succeeded, failed
  error: null,
},
reducers: {
    resetPresent: (state) => {
    state.presents = [];
    state.presentStatus = 'idle';
    state.error = null;
  },
},
extraReducers: (builder) => {
  builder
    .addCase(fetchPresents.pending, (state) => {
      state.presentStatus = 'loading';
      state.error = null;
    })
    .addCase(fetchPresents.fulfilled, (state, action) => {
      state.presentStatus = 'succeeded';
      state.presents = action.payload;
    })
    .addCase(fetchPresents.rejected, (state, action) => {
      state.presentStatus = 'failed';
      state.error = action.payload;
    });
},
});

export const { resetPresent } = GetAllPresentSlice.actions;
export default GetAllPresentSlice.reducer;
