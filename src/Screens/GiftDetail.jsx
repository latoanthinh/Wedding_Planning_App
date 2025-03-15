import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Animated, Image, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { ChitietGift, resetChitietGift } from '../redux/ChitietGiftSlice';

const GiftDetail = (props) => {
  const { navigation, route } = props;
  const { GitflId } = route?.params || {};
  const dispatch = useDispatch();
  const { ChitietGiftData, ChitietGiftStatus, error } = useSelector(state => state.chitietgift);

  // Animation references
  const nameAnim = useRef(new Animated.Value(0)).current;
  const descAnim = useRef(new Animated.Value(0)).current;
  const priceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (GitflId) {
      console.log('Fetching detail for Id:', GitflId);
      dispatch(ChitietGift(GitflId));
    } else {
      console.error('No GitflId provided:', route?.params);
    }
    return () => {
      console.log('Resetting state for Id:', GitflId);
      dispatch(resetChitietGift());
    };
  }, [dispatch, GitflId]);

  useEffect(() => {
    if (ChitietGiftStatus === 'succeeded' && ChitietGiftData) {
      Animated.stagger(300, [
        Animated.timing(nameAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(descAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(priceAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();
    }
  }, [ChitietGiftStatus, ChitietGiftData]);

  // For debugging - log the data to see what's available
  console.log("Gift Data received:", JSON.stringify(ChitietGiftData, null, 2));

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
        <ActivityIndicator size="large" color="#0000ff" />
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
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: ChitietGiftData?.imageUrl || 'https://via.placeholder.com/300' }} 
            style={styles.giftImage} 
            resizeMode="cover" 
          />
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="chevron-left" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.favoriteButton}>
              <Icon name="heart-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.contentCard}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Tên sản phẩm */}
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
                <Icon name="star" size={16} color="#DCA34B" />
                <Text style={styles.ratingText}>4.8</Text>
              </View>
            </View>

            {/* Tags */}
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
            
            {/* Mô tả */}
            <Animated.Text 
              style={[
                styles.description, 
                { 
                  opacity: descAnim,
                  transform: [{ translateY: descAnim.interpolate({ 
                    inputRange: [0, 1], 
                    outputRange: [20, 0] 
                  }) }] 
                }
              ]}
            >
              {ChitietGiftData?.Description || 'Không có mô tả'}
            </Animated.Text>
            
            {/* Giá */}
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
              <Text style={styles.priceText}>{formattedPrice}</Text>
            </Animated.View>
            
            <View style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Icon name="tag-outline" size={20} color="#A67C52" />
                <Text style={styles.infoText}>Loại: {ChitietGiftData?.Cate_presentId?.name || 'Đồ lưu niệm'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="package-variant-closed" size={20} color="#A67C52" />
                <Text style={styles.infoText}>Bộ sản phẩm: {ChitietGiftData?.name?.includes('set') ? ChitietGiftData.name : 'Sản phẩm đơn lẻ'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="calendar-range" size={20} color="#A67C52" />
                <Text style={styles.infoText}>Ngày cập nhật: {new Date(ChitietGiftData?.updatedAt).toLocaleDateString('vi-VN')}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsText}>
                {ChitietGiftData?.Description || 'Không có mô tả chi tiết cho sản phẩm này.'}
              </Text>
              <Text style={styles.detailsText}>
                Sản phẩm được làm từ chất liệu cao cấp, thiết kế tinh tế và sang trọng, phù hợp với không khí lễ cưới.
              </Text>
            </View>
            
            <View style={styles.noteContainer}>
              <Icon name="information-outline" size={20} color="#A67C52" />
              <Text style={styles.noteText}>Có thể tùy chỉnh theo yêu cầu của khách hàng</Text>
            </View>
          </ScrollView>
          
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Thêm vào giỏ hàng</Text>
          </TouchableOpacity>
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

export default GiftDetail;

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
  giftImage: {
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
    zIndex: 10,
  },
  backButton: {
    height: 45,
    width: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(0,0,0,0.3)',
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
    backgroundColor: 'rgba(0,0,0,0.3)',
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
    marginTop: 10,
  },
  giftName: {
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
    fontSize: 16,
    lineHeight: 24,
    color: '#555555',
    marginTop: 10,
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
    marginBottom: 15,
    marginTop: 5,
  },
  tagItem: {
    backgroundColor: '#F7E9D7',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 10,
  },
  tagText: {
    fontSize: 13,
    color: '#A67C52',
    fontFamily: 'serif',
    fontWeight: '500',
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#444444',
    marginLeft: 10,
    fontFamily: 'serif',
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailsText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555555',
    marginBottom: 10,
    fontFamily: 'serif',
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
