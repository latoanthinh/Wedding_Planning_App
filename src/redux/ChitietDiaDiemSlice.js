import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const ChitietDiaDiem = createAsyncThunk(
    'present/fetchDetail',
    async (diadiemid, { rejectWithValue }) => {
      try {
        const response = await fetch(`https://apidatn.onrender.com/decorate/${diadiemid}`, {
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
        console.error('Lỗi fetch chitietdiadiem:', error.message);
        return rejectWithValue(error.message);
      }
    }
  );
  
  const ChitietDiaDiemSlice = createSlice({
    name: 'chitietdiadiem',
    initialState: {
        ChitietDiaDiemData: null,
        ChitietDiaDiemStatus: 'idle',
      error: null,
    },
    reducers: {
        resetChitietDiaDiem: (state) => {
        state.ChitietDiaDiemData = null;
        state.ChitietDiaDiemStatus = 'idle';
        state.error = null;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(ChitietDiaDiem.pending, (state) => {
          state.ChitietDiaDiemStatus = 'loading';
          state.error = null;
        })
        .addCase(ChitietDiaDiem.fulfilled, (state, action) => {
          state.ChitietDiaDiemStatus = 'succeeded';
          state.ChitietDiaDiemData = action.payload;
        })
        .addCase(ChitietDiaDiem.rejected, (state, action) => {
          state.ChitietDiaDiemStatus = 'failed';
          state.error = action.payload;
        });
    },
  });
  

export const { resetChitietDiaDiem } = ChitietDiaDiemSlice.actions;
export default ChitietDiaDiemSlice.reducer;