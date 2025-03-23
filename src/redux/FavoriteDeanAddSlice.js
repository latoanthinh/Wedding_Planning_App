import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Lấy danh sách yêu thích của người dùng
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
            console.log('Dữ liệu từ API:', data);

            if (!data.status) {
                return rejectWithValue(data.message || 'Lỗi không xác định');
            }

            const favorites = [];
            const categories = {
                catering: data.data.Catering || [],
                decorate: data.data.Decorate || [],
                Sanh: data.data.Lobby || [],
                present: data.data.Present || [],
            };

            for (const [type, orders] of Object.entries(categories)) {
                if (!Array.isArray(orders)) {
                    continue;
                }

                orders.forEach(order => {
                    const itemKey = `${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()}Id`;
                    const item = order[itemKey];

                    if (!item || !order._id) {
                        return;
                    }

                    favorites.push({
                        type: type, // Chuẩn hóa type thành chữ thường
                        itemId: order._id.toString(),
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

// Thêm mục yêu thích mới
export const addFavoriteItem = createAsyncThunk(
    'favorite/addFavoriteItem',
    async ({ userId, type, itemId }, { rejectWithValue }) => {
        try {
            const normalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
            const response = await fetch(`https://apidatn.onrender.com/favorite/add/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type: normalizedType, itemId }),
            });

            if (!response.ok) {
                const text = await response.text();
                console.error(`Lỗi khi thêm yêu thích: ${response.status} - ${text}`);
                throw new Error(`Phản hồi không hợp lệ: ${response.status} - ${text}`);
            }

            const data = await response.json();

            if (!data.status) {
                return rejectWithValue(data.message);
            }

            // Gọi lại fetchUserFavorites để lấy danh sách mới
            const responseFavorites = await fetch(`https://apidatn.onrender.com/favorite/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const updatedData = await responseFavorites.json();
            const favorites = [];
            const categories = {
                catering: updatedData.data.Catering || [],
                decorate: updatedData.data.Decorate || [],
                Sanh: updatedData.data.Lobby || [],
                present: updatedData.data.Present || [],
            };

            for (const [type, orders] of Object.entries(categories)) {
                if (!Array.isArray(orders)) continue;
                orders.forEach(order => {
                    const itemKey = `${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()}Id`;
                    const item = order[itemKey];
                    if (!item || !order._id) return;
                    favorites.push({
                        type: type,
                        itemId: order._id.toString(),
                        _id: order._id.toString(),
                        image: item.imageUrl || item.image || 'https://via.placeholder.com/80',
                        name: item.name || 'Không có tên',
                        price: item.price || 0,
                    });
                });
            }

            return favorites;
        } catch (error) {
            console.error("Lỗi addFavoriteItem:", error.message);
            return rejectWithValue(error.message);
        }
    }
);

// Xóa mục yêu thích
export const removeFavoriteItem = createAsyncThunk(
    'favorite/removeFavoriteItem',
    async ({ userId, type, itemId }, { rejectWithValue, dispatch }) => {
        try {
            if (!userId || !type || !itemId) {
                return rejectWithValue("Thiếu userId, type hoặc itemId.");
            }

            const normalizedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
            console.log(`Gọi API xóa: userId=${userId}, type=${normalizedType}, itemId=${itemId}`);

            const response = await fetch(`https://apidatn.onrender.com/favorite/delete/${userId}?type=${normalizedType}&itemId=${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const text = await response.text();
                console.error(`Lỗi khi xóa yêu thích: ${response.status} - ${text}`);
                throw new Error(`Phản hồi không hợp lệ: ${response.status} - ${text}`);
            }

            const data = await response.json();

            if (!data.status) {
                return rejectWithValue(data.message);
            }

            // Gọi lại fetchUserFavorites để lấy danh sách mới
            const updatedFavorites = await dispatch(fetchUserFavorites(userId)).unwrap();
            return updatedFavorites;
        } catch (error) {
            console.error("Lỗi removeFavoriteItem:", error.message);
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
                state.data = action.payload; // Ghi đè dữ liệu cũ
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
                state.data = action.payload; // Cập nhật toàn bộ danh sách
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
                state.data = action.payload; // Cập nhật toàn bộ danh sách từ fetchUserFavorites
            })
            .addCase(removeFavoriteItem.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { resetFavorites } = FavoriteDeanAddSlice.actions;
export default FavoriteDeanAddSlice.reducer;