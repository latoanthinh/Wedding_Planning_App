import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


const API_BASE_URL = 'https://apidatn.onrender.com/blog';

// Async thunk để lấy danh sách bài viết
export const fetchBlogs = createAsyncThunk(
  'blog/fetchBlogs', 
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching blogs from:', API_BASE_URL);
      const response = await fetch(`${API_BASE_URL}/public`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.status) {
        return data.data || [];
      } else if (data && Array.isArray(data)) {
        return data;
      }
      
      return rejectWithValue('Không thể lấy danh sách bài viết');
    } catch (error) {
      console.error('Blog fetch error:', error.message);
      return rejectWithValue(error.message || 'Không thể kết nối đến máy chủ');
    }
  }
);

// Async thunk để lấy chi tiết bài viết theo slug
export const fetchBlogDetail = createAsyncThunk(
  'blog/fetchBlogDetail', 
  async (slug, { rejectWithValue }) => {
    try {
      console.log('Fetching blog detail for slug:', slug);
      const response = await fetch(`${API_BASE_URL}/public/${slug}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.status) {
        return data.data;
      }
      return rejectWithValue(data?.message || 'Không tìm thấy bài viết');
    } catch (error) {
      console.error('Blog detail fetch error:', error.message);
      return rejectWithValue(error.message || 'Không thể tải chi tiết bài viết');
    }
  }
);

// Async thunk để lấy các bài viết liên quan theo slug
export const fetchBlogRelated = createAsyncThunk(
  'blog/fetchBlogRelated', 
  async (slug, { rejectWithValue }) => {
    try {
      console.log('Fetching related blogs for slug:', slug);
      const response = await fetch(`${API_BASE_URL}/public/${slug}/related`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.status) {
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Related blogs fetch error:', error.message);
      // Trả về mảng rỗng nếu có lỗi vì đây chỉ là tính năng phụ
      return [];
    }
  }
);

const blogSlice = createSlice({
  name: 'blog',
  initialState: {
    blogData: [],
    selectedBlog: null,
    relatedBlogs: [],
    blogStatus: 'idle', // idle, loading, succeeded, failed
    detailStatus: 'idle', // idle, loading, succeeded, failed
    relatedStatus: 'idle', // idle, loading, succeeded, failed
    error: null,
    detailError: null,
    relatedError: null,
  },
  reducers: {
    // Xóa dữ liệu bài viết chi tiết khi rời màn hình
    clearSelectedBlog: (state) => {
      state.selectedBlog = null;
      state.relatedBlogs = [];
      state.detailStatus = 'idle';
      state.relatedStatus = 'idle';
      state.detailError = null;
      state.relatedError = null;
    },
    resetBlogData: (state) => {
      state.blogData = [];
      state.blogStatus = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchBlogs
      .addCase(fetchBlogs.pending, (state) => {
        state.blogStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.blogStatus = 'succeeded';
        state.blogData = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.blogStatus = 'failed';
        state.error = action.payload || action.error.message;
      })
      
      // Xử lý fetchBlogDetail
      .addCase(fetchBlogDetail.pending, (state) => {
        state.detailStatus = 'loading';
        state.detailError = null;
      })
      .addCase(fetchBlogDetail.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        state.selectedBlog = action.payload;
      })
      .addCase(fetchBlogDetail.rejected, (state, action) => {
        state.detailStatus = 'failed';
        state.detailError = action.payload || action.error.message;
      })
      
      // Xử lý fetchBlogRelated
      .addCase(fetchBlogRelated.pending, (state) => {
        state.relatedStatus = 'loading';
        state.relatedError = null;
      })
      .addCase(fetchBlogRelated.fulfilled, (state, action) => {
        state.relatedStatus = 'succeeded';
        state.relatedBlogs = action.payload;
      })
      .addCase(fetchBlogRelated.rejected, (state, action) => {
        state.relatedStatus = 'failed';
        state.relatedError = action.payload || action.error.message;
      });
  },
});

export const { clearSelectedBlog, resetBlogData } = blogSlice.actions;
export default blogSlice.reducer;
