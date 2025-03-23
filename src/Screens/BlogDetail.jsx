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
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  fetchBlogDetail,
  clearSelectedBlog,
  fetchBlogRelated,
} from '../redux/BlogSlice';
import {useNavigation} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import 'moment/locale/vi';
import {SharedElement} from 'react-navigation-shared-element';
import {SafeAreaView} from 'react-native-safe-area-context';

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

  // Estimate reading time - roughly 200 words per minute
  const calculateReadingTime = content => {
    if (!content) return '1 phút đọc';
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} phút đọc`;
  };

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
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}>
        {/* Featured Image with Overlay */}
        <View style={styles.heroSection}>
          <SharedElement id={`blog.${slug}.image`}>
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
              <Image
                source={{
                  uri:
                    selectedBlog.coverImage ||
                    'https://via.placeholder.com/800x600/EDEFF1/333333?text=Wedding+Blog',
                }}
                style={styles.featuredImage}
                resizeMode="cover"
              />
              <View style={styles.imageDarkOverlay} />
              {/* Gradient overlay replacement using multiple Views with opacity */}
              <View style={styles.gradientOverlayTop} />
              <View style={styles.gradientOverlayBottom} />
            </Animated.View>
          </SharedElement>

          {/* Category Badge */}
          {selectedBlog.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{selectedBlog.category}</Text>
            </View>
          )}

          {/* Back and Home Buttons */}
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.goBack()}>
              <AntDesign name="arrowleft" size={22} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('TabNavigation')}>
              <AntDesign name="home" size={22} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Title on Image */}
          <Animated.View
            style={[
              styles.titleOnImage,
              {
                opacity: titleAnim,
                transform: [
                  {
                    translateY: titleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}>
            <Text style={styles.heroTitle}>{selectedBlog.title}</Text>
            <View style={styles.heroMeta}>
              <View style={styles.heroMetaItem}>
                <AntDesign name="clockcircleo" size={14} color="#FFF" />
                <Text style={styles.heroMetaText}>
                  {calculateReadingTime(selectedBlog.content)}
                </Text>
              </View>
              <View style={styles.heroMetaItem}>
                <AntDesign name="calendar" size={14} color="#FFF" />
                <Text style={styles.heroMetaText}>
                  {formatDate(selectedBlog.created_at)}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Main Content Section */}
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          {/* Author Section */}
          <Animated.View style={[styles.authorSection, {opacity: metaAnim}]}>
            <View style={styles.authorImageContainer}>
              <Image
                source={{
                  uri:
                    (selectedBlog.author &&
                      typeof selectedBlog.author === 'object' &&
                      selectedBlog.author.avatar) ||
                    'https://via.placeholder.com/60x60/EDEFF1/333333?text=A',
                }}
                style={styles.authorImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>
                {typeof selectedBlog.author === 'object'
                  ? selectedBlog.author.name || 'Không rõ tác giả'
                  : selectedBlog.author?.toString() || 'Không rõ tác giả'}
              </Text>
              <Text style={styles.authorRole}>
                {typeof selectedBlog.author === 'object' && selectedBlog.author.role
                  ? selectedBlog.author.role
                  : 'Chuyên gia đám cưới'}
              </Text>
            </View>
            <View style={styles.articleStats}>
              {selectedBlog.views !== undefined && (
                <View style={styles.statsItem}>
                  <AntDesign name="eyeo" size={16} color="#666" />
                  <Text style={styles.statsText}>{selectedBlog.views}</Text>
                </View>
              )}
              <View style={styles.statsItem}>
                <AntDesign name="hearto" size={16} color="#666" />
                <Text style={styles.statsText}>
                  {selectedBlog.likes || '0'}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Article Content */}
          <Animated.View style={[styles.articleContent, {opacity: contentAnim}]}>
            {selectedBlog.content && selectedBlog.content.length > 0 ? (
              <View>
                {/* Introduction/Subtitle */}
                <Text style={styles.introText}>
                  {selectedBlog.excerpt ||
                    'Khám phá những ý tưởng tuyệt vời về đám cưới trong bài viết này.'}
                </Text>

                {/* Main Content - Split into paragraphs */}
                <View style={styles.mainContent}>
                  {selectedBlog.content
                    .split('\n\n')
                    .map((paragraph, index) => {
                      if (!paragraph.trim()) return null;
                      
                      // Check if paragraph is a heading (starts with # character)
                      if (paragraph.trim().startsWith('#')) {
                        return (
                          <Text key={index} style={styles.subheading}>
                            {paragraph.replace(/^#+\s+/, '')}
                          </Text>
                        );
                      }
                      
                      return (
                        <Text key={index} style={styles.paragraph}>
                          {paragraph}
                        </Text>
                      );
                    })}
                </View>
              </View>
            ) : (
              <Text style={styles.noContentText}>
                Không có nội dung bài viết
              </Text>
            )}
          </Animated.View>

          {/* Social Sharing Section */}
          <View style={styles.socialSection}>
            <Text style={styles.socialLabel}>Chia sẻ bài viết:</Text>
            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={[styles.socialButton, {backgroundColor: '#3b5998'}]}>
                <AntDesign name="facebook-square" size={18} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.socialButton, {backgroundColor: '#1DA1F2'}]}>
                <AntDesign name="twitter" size={18} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.socialButton, {backgroundColor: '#E60023'}]}>
                <AntDesign name="link" size={18} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.socialButton, {backgroundColor: '#25D366'}]}>
                <AntDesign name="message1" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Related Blogs Section */}
          <Animated.View
            style={[styles.relatedSection, {opacity: relatedAnim}]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Bài viết liên quan</Text>
              {relatedBlogs && relatedBlogs.length > 3 && (
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>Xem tất cả</Text>
                </TouchableOpacity>
              )}
            </View>

            {relatedStatus === 'loading' ? (
              <ActivityIndicator
                size="small"
                color="#FF6B6B"
                style={styles.relatedLoading}
              />
            ) : relatedBlogs && relatedBlogs.length > 0 ? (
              <View style={styles.relatedList}>
                {relatedBlogs.slice(0, 3).map(blog => {
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
                      style={styles.relatedItem}
                      onPress={() => navigateToRelatedBlog(blogSlug)}
                      activeOpacity={0.8}>
                      <Image
                        source={{uri: blogImage}}
                        style={styles.relatedImage}
                        resizeMode="cover"
                      />
                      <View style={styles.relatedImageOverlay} />
                      <View style={styles.relatedContent}>
                        <Text style={styles.relatedTitle} numberOfLines={2}>
                          {blogTitle}
                        </Text>
                        <Text style={styles.relatedDate}>
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
    backgroundColor: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 0,
  },
  heroSection: {
    height: height * 0.6,
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  imageDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  gradientOverlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'transparent',
    opacity: 0,
  },
  gradientOverlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    opacity: 0.8,
  },
  categoryBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 45,
    right: 16,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  categoryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Playfair_me',
  },
  headerButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 16,
    flexDirection: 'row',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  titleOnImage: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 5,
    fontFamily: 'Playfair_me',
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  heroMetaText: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 5,
    fontFamily: 'Playfair_me',
  },
  contentContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  authorImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#FFE0E0',
  },
  authorImage: {
    width: '100%',
    height: '100%',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
    fontFamily: 'Playfair_me',
  },
  authorRole: {
    fontSize: 13,
    color: '#888',
    fontFamily: 'Playfair_me',
  },
  articleStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statsText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'Playfair_me',
  },
  articleContent: {
    marginBottom: 30,
  },
  introText: {
    fontSize: 17,
    color: '#555',
    lineHeight: 26,
    marginBottom: 20,
    fontStyle: 'italic',
    fontFamily: 'Playfair_me',
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
    paddingLeft: 12,
  },
  mainContent: {
    marginBottom: 20,
  },
  subheading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
    fontFamily: 'Playfair_me',
  },
  paragraph: {
    fontSize: 16,
    color: '#333',
    lineHeight: 26,
    marginBottom: 16,
    textAlign: 'justify',
    fontFamily: 'Playfair_me',
  },
  noContentText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
    fontFamily: 'Playfair_me',
  },
  socialSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingTop: 10,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  socialLabel: {
    fontSize: 15,
    color: '#555',
    fontFamily: 'Playfair_me',
  },
  socialButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF6B6B',
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  relatedSection: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Playfair_me',
  },
  viewAllText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontFamily: 'Playfair_me',
  },
  relatedLoading: {
    marginVertical: 20,
  },
  relatedList: {
    flex: 1,
  },
  relatedItem: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  relatedImage: {
    width: '100%',
    height: '100%',
  },
  relatedImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  relatedContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 6,
    fontFamily: 'Playfair_me',
  },
  relatedDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
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
    backgroundColor: '#FFF',
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
    backgroundColor: '#FFF',
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
