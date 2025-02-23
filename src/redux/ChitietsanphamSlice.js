import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';




export const Chitiet = createAsyncThunk('chitietsanpham/fetch', async (productId, { rejectWithValue }) => {
  try {
    // Gọi API với URL đã thay thế :id bằng productId
    
    const response = await fetch(`https://apidatn.onrender.com/clothes/get/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache', // Tắt cache
      },
    });
    
    // Kiểm tra phản hồi API
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    // Kiểm tra dữ liệu trả về
    if (!data || !data.status || !data.data) {
      throw new Error('No data or incorrect data format');
    }

    return data.data[0]; // Trả về sản phẩm đầu tiên trong mảng data
  } catch (error) {
    // Trả về lỗi chi tiết nếu có
    return rejectWithValue(error.message);
  }
});

//tạo Slice quản lý trạng thái khi gọi hàm DangnhapTaiKhoan
export const ChitietsanphamSlice = createSlice({
  name: 'chitietsanpham',
  initialState: {
    ChitietData: null,
    ChitietStatus: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(Chitiet.pending, (state) => {
        state.ChitietStatus = 'loading';
      })
      .addCase(Chitiet.fulfilled, (state, action) => {
        state.ChitietStatus = 'succeeded';
        state.ChitietData = action.payload;
      })
      .addCase(Chitiet.rejected, (state, action) => {
        state.ChitietStatus = 'failed';
        state.error = action.payload; // Lưu thông tin lỗi
      });
  },
});

export default ChitietsanphamSlice.reducer;
