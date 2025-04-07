import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Text,
  StatusBar,
  Platform,
  RefreshControl,
  Animated,
  Dimensions,
  useWindowDimensions,
  LogBox,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs } from '../redux/BlogSlice';
import { useNavigation } from '@react-navigation/native';
import { SharedElement } from 'react-navigation-shared-element';
import moment from 'moment';
import AntDesign from 'react-native-vector-icons/AntDesign';
import 'moment/locale/vi'; // Import Vietnamese locale
import RenderHTML from 'react-native-render-html';
import Lottie from 'lottie-react-native'; // Thêm Lottie cho loading
import { AppContext } from '../AppContext'; // Thêm AppContext

// Bỏ qua các cảnh báo về defaultProps từ react-native-render-html
LogBox.ignoreLogs([
  'Support for defaultProps will be removed from function components in a future major release',
  'Support for defaultProps will be removed from memo components in a future major release',
]);

const { width } = Dimensions.get('window');

const Blog = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { width: screenWidth } = useWindowDimensions();
  const { user, isLoading: contextLoading } = useContext(AppContext); // Lấy user từ AppContext

  const { blogData = [], blogStatus, error } = useSelector((state) => state.blog);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Set moment locale to Vietnamese
  moment.locale('vi');

  // Kiểm tra user khi component mount hoặc user thay đổi
  useEffect(() => {
    if (!contextLoading && !user) {
      console.log('User không tồn tại, không tải dữ liệu');
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    }
  }, [user, contextLoading, navigation]);

  // Gọi API lấy dữ liệu blog
  useEffect(() => {
    if (!user) return;

    console.log('Dispatching fetchBlogs');
    loadBlogsData();

    // Start fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    return () => {
      setSearchQuery('');
      setRefreshing(false);
    };
  }, [dispatch, user]);

  const loadBlogsData = () => {
    dispatch(fetchBlogs())
      .then(result => {
        console.log('Blogs fetch result:', result.meta.requestStatus);
        console.log('Blogs data count:', result.payload?.length || 0);
      })
      .catch(err => console.error('fetchBlogs error:', err));
  };

  const onRefresh = () => {
    if (!user) return;
    setRefreshing(true);
    dispatch(fetchBlogs())
      .finally(() => setRefreshing(false));
  };

  const filteredBlogs = blogData.filter((blog) =>
    blog?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const formatDate = (dateString) => {
    return moment(dateString).format('DD MMM, YYYY');
  };

  const createContentSnippet = (content, maxLength = 150) => {
    if (!content) return '';
    const isHtml = content.includes('<') && content.includes('>');
    if (isHtml) {
      const strippedContent = content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/ /g, ' ')
        .replace(/\s\s+/g, ' ')
        .trim();
      const truncated = strippedContent.substring(0, maxLength);
      return truncated + (truncated.length < strippedContent.length ? '...' : '');
    }
    return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
  };

  const createHtmlSnippet = (content, maxLength = 200) => {
    if (!content) return '';
    let firstPara = '';
    const paraMatch = content.match(/<p[^>]*>(.*?)<\/p>/i);
    if (paraMatch && paraMatch[1]) {
      firstPara = paraMatch[0];
    } else {
      firstPara = content.substring(0, maxLength);
      const lastOpenBracket = firstPara.lastIndexOf('<');
      const lastCloseBracket = firstPara.lastIndexOf('>');
      if (lastOpenBracket > lastCloseBracket) {
        firstPara = firstPara.substring(0, lastOpenBracket);
      }
      firstPara += '...';
    }
    return `<div>${firstPara}</div>`;
  };

  const renderItem = useCallback(
    ({ item, index }) => {
      if (!user || !item || !item._id) {
        console.error('Invalid blog item:', item);
        return null;
      }

      const slug = item.slug ? item.slug.toString() : '';
      const title = item.title ? item.title.toString() : 'Bài viết không tiêu đề';
      const content = item.content ? item.content.toString() : '';
      const coverImage = item.coverImage || 'https://via.placeholder.com/800x600/EDEFF1/333333?text=Wedding+Blog';
      const category = item.category || 'Blog';
      const contentSnippet = createContentSnippet(content);
      const isHtml = content.includes('<') && content.includes('>');
      const isEven = index % 2 === 0;

      return (
        <Animated.View
          style={[
            styles.animatedContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.blogItem, isEven ? styles.blogItemEven : styles.blogItemOdd]}
            onPress={() => navigation.navigate('BlogDetail', { slug })}
            activeOpacity={0.7}
          >
            <View style={styles.imageWrapper}>
              <SharedElement id={`blog.${slug}.image`}>
                <Image
                  source={{ uri: coverImage }}
                  style={styles.coverImage}
                  resizeMode="cover"
                />
              </SharedElement>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.title} numberOfLines={2}>{title}</Text>
              <View style={styles.summaryContainer}>
                {isHtml ? (
                  <View style={{ height: 50, overflow: 'hidden' }}>
                    <RenderHTML
                      contentWidth={screenWidth - 88}
                      source={{ html: createHtmlSnippet(content) }}
                      tagsStyles={{
                        body: styles.htmlSummaryBody,
                        p: styles.htmlSummaryText,
                        div: styles.htmlSummaryText,
                      }}
                      defaultTextProps={{
                        numberOfLines: 2,
                        style: { fontFamily: 'Playfair_me' },
                      }}
                      renderersProps={{
                        img: { contentWidth: screenWidth - 88, enableExperimentalPercentWidth: true },
                      }}
                    />
                  </View>
                ) : (
                  <Text style={styles.summary} numberOfLines={2}>{contentSnippet}</Text>
                )}
              </View>
              <View style={styles.metaContainer}>
                {item.created_at && (
                  <View style={styles.metaItem}>
                    <AntDesign name="calendar" size={14} color="#888" />
                    <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
                  </View>
                )}
                {item.author && (
                  <View style={styles.metaItem}>
                    <AntDesign name="user" size={14} color="#888" />
                    <Text style={styles.metaText}>
                      {typeof item.author === 'object' ? item.author.name || 'Không rõ tác giả' : item.author.toString()}
                    </Text>
                  </View>
                )}
                <View style={styles.readMoreContainer}>
                  <Text style={styles.readMoreText}>Đọc tiếp</Text>
                  <AntDesign name="arrowright" size={14} color="#FF6B6B" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [user, navigation, screenWidth, fadeAnim]
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <Lottie
        source={require('../Assets/Animations/blackloading.json')}
        autoPlay
        loop
        style={styles.loadingAnimation}
      />
      <Text style={styles.loadingText}>Đang tải bài viết...</Text>
    </View>
  );

  if (contextLoading || (blogStatus === 'loading' && !refreshing)) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        {renderLoading()}
      </SafeAreaView>
    );
  }

  if (!user) {
    return null;
  }

  if (blogStatus === 'failed' && !blogData.length) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <View style={styles.errorContent}>
          <Image source={require('../Assets/Images/error.png')} style={{ width: 80, height: 80, marginBottom: 16 }} />
          <Text style={styles.errorTitle}>Không thể tải dữ liệu bài viết</Text>
          <Text style={styles.errorText}>{error || 'Có lỗi xảy ra'}</Text>
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
                const { API_BASE_URL } = require('../redux/BlogSlice');
                console.log('Checking connection to:', API_BASE_URL);
                alert(
                  'Thông tin kết nối:\n\n' +
                  `Server hiện tại: ${API_BASE_URL}\n\n` +
                  'Đảm bảo rằng:\n' +
                  '1. Server đang chạy trên đúng cổng\n' +
                  '2. Thiết bị của bạn và server cùng một mạng LAN\n' +
                  '3. Nếu dùng thiết bị thật, sửa IP của server trong BlogSlice.js\n' +
                  '4. API trả về đúng cấu trúc dữ liệu (status: true, data: [...])\n' +
                  '\nTips:\n' +
                  '- Thử ping tới server từ thiết bị\n' +
                  '- Tắt tường lửa trên máy chủ\n' +
                  '- Kiểm tra API qua trình duyệt'
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

  if (!blogData || blogData.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <View style={styles.emptyContent}>
          <Image source={require('../Assets/Images/mask.png')} style={{ width: 100, height: 100, marginBottom: 16, opacity: 0.7 }} />
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('TabNavigation')}
          activeOpacity={0.6}
        >
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Blog Và Xu Hướng</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('TabNavigation')}
          activeOpacity={0.6}
        >
          <Image source={require('../Assets/Images/home48.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <AntDesign name="search1" size={18} color="#AAA" style={styles.searchIcon} />
        <TextInput
          placeholder="Tìm kiếm bài viết..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <AntDesign name="closecircle" size={16} color="#999" />
          </TouchableOpacity>
        )}
      </View>

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
            colors={['#C8815F']}
            tintColor="#C8815F"
          />
        }
        ListEmptyComponent={
          searchQuery.length > 0 ? (
            <View style={styles.noResultsContainer}>
              <AntDesign name="search1" size={40} color="#DDD" style={{ marginBottom: 16 }} />
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
  container: {
    flex: 1,
    backgroundColor: '#FBF9F6',
  },
  animatedContainer: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EAE3',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Playfair_me',
    letterSpacing: 0.5,
    textAlign: 'center',
    flex: 1,
  },
  headerButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    height: 54,
    borderWidth: 1,
    borderColor: '#F0EAE3',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 54,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Playfair_me',
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
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0EAE3',
  },
  blogItemEven: {},
  blogItemOdd: {},
  imageWrapper: {
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#E1E4E8',
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#C8815F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Playfair_me',
  },
  contentContainer: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Playfair_me',
    lineHeight: 28,
  },
  summaryContainer: {
    marginBottom: 20,
    height: 50,
  },
  summary: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
    fontFamily: 'Playfair_me',
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0EAE3',
    paddingTop: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#888',
    fontFamily: 'Playfair_me',
    marginLeft: 5,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F2EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  readMoreText: {
    fontSize: 13,
    color: '#C8815F',
    fontFamily: 'Playfair_me',
    fontWeight: 'bold',
    marginRight: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBF9F6',
  },
  loadingAnimation: {
    width: 100,
    height: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Playfair_me',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#FBF9F6',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Playfair_me',
  },
  errorText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
    fontFamily: 'Playfair_me',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  retryButton: {
    backgroundColor: '#C8815F',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginHorizontal: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
    fontFamily: 'Playfair_me',
  },
  checkButton: {
    backgroundColor: '#5D5F82',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FBF9F6',
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Playfair_me',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 24,
    fontFamily: 'Playfair_me',
    maxWidth: width * 0.8,
  },
  noResultsContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 17,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Playfair_me',
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  clearSearchButton: {
    backgroundColor: '#F8F2EA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  clearSearchButtonText: {
    color: '#C8815F',
    fontWeight: '500',
    fontSize: 15,
    fontFamily: 'Playfair_me',
  },
  htmlSummaryBody: {
    color: '#666',
    fontFamily: 'Playfair_me',
    fontSize: 15,
  },
  htmlSummaryText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    fontFamily: 'Playfair_me',
  },
});

export default Blog;