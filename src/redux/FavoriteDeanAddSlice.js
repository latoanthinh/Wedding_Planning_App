import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUserFavorites = createAsyncThunk(
    'favorite/fetchUserFavorites',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await fetch(`https://apidatn.onrender.com/favorite/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Phản hồi không hợp lệ: ${response.status} - ${text}`);
            }

            const data = await response.json();
            if (!data.status) {
                return rejectWithValue(data.message || 'Lỗi không xác định');
            }

            const favorites = [];
            const categories = {
                Catering: data.data.Catering || [],
                Decorate: data.data.Decorate || [],
                Sanh: data.data.Lobby || [],
                Present: data.data.Present || [],
            };

            for (const [type, orders] of Object.entries(categories)) {
                if (!Array.isArray(orders)) {
                    continue;
                }

                orders.forEach((order) => {
                    const itemKey = `${type}Id`;
                    const item = order[itemKey];

                    if (!item || !order._id) {
                        return;
                    }

                    favorites.push({
                        type,
                        itemId: item._id.toString(),
                        _id: order._id.toString(),
                        image: item.imageUrl || item.image || 'https://via.placeholder.com/80',
                        name: item.name || 'Không có tên',
                        price: item.price || 0,
                    });
                });
            }

            return favorites.length > 0 ? favorites : [];
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addFavoriteItem = createAsyncThunk(
    'favorite/addFavoriteItem',
    async ({ userId, type, itemId }, { rejectWithValue, dispatch }) => {
        try {
            const response = await fetch(`https://apidatn.onrender.com/favorite/add/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type, itemId }),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Phản hồi không hợp lệ: ${response.status} - ${text}`);
            }

            const data = await response.json();
            if (!data.status) {
                return rejectWithValue(data.message);
            }

            const updatedFavorites = await dispatch(fetchUserFavorites(userId)).unwrap();
            return updatedFavorites;
        } catch (error) {
            console.error('Lỗi addFavoriteItem:', error.message);
            return rejectWithValue(error.message);
        }
    }
);

export const removeFavoriteItem = createAsyncThunk(
    'favorite/removeFavoriteItem',
    async ({ userId, type, itemId }, { rejectWithValue, dispatch }) => {
        try {
            if (!userId || !type || !itemId) {
                return rejectWithValue('Thiếu userId, type hoặc itemId.');
            }

            const response = await fetch(
                `https://apidatn.onrender.com/favorite/delete/${userId}?type=${type}&itemId=${itemId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Phản hồi không hợp lệ: ${response.status} - ${text}`);
            }

            const data = await response.json();
            if (!data.status) {
                return rejectWithValue(data.message);
            }

            const updatedFavorites = await dispatch(fetchUserFavorites(userId)).unwrap();
            return updatedFavorites;
        } catch (error) {
            console.error('Lỗi removeFavoriteItem:', error.message);
            return rejectWithValue(error.message);
        }
    }
);

const FavoriteDeanAddSlice = createSlice({
    name: 'favoriteset',
    initialState: {
        data: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        resetFavorites: (state) => {
            state.data = [];
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserFavorites.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUserFavorites.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(fetchUserFavorites.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(addFavoriteItem.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(addFavoriteItem.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(addFavoriteItem.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(removeFavoriteItem.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(removeFavoriteItem.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.data = action.payload;
            })
            .addCase(removeFavoriteItem.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { resetFavorites } = FavoriteDeanAddSlice.actions;
export default FavoriteDeanAddSlice.reducer;