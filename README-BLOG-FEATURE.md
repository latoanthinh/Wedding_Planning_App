# Tính năng Blog

## Tổng quan

Tính năng Blog trong ứng dụng Wedding Planning App cung cấp cho người dùng các bài viết hữu ích về kế hoạch đám cưới, xu hướng, và lời khuyên. Các bài viết được hiển thị trong giao diện thân thiện với người dùng, với hiệu ứng chuyển tiếp mượt mà giữa danh sách bài viết và chi tiết bài viết.

## Cấu trúc tính năng

### Redux Store

Tính năng Blog sử dụng Redux để quản lý state với cấu trúc sau:

```javascript
{
  blogData: [],          // Danh sách tất cả các bài viết
  selectedBlog: null,    // Chi tiết của một bài viết cụ thể
  relatedBlogs: [],      // Danh sách các bài viết liên quan
  
  blogStatus: 'idle',    // Trạng thái tải danh sách ('idle', 'loading', 'succeeded', 'failed')
  detailStatus: 'idle',  // Trạng thái tải chi tiết
  relatedStatus: 'idle', // Trạng thái tải bài viết liên quan
  
  error: null,           // Lỗi khi tải danh sách bài viết
  detailError: null,     // Lỗi khi tải chi tiết bài viết
  relatedError: null     // Lỗi khi tải bài viết liên quan
}
```

### API Endpoints

Tính năng Blog tương tác với ba API endpoint sau:

1. **GET /blogs**: Lấy danh sách tất cả các bài viết
   - Action: `fetchBlogs`
   - Reducer: Cập nhật `blogData`

2. **GET /blogs/detail/:slug**: Lấy chi tiết của một bài viết dựa trên slug
   - Action: `fetchBlogDetail`
   - Reducer: Cập nhật `selectedBlog`

3. **GET /blogs/related/:slug**: Lấy danh sách các bài viết liên quan dựa trên slug
   - Action: `fetchBlogRelated`
   - Reducer: Cập nhật `relatedBlogs`

### Các Component

1. **Blog.jsx**: Hiển thị danh sách bài viết
   - Hỗ trợ tìm kiếm bài viết dựa trên tiêu đề
   - Hỗ trợ pull-to-refresh để tải lại dữ liệu
   - Hiển thị trạng thái loading, error và empty state
   - Sử dụng SharedElement để tạo hiệu ứng chuyển tiếp

2. **BlogDetail.jsx**: Hiển thị chi tiết bài viết
   - Hiển thị tiêu đề, mô tả, hình ảnh và nội dung bài viết
   - Hiển thị danh sách bài viết liên quan
   - Tích hợp tính năng chia sẻ bài viết
   - Sử dụng SharedElement để tạo hiệu ứng chuyển tiếp
   - Hiển thị trạng thái loading, error

3. **StackNavigation.jsx**: Cấu hình navigation cho các màn hình Blog
   - Cấu hình SharedElementStackNavigator để hỗ trợ hiệu ứng chuyển tiếp
   - Điều chỉnh các tùy chọn chuyển tiếp để tạo trải nghiệm mượt mà

## Cách sử dụng

### Hiển thị danh sách bài viết

```javascript
// Trong component của bạn
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs } from '../redux/BlogSlice';

const MyComponent = () => {
  const dispatch = useDispatch();
  const { blogData, blogStatus, error } = useSelector((state) => state.blog);
  
  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);
  
  // Hiển thị danh sách bài viết
  // ...
};
```

### Hiển thị chi tiết bài viết

```javascript
// Trong component của bạn
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogDetail, fetchBlogRelated, clearSelectedBlog } from '../redux/BlogSlice';

const BlogDetailScreen = ({ route }) => {
  const { slug } = route.params;
  const dispatch = useDispatch();
  const { 
    selectedBlog, 
    relatedBlogs, 
    detailStatus, 
    relatedStatus, 
    detailError, 
    relatedError 
  } = useSelector((state) => state.blog);
  
  useEffect(() => {
    dispatch(fetchBlogDetail(slug));
    dispatch(fetchBlogRelated(slug));
    
    return () => {
      dispatch(clearSelectedBlog());
    };
  }, [dispatch, slug]);
  
  // Hiển thị chi tiết bài viết và bài viết liên quan
  // ...
};
```

## Shared Element Transition

Tính năng Blog sử dụng React Navigation Shared Element để tạo hiệu ứng chuyển tiếp mượt mà giữa danh sách bài viết và chi tiết bài viết. Khi người dùng nhấn vào một bài viết, hình ảnh của bài viết sẽ được animate mượt mà từ vị trí trong danh sách đến vị trí trong trang chi tiết.

```javascript
// Trong Blog.jsx
<SharedElement id={`blog.${item.slug}.image`}>
  <Image source={{ uri: item.featuredImage }} style={styles.image} />
</SharedElement>

// Trong BlogDetail.jsx
<SharedElement id={`blog.${route.params.slug}.image`}>
  <Image source={{ uri: selectedBlog.featuredImage }} style={styles.headerImage} />
</SharedElement>
```

## Cải tiến và Bảo trì

Để cải tiến hoặc bảo trì tính năng Blog, bạn có thể:

1. Thêm tính năng phân trang cho danh sách bài viết
2. Thêm tính năng bình luận cho bài viết
3. Cải thiện SEO cho các trang bài viết
4. Thêm tính năng đánh dấu bài viết yêu thích

Mỗi cải tiến này có thể được thực hiện bằng cách cập nhật các thành phần tương ứng trong Redux store và UI components. 