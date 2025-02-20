import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


// Hàm async gọi API
export const Clothes = createAsyncThunk('clothes/all', async () => {
    const response = await fetch('https://apidatn.onrender.com/clothes/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return data.data; // Dữ liệu trả về từ API
  });
  
  // Slice quản lý trạng thái
  export const ClothesSlice = createSlice({
    name: 'clothes',
    initialState: {
        ClothesData: {}, // Dữ liệu hall
        ClothesStatus: 'idle', // Trạng thái API
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(Clothes.pending, (state) => {
          state.ClothesStatus = 'loading';
        })
        .addCase(Clothes.fulfilled, (state, action) => {
          state.ClothesStatus = 'succeeded';
          state.ClothesData = action.payload;
        })
        .addCase(Clothes.rejected, (state) => {
          state.ClothesStatus = 'failed';
        });
    },
  });
  
  export default ClothesSlice.reducer;