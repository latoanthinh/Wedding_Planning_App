import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const Cate_decorates = createAsyncThunk('Cate_decorates/list', async () => {
    const response = await fetch('https://apidatn.onrender.com/cate_decorate/all', {
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
  export const Cate_decoratesSlice = createSlice({
    name: 'list',
    initialState: {
        Cate_decoratesData: [],
        Cate_decoratesStatus: 'idle',
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(Cate_decorates.pending, (state, action) => {
          state.Cate_decoratesStatus = 'loading';
        })
        .addCase(Cate_decorates.fulfilled, (state, action) => {
          state.Cate_decoratesStatus = 'succeeded';
          state.Cate_decoratesData = action.payload;
        })
        .addCase(Cate_decorates.rejected, (state, action) => {
          state.Cate_decoratesStatus = 'failed';
          console.log(action.error.message);
        });
    },
  });
  
  export default Cate_decoratesSlice.reducer;