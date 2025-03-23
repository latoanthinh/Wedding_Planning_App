import React, {useEffect, useRef} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
  Dimensions,
  Share,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchBlogDetail,
  clearSelectedBlog,
  fetchBlogRelated,
} from '../redux/BlogSlice';
import {useNavigation} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import moment from 'moment';
import 'moment/locale/vi';
import {SharedElement} from 'react-navigation-shared-element';
import {SafeAreaView} from 'react-native-safe-area-context';
import IconButton from '../components/IconButton';

const {width, height} = Dimensions.get('window');

const BlogDetail = ({route}) => {
  const {slug} = route.params;
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Get state from Redux store
  const {selectedBlog, relatedBlogs, detailStatus, relatedStatus, detailError} =
    useSelector(state => state.blog);

  // Set moment locale to Vietnamese
  moment.locale('vi');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;
  const metaAnim = useRef(new Animated.Value(0)).current;
  const relatedAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fetch blog details
    dispatch(fetchBlogDetail(slug));

    // Cleanup when unmounting
    return () => {
      dispatch(clearSelectedBlog());
    };
  }, [dispatch, slug]);

  useEffect(() => {
    // Fetch related blogs when we have the selected blog
    if (selectedBlog) {
      dispatch(fetchBlogRelated(slug));
    }
  }, [dispatch, selectedBlog, slug]);

  useEffect(() => {
    if (selectedBlog) {
      // Start animations when blog data is loaded
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(imageAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(titleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(metaAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(contentAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(relatedAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [
    fadeAnim,
    slideAnim,
    titleAnim,
    contentAnim,
    imageAnim,
    metaAnim,
    relatedAnim,
    selectedBlog,
  ]);

  const handleRetry = () => {
    dispatch(fetchBlogDetail(slug));
  };

  const formatDate = dateString => {
    return moment(dateString).format('DD MMMM, YYYY');
  };

  const navigateToRelatedBlog = relatedSlug => {
    navigation.push('BlogDetail', {slug: relatedSlug});
  };

  const handleShare = async () => {
    if (!selectedBlog) return;

    try {
      const result = await Share.share({
        message: `Xem bài viết "${selectedBlog.title}" trên ứng dụng Wedding Planning`,
        title: selectedBlog.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Render loading state
  if (detailStatus === 'loading') {
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
  if (detailStatus === 'failed') {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <View style={styles.errorContent}>
          <Image
            source={require('../Assets/Images/error.png')}
            style={{width: 70, height: 70, marginBottom: 10}}
          />
          <Text style={styles.errorTitle}>Không thể tải bài viết</Text>
          <Text style={styles.errorMessage}>{detailError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render empty state
  if (!selectedBlog) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
        <View style={styles.loadingContent}>
          <Text style={styles.noDataText}>Không tìm thấy bài viết</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      {/* Header with back button and home button */}
      <SafeAreaView style={styles.safeHeader}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}>
            <Image
              source={require('../Assets/Images/back.png')}
              style={styles.headerIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết bài viết</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('TabNavigation')}>
            <Image
              source={require('../Assets/Images/home48.png')}
              style={styles.headerIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>
        {/* Featured Image */}
        <Animated.View
          style={[
            styles.imageContainer,
            {
              opacity: imageAnim,
              transform: [
                {
                  scale: imageAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}>
          <SharedElement id={`blog.${slug}.image`}>
            <Image
              source={{
                uri:
                  selectedBlog.coverImage ||
                  'https://via.placeholder.com/800x600/EDEFF1/333333?text=Wedding+Blog',
              }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
          </SharedElement>

          {/* Action buttons */}
          <View style={styles.actionButtonsContainer}>
            <IconButton
              icon="arrow-back"
              size={22}
              color="#333"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            />
            <IconButton
              icon="share"
              size={22}
              color="#333"
              onPress={handleShare}
              style={styles.shareButton}
            />
          </View>
        </Animated.View>

        {/* Blog Content Container */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          {/* Title */}
          <Animated.Text style={[styles.title, {opacity: titleAnim}]}>
            {selectedBlog.title}
          </Animated.Text>

          {/* Meta Information */}
          <Animated.View style={[styles.metaContainer, {opacity: metaAnim}]}>
            <View style={styles.metaItem}>
              <Image
                source={require('../Assets/Images/calendar.png')}
                style={styles.metaIcon}
              />
              <Text style={styles.metaText}>
                {formatDate(selectedBlog.created_at)}
              </Text>
            </View>

            {selectedBlog.author && (
              <View style={styles.metaItem}>
                <Image
                  source={require('../Assets/Images/user.png')}
                  style={styles.metaIcon}
                />
                <Text style={styles.metaText}>
                  {typeof selectedBlog.author === 'object'
                    ? selectedBlog.author.name || 'Không rõ tác giả'
                    : selectedBlog.author.toString()}
                </Text>
              </View>
            )}

            {selectedBlog.viewCount !== undefined && (
              <View style={styles.metaItem}>
                <Image
                  source={require('../Assets/Images/eye.png')}
                  style={styles.metaIcon}
                />
                <Text style={styles.metaText}>
                  {selectedBlog.viewCount} lượt xem
                </Text>
              </View>
            )}

            {selectedBlog.category && (
              <View style={styles.metaItem}>
                <Image
                  source={require('../Assets/Images/addfolder.png')}
                  style={styles.metaIcon}
                />
                <Text style={styles.metaText}>{selectedBlog.category}</Text>
              </View>
            )}
          </Animated.View>

          {/* Blog Content */}
          <Animated.View style={[styles.bodyContainer, {opacity: contentAnim}]}>
            <Text style={styles.bodyText}>{selectedBlog.content}</Text>
          </Animated.View>

          {/* Related Blogs Section */}
          <Animated.View
            style={[styles.relatedContainer, {opacity: relatedAnim}]}>
            <Text style={styles.relatedTitle}>Bài viết liên quan</Text>

            {relatedStatus === 'loading' ? (
              <ActivityIndicator
                size="small"
                color="#FF6B6B"
                style={styles.relatedLoading}
              />
            ) : relatedBlogs && relatedBlogs.length > 0 ? (
              <View style={styles.relatedBlogsContainer}>
                {relatedBlogs.map(blog => {
                  // Check for valid blog data
                  if (!blog || typeof blog !== 'object') return null;

                  // Ensure properties are valid
                  const blogId = blog.id || blog._id || '';
                  const blogSlug = blog.slug ? blog.slug.toString() : '';
                  const blogTitle = blog.title
                    ? blog.title.toString()
                    : 'Bài viết không tiêu đề';
                  const blogImage =
                    blog.coverImage ||
                    'https://via.placeholder.com/300x200/EDEFF1/333333?text=Blog';

                  return (
                    <TouchableOpacity
                      key={blogId}
                      style={styles.relatedBlogItem}
                      onPress={() => navigateToRelatedBlog(blogSlug)}
                      activeOpacity={0.7}>
                      <Image
                        source={{uri: blogImage}}
                        style={styles.relatedBlogImage}
                        resizeMode="cover"
                      />
                      <View style={styles.relatedBlogContent}>
                        <Text style={styles.relatedBlogTitle} numberOfLines={2}>
                          {blogTitle}
                        </Text>
                        <Text style={styles.relatedBlogDate}>
                          {formatDate(blog.created_at)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.noRelatedText}>
                Không có bài viết liên quan
              </Text>
            )}
          </Animated.View>
        </Animated.View>
      </ScrollView>
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
    shadowOffset: {width: 0, height: 1},
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: width * 0.7,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E1E4E8',
  },
  actionButtonsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  shareButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 40,
    minHeight: height * 0.6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    lineHeight: 32,
    fontFamily: 'Playfair_me'
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  metaIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
    opacity: 0.7,
  },
  metaText: {
    fontSize: 13,
    color: '#777',
  },
  bodyContainer: {
    marginBottom: 30,
  },
  bodyText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 26,
    textAlign: 'justify',
    fontFamily: 'Playfair_me'
  },
  relatedContainer: {
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'Playfair_me'
  },
  relatedLoading: {
    marginVertical: 20,
  },
  relatedBlogsContainer: {
    marginBottom: 10,
  },
  relatedBlogItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  relatedBlogImage: {
    width: 100,
    height: 100,
    backgroundColor: '#E1E4E8',
  },
  relatedBlogContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  relatedBlogTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
    fontFamily: 'Playfair_me'
  },
  relatedBlogDate: {
    fontSize: 12,
    color: '#777',
    fontFamily: 'Playfair_me',
  },
  noRelatedText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
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
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    fontFamily: 'Playfair_me',
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
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
  noDataText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Playfair_me',
  },
});

export default BlogDetail;
