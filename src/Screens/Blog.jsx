import React, { useEffect, useState } from 'react';
import { 
  View, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  StyleSheet, 
  TextInput, 
  Text, 
  StatusBar,
  Platform,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs } from '../redux/BlogSlice';
import { useNavigation } from '@react-navigation/native';
import { SharedElement } from 'react-navigation-shared-element';
import moment from 'moment';
import 'moment/locale/vi'; // Import Vietnamese locale

const Blog = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  // Get state from Redux store
  const { blogData, blogStatus, error } = useSelector((state) => state.blog);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Set moment locale to Vietnamese
  moment.locale('vi');

  useEffect(() => {
    console.log('Dispatching fetchBlogs');
    loadBlogsData();
  }, [dispatch]);

  // Function to fetch blogs data
  const loadBlogsData = () => {
    dispatch(fetchBlogs())
      .then(result => {
        console.log('Blogs fetch result:', result.meta.requestStatus);
        console.log('Blogs data count:', result.payload?.length || 0);
      })
      .catch(err => console.error('fetchBlogs error:', err));
  };

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchBlogs())
      .finally(() => {
        setRefreshing(false);
      });
  };

  // Filter blogs based on search query
  const filteredBlogs = blogData?.filter((blog) =>
    blog?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Format date
  const formatDate = (dateString) => {
    return moment(dateString).format('DD MMM, YYYY');
  };

  // Render each blog item
  const renderItem = ({ item }) => {
    // Check for valid data before rendering
    if (!item || typeof item !== 'object') {
      console.error('Invalid blog item:', item);
      return null;
    }
    
    // Ensure all required properties are valid
    const slug = item.slug ? item.slug.toString() : '';
    const title = item.title ? item.title.toString() : 'Bài viết không tiêu đề';
    const content = item.content ? item.content.toString() : '';
    const coverImage = item.coverImage || 'https://via.placeholder.com/800x600/EDEFF1/333333?text=Wedding+Blog';

    
    return (
      <TouchableOpacity
        style={styles.blogItem}
        onPress={() => navigation.navigate('BlogDetail', { slug })}
        activeOpacity={0.7}
      >
        <SharedElement id={`blog.${slug}.image`}>
          <Image 
            source={{ uri: coverImage }} 
            style={styles.coverImage} 
            resizeMode="cover"
          />
        </SharedElement>
        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.summary} numberOfLines={2}>
            {content ? content.substring(0, 100) + '...' : 'Bài viết đám cưới'}
          </Text>
          <View style={styles.metaContainer}>
            {item.created_at && (
              <View style={styles.metaItem}>
                <Image source={require('../Assets/Images/calendar.png')} style={styles.metaIcon} />
                <Text style={styles.metaText}>
                  {formatDate(item.created_at)}
                </Text>
              </View>
            )}
            {item.author && (
              <View style={styles.metaItem}>
                <Image source={require('../Assets/Images/user.png')} style={styles.metaIcon} />
                <Text style={styles.metaText}>
                  {typeof item.author === 'object' ? item.author.name || 'Không rõ tác giả' : item.author.toString()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render loading state
  if (blogStatus === 'loading' && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Đang tải bài viết...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (blogStatus === 'failed' && !blogData.length) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <View style={styles.errorContent}>
          <Image source={require('../Assets/Images/error.png')} style={{ width: 70, height: 70, marginBottom: 10 }} />
          <Text style={styles.errorTitle}>Không thể tải dữ liệu bài viết</Text>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => dispatch(fetchBlogs())}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.retryButton, styles.checkButton]}
              onPress={() => {
                // Import API_BASE_URL from BlogSlice
                const { API_BASE_URL } = require('../redux/BlogSlice');
                console.log('Checking connection to:', API_BASE_URL);
                // Show alert with connection info and debugging tips
                alert(
                  'Thông tin kết nối:\n\n' +
                  `Server hiện tại: ${API_BASE_URL}\n\n` +
                  'Đảm bảo rằng:\n' +
                  '1. Server đang chạy trên đúng cổng\n' +
                  '2. Thiết bị của bạn và server cùng một mạng LAN\n' +
                  '3. Nếu đang dùng thiết bị thật, hãy sửa IP của server trong BlogSlice.js\n' +
                  '4. API trả về đúng cấu trúc dữ liệu (status: true, data: [...])\n' +
                  '\n\nTips:\n' +
                  '- Thử ping tới server từ thiết bị\n' +
                  '- Tắt tường lửa trên máy chủ\n' +
                  '- Kiểm tra API trực tiếp qua trình duyệt'
                );
              }}
            >
              <Text style={styles.retryButtonText}>Thông tin gỡ lỗi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Render empty state when no blogs are available
  if (!blogData || blogData.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <View style={styles.emptyContent}>
          <Image source={require('../Assets/Images/mask.png')} style={{ width: 70, height: 70, marginBottom: 10 }} />
          <Text style={styles.emptyTitle}>Không có bài viết nào</Text>
          <Text style={styles.emptyText}>Hiện chưa có bài viết nào được đăng tải. Vui lòng quay lại sau.</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => dispatch(fetchBlogs())}
          >
            <Text style={styles.retryButtonText}>Làm mới</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main render with blog list
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <SafeAreaView style={styles.safeHeader}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Image 
              source={require('../Assets/Images/back.png')} 
              style={styles.headerIcon} 
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Blog đám cưới</Text>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('TabNavigation')}>
            <Image 
              source={require('../Assets/Images/home48.png')} 
              style={styles.headerIcon} 
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Image 
          source={require('../Assets/Images/search.png')} 
          style={styles.searchIcon} 
          resizeMode="contain"
        />
        <TextInput
          placeholder="Tìm kiếm bài viết..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Image 
              source={require('../Assets/Images/delete.png')} 
              style={{ width: 16, height: 16 }} 
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Blog list */}
      <FlatList
        data={filteredBlogs}
        keyExtractor={(item) => item._id || item.id || item.slug || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B6B']}
            tintColor="#FF6B6B"
          />
        }
        ListEmptyComponent={
          searchQuery.length > 0 ? (
            <View style={styles.noResultsContainer}>
              <Image 
                source={require('../Assets/Images/search.png')} 
                style={{ width: 40, height: 40, marginBottom: 10, opacity: 0.5 }} 
              />
              <Text style={styles.noResultsText}>
                Không tìm thấy kết quả cho "{searchQuery}"
              </Text>
              <TouchableOpacity 
                style={styles.clearSearchButton}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearSearchButtonText}>Xóa tìm kiếm</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  safeHeader: {
    backgroundColor: '#FFFFFF',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Playfair_me'
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    opacity: 0.6,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Playfair_me'
  },
  clearButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  blogItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coverImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E1E4E8',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Playfair_me'
  },
  summary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'Playfair_me'
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
    marginBottom: 4,
  },
  metaIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
    opacity: 0.7,
  },
  metaText: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Playfair_me',
  },
  
  // Loading state styles
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Playfair_me',
  },
  
  // Error state styles
  errorContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Playfair_me',
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    fontFamily: 'Playfair_me',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 6,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Playfair_me',
  },
  checkButton: {
    backgroundColor: '#5C6BC0',
  },
  
  // Empty state styles
  emptyContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Playfair_me',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    fontFamily: 'Playfair_me',
  },
  
  // No results styles
  noResultsContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Playfair_me',
  },
  clearSearchButton: {
    backgroundColor: '#F2F2F2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  clearSearchButtonText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
    fontFamily: 'Playfair_me',
  },
});

export default Blog;
