import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const Cate_present = createAsyncThunk('cate_present/list', async () => {
    const response = await fetch('https://apidatn.onrender.com/cate_present/all', {
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
  export const Cate_presentSlice = createSlice({
    name: 'list',
    initialState: {
      Cate_presentData: [],
      Cate_presentStatus: 'idle',
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(Cate_present.pending, (state, action) => {
          state.Cate_presentStatus = 'loading';
        })
        .addCase(Cate_present.fulfilled, (state, action) => {
          state.Cate_presentStatus = 'succeeded';
          state.Cate_presentData = action.payload;
        })
        .addCase(Cate_present.rejected, (state, action) => {
          state.Cate_presentStatus = 'failed';
          console.log(action.error.message);
        });
    },
  });
  
  export default Cate_presentSlice.reducer;