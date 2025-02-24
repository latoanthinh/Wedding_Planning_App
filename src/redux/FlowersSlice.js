import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


// Hàm async gọi API
export const FlowersAPI = createAsyncThunk('flower/all', async () => {
    const response = await fetch('https://apidatn.onrender.com/flower/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data.data; // Dữ liệu trả về từ API
  });
  
  // Slice quản lý trạng thái
  export const FlowersSlice = createSlice({
    name: 'flowers',
    initialState: {
        FlowersData: {}, // Dữ liệu hall
        FlowersStatus: 'idle', // Trạng thái API
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(FlowersAPI.pending, (state) => {
          state.FlowersStatus = 'loading';
        })
        .addCase(FlowersAPI.fulfilled, (state, action) => {
          state.FlowersStatus = 'succeeded';
          state.FlowersData = action.payload;
        })
        .addCase(FlowersAPI.rejected, (state) => {
          state.FlowersStatus = 'failed';
        });
    },
  });



export default FlowersSlice.reducer;