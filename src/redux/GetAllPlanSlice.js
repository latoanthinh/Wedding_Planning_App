import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';



// Add new async thunk for deleting a plan
export const deletePlan = createAsyncThunk(
  'plan/delete',
  async ({ userId, planId }, { rejectWithValue }) => {
    try {
      if (!userId.match(/^[0-9a-fA-F]{24}$/) || !planId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Invalid userId or planId');
      }

      const response = await fetch(`https://apidatn.onrender.com/plan/user/${userId}/plan/${planId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete plan: ${response.status} - ${errorText}`);
      }

      return planId; // Return the deleted planId
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Hàm async gọi API với userId
export const Plan = createAsyncThunk('plan/all', async (userId, { rejectWithValue }) => {
  try {
    // Kiểm tra userId trước khi gọi API
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error('UserId không hợp lệ');
    }

    const response = await fetch(`https://apidatn.onrender.com/plan/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch plans: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.data) {
      throw new Error('No data returned from API');
    }

    return data.data; // Dữ liệu trả về từ API
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Update the slice
export const GetAllPlanSlice = createSlice({
  name: 'plan',
  initialState: {
    AllPlanData: [],
    AllPlanStatus: 'idle',
    deleteStatus: 'idle', // Add delete status
    error: null,
  },
  reducers: {
    resetAllPlan: (state) => {
      state.AllPlanData = [];
      state.AllPlanStatus = 'idle';
      state.deleteStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Existing Plan cases...
      .addCase(Plan.pending, (state) => {
        state.AllPlanStatus = 'loading';
        state.error = null;
      })
      .addCase(Plan.fulfilled, (state, action) => {
        state.AllPlanStatus = 'succeeded';
        state.AllPlanData = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(Plan.rejected, (state, action) => {
        state.AllPlanStatus = 'failed';
        state.AllPlanData = [];
        state.error = action.payload;
      })
      // New deletePlan cases
      .addCase(deletePlan.pending, (state) => {
        state.deleteStatus = 'loading';
        state.error = null;
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.deleteStatus = 'succeeded';
        // Remove the deleted plan from AllPlanData
        state.AllPlanData = state.AllPlanData.filter(
          (plan) => plan._id !== action.payload
        );
      })
      .addCase(deletePlan.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetAllPlan } = GetAllPlanSlice.actions;
export default GetAllPlanSlice.reducer;