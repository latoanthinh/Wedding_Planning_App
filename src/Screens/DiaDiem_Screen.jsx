import { StyleSheet, Text, View, Image, Pressable, FlatList, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Cate_decorates } from '../redux/Cate_decoratesSlice';
import { getProductsByDecorates } from '../redux/DecoratesByCateSlice';
import Lottie from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { AppContext } from '../AppContext'; // Thêm AppContext

const { width } = Dimensions.get('window');

const formatPrice = (num) => {
  return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ' : '0 VNĐ';
};

const DiaDiem_Screen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { Cate_decoratesData = [], Cate_decoratesStatus } = useSelector((state) => state.cate_decorates);
  const { products = [], status } = useSelector((state) => state.decoratesbyCate);
  const { user, isLoading: contextLoading } = useContext(AppContext); // Lấy user từ AppContext
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Kiểm tra user khi component mount hoặc user thay đổi
  useEffect(() => {
    if (!contextLoading && !user) {
      console.log('User không tồn tại, không tải dữ liệu');
      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    }
  }, [user, contextLoading, navigation]);

  // Gọi API lấy danh mục
  useEffect(() => {
    if (!user) return;

    const fetchCategories = async () => {
      try {
        await dispatch(Cate_decorates()).unwrap();
      } catch (error) {
        console.error('Lỗi khi lấy danh sách danh mục:', error);
      }
    };

    fetchCategories();

    return () => {
      setSelectedCategoryId(null);
    };
  }, [dispatch, user]);

  // Cập nhật selectedCategoryId khi danh sách danh mục thay đổi
  useEffect(() => {
    if (!user) return;

    if (Cate_decoratesStatus === 'succeeded' && Cate_decoratesData.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(Cate_decoratesData[0]._id);
    }
  }, [Cate_decoratesData, Cate_decoratesStatus, selectedCategoryId, user]);

  // Gọi API lấy sản phẩm khi selectedCategoryId thay đổi
  useEffect(() => {
    if (!user || !selectedCategoryId) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        await dispatch(getProductsByDecorates(selectedCategoryId)).unwrap();
      } catch (error) {
        console.error('Lỗi khi lấy danh sách sản phẩm:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      setLoading(false);
    };
  }, [selectedCategoryId, dispatch, user]);

  const handleSelect = (id) => {
    if (!user) return;
    if (id !== selectedCategoryId) setSelectedCategoryId(id);
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <Lottie source={require('../Assets/Animations/blackloading.json')} autoPlay loop style={styles.loadingAnimation} />
      <Text style={styles.loadingText}>Chờ xíu...</Text>
    </View>
  );

  const renderItem = useCallback(
    ({ item }) => {
      if (!user || !item || !item._id) return null;
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('DecorDetail', { decorId: item._id })}
        >
          <View style={styles.itemContainer}>
            <Image
              source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name || 'Unnamed Item'}
              </Text>
              <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation, user]
  );

  const renderCategoryItem = useCallback(
    ({ item }) => {
      if (!user || !item || !item._id) return null;
      return (
        <Pressable onPress={() => handleSelect(item._id)}>
          <View style={[styles.categoryItem, selectedCategoryId === item._id && styles.selectedCategory]}>
            <Text style={[styles.categoryText, selectedCategoryId === item._id && styles.selectedCategoryText]}>
              {item.name || 'Unnamed Category'}
            </Text>
          </View>
        </Pressable>
      );
    },
    [selectedCategoryId, user]
  );

  const renderContent = () => {
    if (!user) return null;

    if (loading || status === 'loading') return renderLoading();
    if (status === 'failed') {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không thể tải dữ liệu!</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(getProductsByDecorates(selectedCategoryId))}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const filteredProducts = products.filter(
      (item) => item && item._id && typeof item._id === 'string'
    );

    if (!filteredProducts.length) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào!</Text>
        </View>
      );
    }

    return (
      <FlatList
        numColumns={2}
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id.toString()}
        style={styles.productList}
        contentContainerStyle={styles.productListContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  if (contextLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderLoading()}
      </SafeAreaView>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('TabNavigation')}
          activeOpacity={0.6}
        >
          <AntDesign name="arrowleft" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trang Trí</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('TabNavigation')}
          activeOpacity={0.6}
        >
          <Image source={require('../Assets/Images/home48.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={Cate_decoratesData}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item._id.toString()}
        style={styles.categoryList}
        contentContainerStyle={styles.categoryListContent}
        showsHorizontalScrollIndicator={false}
      />

      {renderContent()}
    </SafeAreaView>
  );
};

export default DiaDiem_Screen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EAE3',
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
  icon: {
    width: 24,
    height: 24,
  },
  categoryList: {
    flexGrow: 0,
  },
  categoryListContent: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  categoryItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#000',
  },
  selectedCategory: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Playfair_me',
    color: '#000',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  productList: {
    flex: 1,
  },
  productListContent: {
    paddingTop: 10,
    paddingBottom: 20,
    justifyContent: 'space-around',
  },
  itemContainer: {
    flex: 1,
    margin: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: width * 0.45,
  },
  image: {
    width: '100%',
    height: 130,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  itemInfo: {
    padding: 10,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Playfair_me',
    color: '#000',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontFamily: 'Playfair_me',
    color: 'red',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingAnimation: {
    width: 150,
    height: 150,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 20,
    fontFamily: 'Playfair_me',
    color: '#000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6F61',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    elevation: 2,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Playfair_me',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Playfair_me',
    color: '#555',
  },
});