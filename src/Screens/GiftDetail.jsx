import React, { useRef, useEffect, useState, useContext } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Animated, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  Dimensions,
  ActivityIndicator,
  ToastAndroid 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { ChitietGift, resetChitietGift } from '../redux/ChitietGiftSlice';
import { addFavoriteItem, removeFavoriteItem, fetchUserFavorites } from '../redux/FavoriteDeanAddSlice'; // Thêm removeFavoriteItem và fetchUserFavorites
import { AppContext } from '../AppContext';

const { width } = Dimensions.get('window');

const GiftDetail = (props) => {
  const { navigation, route } = props;
  const { GitflId } = route?.params || {};
  const dispatch = useDispatch();
  const { ChitietGiftData, ChitietGiftStatus, error } = useSelector(state => state.chitietgift);
  const { data: favorites = [], status: favoritesStatus } = useSelector(state => state.favoriteset); // Lấy danh sách yêu thích
  const { user } = useContext(AppContext);
  const userId = user?._id;

  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Animation references
  const nameAnim = useRef(new Animated.Value(0)).current;
  const descAnim = useRef(new Animated.Value(0)).current;
  const priceAnim = useRef(new Animated.Value(0)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;

  // Fetch danh sách yêu thích khi component mount
  useEffect(() => {
    if (userId && GitflId) {
      dispatch(fetchUserFavorites(userId));
    }
  }, [dispatch, userId, GitflId]);

  // Kiểm tra trạng thái yêu thích của item
  useEffect(() => {
    if (favorites && GitflId) {
      const isFav = favorites.some((fav) => fav.itemId === GitflId);
      setIsFavorite(isFav);
    }
  }, [favorites, GitflId]);

  useEffect(() => {
    if (GitflId) {
     
      dispatch(ChitietGift(GitflId));
    } else {
      
    }
    return () => {
      
      dispatch(resetChitietGift());
    };
  }, [dispatch, GitflId]);

  useEffect(() => {
    if (ChitietGiftStatus === 'succeeded' && ChitietGiftData) {
      Animated.stagger(300, [
        Animated.timing(imageAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(nameAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(descAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(priceAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
    }
  }, [ChitietGiftStatus, ChitietGiftData]);

  // Hàm xử lý thêm/xóa yêu thích
  const handleToggleFavorite = () => {
    if (!GitflId) {
      ToastAndroid.show('Không thể thực hiện, thiếu ID sản phẩm', ToastAndroid.SHORT);
      return;
    }

    if (!user || !user._id) {
      ToastAndroid.show('Vui lòng đăng nhập để sử dụng tính năng này', ToastAndroid.SHORT);
      navigation.navigate('LoginScreen');
      return;
    }

    setIsFavoriteLoading(true);

    if (isFavorite) {
      // Xóa khỏi danh sách yêu thích
      dispatch(removeFavoriteItem({
        userId: user._id,
        type: 'present',
        itemId: GitflId
      }))
        .unwrap()
        .then(() => {
          setIsFavorite(false);
          ToastAndroid.show('Đã xóa khỏi danh sách yêu thích', ToastAndroid.SHORT);
        })
        .catch((err) => {
          console.error('Error removing from favorites:', err);
          ToastAndroid.show('Không thể xóa khỏi yêu thích: ' + (err.message || 'Lỗi không xác định'), ToastAndroid.SHORT);
        })
        .finally(() => {
          setIsFavoriteLoading(false);
        });
    } else {
      // Thêm vào danh sách yêu thích
      dispatch(addFavoriteItem({
        userId: user._id,
        type: 'present',
        itemId: GitflId
      }))
        .unwrap()
        .then(() => {
          setIsFavorite(true);
          ToastAndroid.show('Đã thêm vào danh sách yêu thích', ToastAndroid.SHORT);
        })
        .catch((err) => {
          console.error('Error adding to favorites:', err);
          ToastAndroid.show('Không thể thêm vào yêu thích: ' + (err.message || 'Lỗi không xác định'), ToastAndroid.SHORT);
        })
        .finally(() => {
          setIsFavoriteLoading(false);
        });
    }
  };

  // For debugging - log the data to see what's available
  console.log("Gift Data received:", JSON.stringify(ChitietGiftData, null, 2));
  console.log("Favorites Data:", JSON.stringify(favorites, null, 2));

  if (!GitflId) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>ID không hợp lệ</Text>
      </SafeAreaView>
    );
  }

  if (ChitietGiftStatus === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#A67C52" />
      </SafeAreaView>
    );
  }

  if (ChitietGiftStatus === 'failed') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error || 'Không thể tải chi tiết'}</Text>
      </SafeAreaView>
    );
  }

  if (ChitietGiftStatus === 'succeeded') {
    if (!ChitietGiftData) {
      return (
        <SafeAreaView style={styles.container}>
          <Text style={styles.errorText}>Không có dữ liệu chi tiết</Text>
        </SafeAreaView>
      );
    }

    const formattedPrice = ChitietGiftData?.price
      ? ChitietGiftData.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
      : '0 VNĐ';

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Image Container with Animation */}
        <View style={styles.imageContainer}>
          <Animated.View style={{ 
            opacity: imageAnim,
            transform: [{ scale: imageAnim.interpolate({ 
              inputRange: [0, 1], 
              outputRange: [0.9, 1] 
            }) }]
          }}>
            <Image 
              source={{ uri: ChitietGiftData?.imageUrl || 'https://via.placeholder.com/300' }} 
              style={styles.giftImage} 
              resizeMode="cover" 
            />
            {/* Overlay gradient effect */}
            <View style={styles.imageOverlay} />
          </Animated.View>
          
          {/* Header Buttons */}
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="chevron-left" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.favoriteButton} 
              onPress={handleToggleFavorite}
              disabled={isFavoriteLoading}
            >
              {isFavoriteLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Icon 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorite ? "#FF6B6B" : "#fff"} 
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Product Name */}
            <View style={styles.titleContainer}>
              <Animated.Text 
                style={[
                  styles.giftName, 
                  { 
                    opacity: nameAnim,
                    transform: [{ translateY: nameAnim.interpolate({ 
                      inputRange: [0, 1], 
                      outputRange: [20, 0] 
                    }) }] 
                  }
                ]}
              >
                {ChitietGiftData?.name || 'Không có tên'}
              </Animated.Text>
              <View style={styles.ratingTag}>
                <Icon name="star" size={16} color="#A67C52" />
                <Text style={styles.ratingText}>4.8</Text>
              </View>
            </View>

            {/* Category Tags */}
            <View style={styles.tagsContainer}>
              <View style={styles.tagItem}>
                <Text style={styles.tagText}>{ChitietGiftData?.Cate_presentId?.name || 'Quà tặng'}</Text>
              </View>
              <View style={styles.tagItem}>
                <Text style={styles.tagText}>Quà cưới</Text>
              </View>
              <View style={styles.tagItem}>
                <Text style={styles.tagText}>Lưu niệm</Text>
              </View>
            </View>
            
            {/* Description */}
            <Animated.View 
              style={{ 
                opacity: descAnim,
                transform: [{ translateY: descAnim.interpolate({ 
                  inputRange: [0, 1], 
                  outputRange: [20, 0] 
                }) }] 
              }}
            >
              <Text style={styles.sectionTitle}>Mô tả</Text>
              <Text style={styles.descriptionText}>{ChitietGiftData?.Description || 'Không có mô tả'}</Text>
            </Animated.View>

            <View style={styles.divider} />

            {/* Features */}
            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>Đặc điểm</Text>
              <View style={styles.featureItem}>
                <Icon name="gift" size={20} color="#A67C52" />
                <Text style={styles.featureText}>Quà tặng cao cấp</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="palette" size={20} color="#A67C52" />
                <Text style={styles.featureText}>Thiết kế sang trọng</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="check-circle" size={20} color="#A67C52" />
                <Text style={styles.featureText}>Bao gồm dịch vụ gói quà</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="clock-outline" size={20} color="#A67C52" />
                <Text style={styles.featureText}>Thời gian chuẩn bị: 1-2 ngày</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Price */}
            <Animated.View 
              style={[
                styles.priceContainer, 
                { 
                  opacity: priceAnim,
                  transform: [{ translateY: priceAnim.interpolate({ 
                    inputRange: [0, 1], 
                    outputRange: [20, 0] 
                  }) }] 
                }
              ]}
            >
              <Text style={styles.priceLabel}>Giá:</Text>
              <Text style={styles.priceValue}>{formattedPrice}</Text>
            </Animated.View>

            {/* Note */}
            <View style={styles.noteContainer}>
              <Icon name="information-outline" size={22} color="#A67C52" />
              <Text style={styles.noteText}>Có thể tùy chỉnh theo yêu cầu của khách hàng</Text>
            </View>

            {/* Related Products Placeholder */}
            <View style={styles.relatedSection}>
              <Text style={styles.sectionTitle}>Sản phẩm liên quan</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.relatedScroll}>
                {[1, 2, 3].map((item) => (
                  <TouchableOpacity key={item} style={styles.relatedItem}>
                    <Image 
                      source={{ uri: 'https://via.placeholder.com/150x100' }} 
                      style={styles.relatedImage} 
                    />
                    <View style={styles.relatedImageOverlay} />
                    <Text style={styles.relatedName}>Quà tặng {item}</Text>
                    <Text style={styles.relatedPrice}>{(ChitietGiftData?.price * 0.8).toLocaleString('vi-VN')} đ</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          {/* Bottom Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.contactButton}>
              <Icon name="phone" size={20} color="#A67C52" />
              <Text style={styles.contactButtonText}>Liên hệ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addToCartButton}>
              <Icon name="cart-plus" size={20} color="#FFFFFF" />
              <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.errorText}>Đang tải dữ liệu...</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFAF5',
  },
  imageContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  giftImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerButtons: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  giftName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    flex: 1,
    fontFamily: 'serif',
  },
  ratingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  ratingText: {
    marginLeft: 5,
    color: '#A67C52',
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tagItem: {
    backgroundColor: '#F7E9D7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  tagText: {
    color: '#A67C52',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'serif',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1E4D8',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 14,
    fontFamily: 'serif',
  },
  descriptionText: {
    fontSize: 15,
    color: '#555555',
    lineHeight: 22,
    marginBottom: 10,
    fontFamily: 'serif',
  },
  featuresSection: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#444444',
    fontFamily: 'serif',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#220000',
    padding: 15,
    borderRadius: 15,
    marginVertical: 20,
    shadowColor: '#B78D51',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 10,
    fontFamily: 'serif',
  },
  priceValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'serif',
    letterSpacing: 1,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E8',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  noteText: {
    fontSize: 15,
    color: '#A67C52',
    marginLeft: 10,
    fontFamily: 'serif',
  },
  relatedSection: {
    marginBottom: 80,
  },
  relatedScroll: {
    marginTop: 10,
  },
  relatedItem: {
    width: 150,
    marginRight: 15,
    position: 'relative',
  },
  relatedImage: {
    width: 150,
    height: 100,
    borderRadius: 10,
  },
  relatedImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
  },
  relatedName: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 5,
    color: '#333333',
    fontFamily: 'serif',
  },
  relatedPrice: {
    fontSize: 12,
    color: '#A67C52',
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#F1E4D8',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#A67C52',
    borderRadius: 10,
    marginRight: 10,
  },
  contactButtonText: {
    marginLeft: 8,
    color: '#A67C52',
    fontWeight: '600',
    fontFamily: 'serif',
  },
  addToCartButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#220000',
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#B78D51',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  addToCartText: {
    marginLeft: 8,
    color: '#FFFFFF',
    fontWeight: '600',
    fontFamily: 'serif',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'serif',
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default GiftDetail;