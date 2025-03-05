import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const Cate_catering = createAsyncThunk('cate_catering/list', async () => {
    const response = await fetch('https://apidatn.onrender.com/cate_catering/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache', // Tắt cache
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }
    const data = await response.json();
    return data.data;
  });
  
  //tạo Slice quản lý trạng thái khi gọi hàm DangnhapTaiKhoan
  export const Cate_cateringSlice = createSlice({
    name: 'list',
    initialState: {
        Cate_cateringData: [],
        Cate_cateringStatus: 'idle',
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(Cate_catering.pending, (state, action) => {
          state.Cate_cateringStatus = 'loading';
        })
        .addCase(Cate_catering.fulfilled, (state, action) => {
          state.Cate_cateringStatus = 'succeeded';
          state.Cate_cateringData = action.payload;
        })
        .addCase(Cate_catering.rejected, (state, action) => {
          state.Cate_cateringStatus = 'failed';
          console.log(action.error.message);
        });
    },
  });
  
  export default Cate_cateringSlice.reducer;