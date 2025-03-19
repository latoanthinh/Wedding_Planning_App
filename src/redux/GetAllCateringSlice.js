import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


export const fetchCaterings = createAsyncThunk('catering/fetchCaterings', async () => {
    const response = await fetch('https://apidatn.onrender.com/catering/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data.data; // Dữ liệu trả về từ API
  });

const GetAllCateringSlice = createSlice({
  name: 'getallcatering',
  initialState: {
    caterings: [],
    cateringStatus: 'idle', // idle, loading, succeeded, failed
    error: null,
  },
  reducers: {
    resetCaterings: (state) => {
      state.caterings = [];
      state.cateringStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCaterings.pending, (state) => {
        state.cateringStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchCaterings.fulfilled, (state, action) => {
        state.cateringStatus = 'succeeded';
        state.caterings = action.payload;
      })
      .addCase(fetchCaterings.rejected, (state, action) => {
        state.cateringStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetCaterings } = GetAllCateringSlice.actions;
export default GetAllCateringSlice.reducer;