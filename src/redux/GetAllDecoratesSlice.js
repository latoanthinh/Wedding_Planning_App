import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


export const fetchDecorates = createAsyncThunk('decorate/fetchdecorates', async () => {
    const response = await fetch('https://apidatn.onrender.com/decorate/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data.data; // Dữ liệu trả về từ API
  });

const GetAllDecoratesSlice = createSlice({
  name: 'getalldecorate',
  initialState: {
    decorates: [],
    decorateStatus: 'idle', // idle, loading, succeeded, failed
    error: null,
  },
  reducers: {
    resetDecorates: (state) => {
      state.decorates = [];
      state.decorateStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDecorates.pending, (state) => {
        state.decorateStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchDecorates.fulfilled, (state, action) => {
        state.decorateStatus = 'succeeded';
        state.decorates = action.payload;
      })
      .addCase(fetchDecorates.rejected, (state, action) => {
        state.decorateStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetDecorates } = GetAllDecoratesSlice.actions;
export default GetAllDecoratesSlice.reducer;