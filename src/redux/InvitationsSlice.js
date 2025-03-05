import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


// Hàm async gọi API
export const Invitations = createAsyncThunk(
  'sanpham/getByCategory',
  async (presentId, { rejectWithValue }) => {  // Thêm tham số rejectWithValue
    try {
      const response = await fetch(`https://apidatn.onrender.com/present/presents/${presentId}`,{
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
  export const InvitationsSlice = createSlice({
    name: 'plan',
    initialState: {
        InvitationsData: [], // Khởi tạo là mảng rỗng thay vì object
        InvitationsStatus: 'idle', // Trạng thái API
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(Invitations.pending, (state) => {
          state.AllPlanStatus = 'loading';
        })
        .addCase(Invitations.fulfilled, (state, action) => {
          state.InvitationsStatus = 'succeeded';
          state.InvitationsData = Array.isArray(action.payload) ? action.payload : []; // Đảm bảo là mảng
        })
        .addCase(Invitations.rejected, (state) => {
          state.InvitationsStatus = 'failed';
          state.AllPlanData = []; // Reset dữ liệu khi thất bại
        });
    },
  });
  
  export default InvitationsSlice.reducer;