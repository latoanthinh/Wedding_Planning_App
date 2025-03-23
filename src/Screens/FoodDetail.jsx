import React, { useRef, useEffect, useState, useContext } from 'react'; // Thêm useState và useContext
import { 
  StyleSheet, 
  View, 
  Text, 
  Animated,
  Image, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  ActivityIndicator,
  ToastAndroid // Thêm ToastAndroid
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { ChitietCatering, resetChitietCatering } from '../redux/ChitietCateringSlice';
import { addFavoriteItem, removeFavoriteItem, fetchUserFavorites } from '../redux/FavoriteDeanAddSlice'; // Thêm actions
import { AppContext } from '../AppContext'; // Thêm AppContext

const FoodDetailScreen = (props) => {
  const { navigation, route } = props;
  const { Id, item } = route?.params || {};
  const dispatch = useDispatch();
  const { ChitietCateringData, ChitietCateringStatus, error } = useSelector(state => state.chitietcatering);
  const { data: favorites = [], status: favoritesStatus } = useSelector(state => state.favoriteset); // Lấy danh sách yêu thích
  const { user } = useContext(AppContext); // Lấy thông tin user
  const userId = user?._id;

  const nameAnim = useRef(new Animated.Value(0)).current;
  const descAnim = useRef(new Animated.Value(0)).current;
  const priceAnim = useRef(new Animated.Value(0)).current;
  const carbWidth = useRef(new Animated.Value(0)).current;
  const proteinWidth = useRef(new Animated.Value(0)).current;
  const fatWidth = useRef(new Animated.Value(0)).current;

  const [isFavorite, setIsFavorite] = useState(false); // Trạng thái yêu thích
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false); // Trạng thái đang xử lý

  // Tải danh sách yêu thích và dữ liệu chi tiết
  useEffect(() => {
    if (userId && Id) {
      dispatch(fetchUserFavorites(userId)); // Tải danh sách yêu thích
    }
    if (!item && Id) {
      dispatch(ChitietCatering(Id));
    }
    return () => {
      dispatch(resetChitietCatering());
    };
  }, [dispatch, Id, item, userId]);

  // Cập nhật trạng thái yêu thích
  useEffect(() => {
    if (favorites && Id) {
      const isFav = favorites.some((fav) => fav.itemId === Id && fav.type === 'catering');
      setIsFavorite(isFav);
    }
  }, [favorites, Id]);

  // Animation khi dữ liệu sẵn sàng
  useEffect(() => {
    if ((ChitietCateringStatus === 'succeeded' && ChitietCateringData) || item) {
      Animated.stagger(300, [
        Animated.timing(nameAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
        Animated.timing(descAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
        Animated.timing(priceAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
      ]).start();
      Animated.parallel([
        Animated.timing(carbWidth, { toValue: 40, duration: 800, useNativeDriver: false }),
        Animated.timing(proteinWidth, { toValue: 35, duration: 800, useNativeDriver: false }),
        Animated.timing(fatWidth, { toValue: 25, duration: 800, useNativeDriver: false }),
      ]).start();
    }
  }, [ChitietCateringStatus, ChitietCateringData, item]);

  // Hàm xử lý bật/tắt yêu thích
  const handleToggleFavorite = () => {
    if (!Id || !user || !user._id) {
      ToastAndroid.show('Vui lòng đăng nhập để sử dụng tính năng này', ToastAndroid.SHORT);
      navigation.navigate('LoginScreen');
      return;
    }

    setIsFavoriteLoading(true);
    if (isFavorite) {
      dispatch(removeFavoriteItem({ userId: user._id, type: 'catering', itemId: Id }))
        .unwrap()
        .then(() => {
          setIsFavorite(false);
          ToastAndroid.show('Đã xóa khỏi danh sách yêu thích', ToastAndroid.SHORT);
        })
        .catch((err) => {
          ToastAndroid.show('Không thể xóa: ' + (err.message || 'Lỗi'), ToastAndroid.SHORT);
        })
        .finally(() => setIsFavoriteLoading(false));
    } else {
      dispatch(addFavoriteItem({ userId: user._id, type: 'catering', itemId: Id }))
        .unwrap()
        .then(() => {
          setIsFavorite(true);
          ToastAndroid.show('Đã thêm vào danh sách yêu thích', ToastAndroid.SHORT);
        })
        .catch((err) => {
          ToastAndroid.show('Không thể thêm: ' + (err.message || 'Lỗi'), ToastAndroid.SHORT);
        })
        .finally(() => setIsFavoriteLoading(false));
    }
  };

  if (!item && ChitietCateringStatus === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (!Id || (!item && ChitietCateringStatus === 'failed')) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error || 'Không thể tải chi tiết hoặc ID không hợp lệ'}</Text>
      </SafeAreaView>
    );
  }

  const displayData = item || ChitietCateringData;
  if (!displayData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Không có dữ liệu chi tiết</Text>
      </SafeAreaView>
    );
  }

  const formattedPrice = displayData.price
    ? displayData.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    : '0 VNĐ';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: displayData.image || displayData.imageUrl || 'https://via.placeholder.com/300' }} 
          style={styles.foodImage} 
          resizeMode="cover" 
        />
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.favoriteButton} 
            onPress={handleToggleFavorite} // Thêm sự kiện nhấn
            disabled={isFavoriteLoading} // Vô hiệu hóa khi đang xử lý
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
      <View style={styles.contentCard}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.titleContainer}>
            <Animated.Text style={[styles.foodName, { opacity: nameAnim, transform: [{ translateY: nameAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
              {displayData.name || 'Không có tên'}
            </Animated.Text>
            <View style={styles.ratingTag}>
              <Icon name="star" size={16} color="#DCA34B" />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>
          <View style={styles.tagsContainer}>
            <View style={styles.tagItem}><Text style={styles.tagText}>Đồ ngọt</Text></View>
            <View style={styles.tagItem}><Text style={styles.tagText}>Tráng miệng</Text></View>
            <View style={styles.tagItem}><Text style={styles.tagText}>Hấp dẫn</Text></View>
          </View>
          <Animated.Text style={[styles.description, { opacity: descAnim, transform: [{ translateY: descAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
            {displayData.description || 'Không có mô tả'}
          </Animated.Text>
          <Animated.View style={[styles.priceContainer, { opacity: priceAnim, transform: [{ translateY: priceAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
            <Text style={styles.priceText}>{formattedPrice}/phần</Text>
          </Animated.View>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Thành phần dinh dưỡng</Text>
          <View style={styles.nutritionContainer}>
            <View style={styles.nutritionChart}>
              <View style={styles.chartPlaceholder}>
                <Animated.View style={[styles.chartSegment, { backgroundColor: '#DCA34B', width: carbWidth }]} />
                <Animated.View style={[styles.chartSegment, { backgroundColor: '#76A878', width: proteinWidth }]} />
                <Animated.View style={[styles.chartSegment, { backgroundColor: '#7D93B0', width: fatWidth }]} />
              </View>
            </View>
            <View style={styles.nutritionDetails}>
              <View style={styles.nutritionItem}><View style={[styles.nutritionDot, { backgroundColor: '#DCA34B' }]} /><Text style={styles.nutritionText}>Carb: 48g</Text></View>
              <View style={styles.nutritionItem}><View style={[styles.nutritionDot, { backgroundColor: '#76A878' }]} /><Text style={styles.nutritionText}>Protein: 42g</Text></View>
              <View style={styles.nutritionItem}><View style={[styles.nutritionDot, { backgroundColor: '#7D93B0' }]} /><Text style={styles.nutritionText}>Chất béo: 25g</Text></View>
              <Text style={styles.caloriesText}>Calo: 580</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Nguyên liệu</Text>
          <View style={styles.ingredientsContainer}>
            <Text style={styles.ingredients}>Nguyên liệu chủ yếu: bột, trứng, đường, bơ...</Text>
          </View>
          <View style={styles.allergyContainer}>
            <Icon name="alert-circle-outline" size={20} color="#A67C52" />
            <Text style={styles.allergyText}>Có thể chứa: gluten, trứng</Text>
          </View>
        </ScrollView>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Thêm vào thực đơn</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Styles giữ nguyên
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF8F3',
  },
  imageContainer: {
    height: 260,
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  headerButtons: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    height: 45,
    width: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  favoriteButton: {
    height: 45,
    width: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  foodName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A1A1A',
    width: '70%',
    fontFamily: 'serif',
  },
  ratingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF6E5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0D9B6',
  },
  ratingText: {
    marginLeft: 6,
    fontWeight: '600',
    color: '#A67C52',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555555',
    marginBottom: 18,
    fontFamily: 'serif',
  },
  priceContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#220000',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#B78D51',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 18,
  },
  priceText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'serif',
    letterSpacing: 1,
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
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tagItem: {
    backgroundColor: '#F7E9D7',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 10,
  },
  tagText: {
    fontSize: 12,
    color: '#A67C52',
    fontFamily: 'serif',
  },
  nutritionContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  nutritionChart: {
    width: 100,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholder: {
    width: '100%',
    height: 20,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  chartSegment: {
    height: '100%',
  },
  nutritionDetails: {
    flex: 1,
    marginLeft: 20,
    justifyContent: 'center',
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutritionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  nutritionText: {
    fontSize: 15,
    color: '#444444',
  },
  caloriesText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444444',
    marginTop: 8,
  },
  ingredientsContainer: {
    marginBottom: 20,
  },
  ingredients: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555555',
    fontFamily: 'serif',
  },
  allergyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E8',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },
  allergyText: {
    fontSize: 15,
    color: '#A67C52',
    marginLeft: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 25,
    left: 25,
    right: 25,
    height: 60,
    backgroundColor: '#220000',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B78D51',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'serif',
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default FoodDetailScreen;