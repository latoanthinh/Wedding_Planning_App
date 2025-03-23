import React, { useRef, useEffect } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { ChitietCatering, resetChitietCatering } from '../redux/ChitietCateringSlice';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

const FoodDetailScreen = (props) => {
  const { navigation, route } = props;
  const { Id } = route?.params || {}; // Đảm bảo Id không undefined
  const dispatch = useDispatch();
  const { ChitietCateringData, ChitietCateringStatus, error } = useSelector(state => state.chitietcatering);

  useEffect(() => {
    if (Id) {
      // console.log('Fetching detail for Id:', Id); 
      dispatch(ChitietCatering(Id));
    } else {
      console.error('Id không được cung cấp:', route?.params);
    }

    // Cleanup: Reset trạng thái khi rời màn hình
    return () => {
      // console.log('Cleaning up and resetting state for Id:', Id);
      dispatch(resetChitietCatering());
    };
  }, [dispatch, Id]);

  // Animated values cho phần tên, mô tả và giá
  const nameAnim = useRef(new Animated.Value(0)).current;
  const descAnim = useRef(new Animated.Value(0)).current;
  const priceAnim = useRef(new Animated.Value(0)).current;

  // Animated values cho thanh tiến trình của các thành phần dinh dưỡng
  const carbWidth = useRef(new Animated.Value(0)).current;
  const proteinWidth = useRef(new Animated.Value(0)).current;
  const fatWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(300, [
      Animated.timing(nameAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(descAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.timing(priceAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(carbWidth, {
        toValue: 40, 
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(proteinWidth, {
        toValue: 35, 
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(fatWidth, {
        toValue: 25, 
        duration: 800,
        useNativeDriver: false,
      }),
    ]).start();
  }, [nameAnim, descAnim, priceAnim, carbWidth, proteinWidth, fatWidth]);

  // Xử lý hiển thị dựa trên trạng thái
  if (ChitietCateringStatus === 'loading') {
    console.log('Loading state...'); // Debug log
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (ChitietCateringStatus === 'failed' || !Id) {
    console.log('Failed state or invalid Id:', { error, Id }); // Debug log
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>
          {error || 'Không thể tải chi tiết hoặc ID không hợp lệ'}
        </Text>
      </SafeAreaView>
    );
  }

  if (ChitietCateringStatus === 'succeeded') {
    console.log('Succeeded state, Data:', ChitietCateringData); // Debug log
    const formattedPrice = ChitietCateringData?.price?.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }) || '0 VNĐ'; // Xử lý trường hợp price là null hoặc undefined

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Header with Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: ChitietCateringData?.imageUrl || 'https://via.placeholder.com/300' }} 
            style={styles.foodImage} 
            resizeMode="cover" 
          />
          
          {/* Navigation buttons */}
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="chevron-left" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.favoriteButton}>
              <Icon name="heart-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Content Card */}
        <View style={styles.contentCard}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* Title and Rating */}
            <View style={styles.titleContainer}>
              <Animated.Text 
                style={[
                  styles.foodName, 
                  {
                    opacity: nameAnim,
                    transform: [{
                      translateY: nameAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 0]
                      })
                    }]
                  }
                ]}
              >
                {ChitietCateringData?.name || 'Không có tên'}
              </Animated.Text>
              <View style={styles.ratingTag}>
                <Icon name="star" size={16} color="#DCA34B" />
                <Text style={styles.ratingText}>4.8</Text>
              </View>
            </View>
            
            {/* Tags */}
            <View style={styles.tagsContainer}>
              <View style={styles.tagItem}>
                <Text style={styles.tagText}>Đồ ngọt</Text>
              </View>
              <View style={styles.tagItem}>
                <Text style={styles.tagText}>Tráng miệng</Text>
              </View>
              <View style={styles.tagItem}>
                <Text style={styles.tagText}>Hấp dẫn</Text>
              </View>
            </View>
            
            {/* Description */}
            <Animated.Text 
              style={[
                styles.description, 
                {
                  opacity: descAnim,
                  transform: [{
                    translateY: descAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0]
                    })
                  }]
                }
              ]}
            >
              {ChitietCateringData?.description || 'Không có mô tả'}
            </Animated.Text>
            
            {/* Price Section */}
            <Animated.View 
              style={[
                styles.priceContainer,
                {
                  opacity: priceAnim,
                  transform: [{
                    translateY: priceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [10, 0]
                    })
                  }]
                }
              ]}
            >
              <Text style={styles.priceText}>{formattedPrice}/phần</Text>
            </Animated.View>
            
            {/* Divider */}
            <View style={styles.divider} />
            
            {/* Nutrition Section */}
            <Text style={styles.sectionTitle}>Thành phần dinh dưỡng</Text>
            
            <View style={styles.nutritionContainer}>
              {/* Chart Area */}
              <View style={styles.nutritionChart}>
                <View style={styles.chartPlaceholder}>
                  <Animated.View 
                    style={[styles.chartSegment, { backgroundColor: '#DCA34B', width: carbWidth }]} 
                  />
                  <Animated.View 
                    style={[styles.chartSegment, { backgroundColor: '#76A878', width: proteinWidth }]} 
                  />
                  <Animated.View 
                    style={[styles.chartSegment, { backgroundColor: '#7D93B0', width: fatWidth }]} 
                  />
                </View>
              </View>
              
              {/* Nutrition Details */}
              <View style={styles.nutritionDetails}>
                <View style={styles.nutritionItem}>
                  <View style={[styles.nutritionDot, { backgroundColor: '#DCA34B' }]} />
                  <Text style={styles.nutritionText}>Carb: 48g</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <View style={[styles.nutritionDot, { backgroundColor: '#76A878' }]} />
                  <Text style={styles.nutritionText}>Protein: 42g</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <View style={[styles.nutritionDot, { backgroundColor: '#7D93B0' }]} />
                  <Text style={styles.nutritionText}>Chất béo: 25g</Text>
                </View>
                <Text style={styles.caloriesText}>Calo: 580</Text>
              </View>
            </View>
            
            {/* Divider */}
            <View style={styles.divider} />
            
            {/* Ingredients Section */}
            <Text style={styles.sectionTitle}>Nguyên liệu</Text>
            <View style={styles.ingredientsContainer}>
              <Text style={styles.ingredients}>
                Nguyên liệu chủ yếu: bột, trứng, đường, bơ...
              </Text>
            </View>
            
            {/* Allergy Info */}
            <View style={styles.allergyContainer}>
              <Icon name="alert-circle-outline" size={20} color="#A67C52" />
              <Text style={styles.allergyText}>Có thể chứa: gluten, trứng</Text>
            </View>
          </ScrollView>
          
          {/* Bottom Button */}
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Thêm vào thực đơn</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.errorText}>Đang tải dữ liệu...</Text>
    </SafeAreaView>
  ); // Fallback khi chưa có trạng thái hợp lệ
};

export default FoodDetailScreen;

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
    top: 20, // Thêm lại top để định vị chính xác
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
    fontFamily: 'Playfair_me',
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
    fontFamily: 'Playfair_me',
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
    fontFamily: 'Playfair_me',
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
    fontFamily: 'Playfair_me',
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
    fontFamily: 'Playfair_me',
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
    fontFamily: 'Playfair_me',
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
    fontFamily: 'Playfair_me',
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 20,
  },
});