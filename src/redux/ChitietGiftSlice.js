import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const ChitietGift = createAsyncThunk(
    'present/fetchDetail',
    async (presentid, { rejectWithValue }) => {
      try {
        const response = await fetch(`https://apidatn.onrender.com/present/${presentid}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Lấy chi tiết thất bại: ${response.status} - ${text}`);
        }
  
        const data = await response.json();
        console.log('Dữ liệu trả về từ API:', data);
        if (!data.status) {
          throw new Error(data.message || 'Lấy chi tiết thất bại');
        }
  
        return data.data;
      } catch (error) {
        console.error('Lỗi fetch ChitietCatering:', error.message);
        return rejectWithValue(error.message);
      }
    }
  );
  
  const ChitietGiftSlice = createSlice({
    name: 'chitietcatering',
    initialState: {
        ChitietGiftData: null,
        ChitietGiftStatus: 'idle',
      error: null,
    },
    reducers: {
        resetChitietGift: (state) => {
        state.ChitietGiftData = null;
        state.ChitietGiftStatus = 'idle';
        state.error = null;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(ChitietGift.pending, (state) => {
          state.ChitietGiftStatus = 'loading';
          state.error = null;
        })
        .addCase(ChitietGift.fulfilled, (state, action) => {
          state.ChitietGiftStatus = 'succeeded';
          state.ChitietGiftData = action.payload;
        })
        .addCase(ChitietGift.rejected, (state, action) => {
          state.ChitietGiftStatus = 'failed';
          state.error = action.payload;
        });
    },
  });
  

export const { resetChitietGift } = ChitietGiftSlice.actions;
export default ChitietGiftSlice.reducer;