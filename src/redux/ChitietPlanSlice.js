import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Thunk để lấy chi tiết kế hoạch
export const ChitietPlan = createAsyncThunk(
  'plan/fetchDetail',
  async (planid, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://apidatn.onrender.com/plan/${planid}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Lấy chi tiết thất bại: ${response.status} - ${text}`);
      }
      if (!text) throw new Error('Phản hồi từ server rỗng');
      const data = JSON.parse(text);
      
      return data.data;
    } catch (error) {
      console.error('Lỗi fetch ChitietPlan:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const duplicatePlan = createAsyncThunk(
  'plan/duplicatePlan',
  async ({ planId, userId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://apidatn.onrender.com/plan/update/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          UserId: userId, 
          forceDuplicate: true, 
          isCopy: true, 
          originalPlanId: planId 
        }),
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`Tạo bản sao thất bại: ${response.status} - ${text}`);
      if (!text) throw new Error('Phản hồi từ server rỗng');
      const data = JSON.parse(text);
      console.log('API Response (duplicate):', data);
      
      // Kiểm tra xem server có trả về _id mới không
      if (!data.data._id || data.data._id === planId) {
        throw new Error('Server không tạo bản sao mới, _id không thay đổi');
      }
      
      return { 
        ...data.data, 
        isCopy: true, 
        originalPlanId: planId 
      };
    } catch (error) {
      console.error('Lỗi duplicatePlan:', error.message);
      return rejectWithValue(error.message);
    }
  }
);




// Thunk để cập nhật kế hoạch (dùng sau khi chỉnh sửa bản sao)
export const updatePlan = createAsyncThunk(
  'plan/updatePlan',
  async ({ planId, updateData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://apidatn.onrender.com/plan/update/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Cập nhật thất bại: ${response.status} - ${text}`);
      }
      if (!text) throw new Error('Phản hồi từ server rỗng');
      const data = JSON.parse(text);
      console.log('API Response (update):', data);
      return data.data;
    } catch (error) {
      console.error('Lỗi updatePlan:', error.message);
      return rejectWithValue(error.message);
    }
  }
);

const ChitietPlanSlice = createSlice({
  name: 'chitietplan',
  initialState: {
    ChitietPlanData: null,
    ChitietPlanStatus: 'idle',
    error: null,
  },
  reducers: {
    resetChitietPlan: (state) => {
      state.ChitietPlanData = null;
      state.ChitietPlanStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ChitietPlan
      .addCase(ChitietPlan.pending, (state) => {
        state.ChitietPlanStatus = 'loading';
        state.error = null;
        state.ChitietPlanData = null;
      })
      .addCase(ChitietPlan.fulfilled, (state, action) => {
        state.ChitietPlanStatus = 'succeeded';
        state.ChitietPlanData = action.payload;
        state.error = null;
      })
      .addCase(ChitietPlan.rejected, (state, action) => {
        state.ChitietPlanStatus = 'failed';
        state.error = action.payload;
        state.ChitietPlanData = null;
      })
      // duplicatePlan
      .addCase(duplicatePlan.pending, (state) => {
        state.ChitietPlanStatus = 'loading';
        state.error = null;
      })
      .addCase(duplicatePlan.fulfilled, (state, action) => {
        state.ChitietPlanStatus = 'succeeded';
        if (state.ChitietPlanData) {
          state.ChitietPlanData = {
            ...state.ChitietPlanData,
            duplicatedPlans: [...(state.ChitietPlanData.duplicatedPlans || []), action.payload],
          };
        } else {
          state.ChitietPlanData = { duplicatedPlans: [action.payload] };
        }
        state.error = null;
      })
      .addCase(duplicatePlan.rejected, (state, action) => {
        state.ChitietPlanStatus = 'failed';
        state.error = action.payload;
      })
      // updatePlan
      .addCase(updatePlan.pending, (state) => {
        state.ChitietPlanStatus = 'loading';
        state.error = null;
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        state.ChitietPlanStatus = 'succeeded';
        state.ChitietPlanData = action.payload;
        state.error = null;
      })
      .addCase(updatePlan.rejected, (state, action) => {
        state.ChitietPlanStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetChitietPlan } = ChitietPlanSlice.actions;
export default ChitietPlanSlice.reducer;