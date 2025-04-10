import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


// Hàm async gọi API
export const FlowersAPI = createAsyncThunk(
  'sanpham/getByCategory',
  async (cateringId, { rejectWithValue }) => {  // Thêm tham số rejectWithValue
    try {
      const response = await fetch(`https://apidatn.onrender.com/catering/caterings/${cateringId}`,{
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
  
  // Slice quản lý trạng thái
  export const FlowersSlice = createSlice({
    name: 'flowers',
    initialState: {
        FlowersData: [], // Dữ liệu hall
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