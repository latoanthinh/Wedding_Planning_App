import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const getProductsByDecorates = createAsyncThunk(
  'sanpham/getByCategory',
  async (cateId, { rejectWithValue }) => {  // Thêm tham số rejectWithValue
    try {
      const response = await fetch(`https://apidatn.onrender.com/decorate/decorates/${cateId}`,{
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
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

      // Trả về mảng sản phẩm nếu có, nếu không thì trả về một mảng trống
      return data.data || [];  // Giả sử dữ liệu trả về có trường `data` chứa mảng sản phẩm
    } catch (error) {
      // Trả về lỗi chi tiết nếu có
      return rejectWithValue(error.message);
    }
  }
);

const DecoratesByCate = createSlice({
  name: 'sanpham',
  initialState: {
    products: [],
    status: 'idle',
    error: null,  // Thêm error vào state để theo dõi thông báo lỗi
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProductsByDecorates.pending, (state) => {
        state.status = 'loading';
        state.error = null;  // Reset lỗi khi bắt đầu request mới
      })
      .addCase(getProductsByDecorates.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Kiểm tra và cập nhật sản phẩm vào state
        console.log('Dữ liệu sản phẩm:', action.payload);
        state.products = action.payload || []; // Cập nhật dữ liệu vào state
      })
      .addCase(getProductsByDecorates.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // Lưu thông báo lỗi vào state
      });
  },
});

export default DecoratesByCate.reducer;