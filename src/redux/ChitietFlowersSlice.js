import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


export const ChitietFlowers = createAsyncThunk('chitietFlowers/fetch', async (productId, { rejectWithValue }) => {
  try {
    // Gọi API với URL đã thay thế :id bằng productId

    const response = await fetch(`https://apidatn.onrender.com/flower/getbyid/${productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache', // Tắt cache
      },
    });

    // // Kiểm tra phản hồi API
    // if (!response.ok) {
    //   throw new Error(`Server error: ${response.status}`);
    // }

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


const ChitietFlowersSlice = createSlice({
  name: "chitietFlowers",
  initialState: {
    ChitietFlowersData: null,
    ChitietFlowersStatus: "idle",
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(ChitietFlowers.pending, (state) => {
        state.ChitietFlowersStatus = "loading";
      })
      .addCase(ChitietFlowers.fulfilled, (state, action) => {
        state.ChitietFlowersStatus = "succeeded";
        state.ChitietFlowersData = action.payload;
      })
      .addCase(ChitietFlowers.rejected, (state, action) => {
        state.ChitietFlowersStatus = "failed";
        state.error = action.error.message;
      });
  }
});



export default ChitietFlowersSlice.reducer;