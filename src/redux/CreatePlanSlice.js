    import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

    // API endpoint


    // Thunk để tạo Plan
    export const createPlan = createAsyncThunk(
        'plan/createPlan',
        async (planData, { rejectWithValue }) => {
            try {
                const response = await fetch('https://apidatn.onrender.com/plan/create-plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(planData),
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                return data;
            } catch (error) {
                return rejectWithValue(error.message);
            }
        }
    );

    // Thunk để lấy thông tin Plan theo ID

    export const fetchPlanById = createAsyncThunk(
        'plan/fetchPlanById',
        async (planId, { rejectWithValue }) => {
            try {
                const response = await fetch(`https://apidatn.onrender.com/plan/${planId}`);
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                return data.data;
            } catch (error) {
                return rejectWithValue(error.message);
            }
        }
    );

    const CreatePlanSlice = createSlice({
        name: 'plan',
        initialState: {
            plan: null,
            loading: false,
            error: null,
        },
        reducers: {},
        extraReducers: (builder) => {
            builder
                .addCase(createPlan.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                })
                .addCase(createPlan.fulfilled, (state, action) => {
                    state.loading = false;
                    state.plan = action.payload.plan;
                })
                .addCase(createPlan.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                })
                .addCase(fetchPlanById.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                })
                .addCase(fetchPlanById.fulfilled, (state, action) => {
                    state.loading = false;
                    state.plan = action.payload;
                })
                .addCase(fetchPlanById.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                });
        },
    });

    export default CreatePlanSlice.reducer;

