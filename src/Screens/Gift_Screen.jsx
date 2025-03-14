import { StyleSheet, Text, View, Pressable, Image, FlatList, Dimensions, ActivityIndicator, Modal, TouchableWithoutFeedback, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Invitations } from '../redux/InvitationsSlice';
import { Cate_present } from '../redux/Cate_PresentSlice';
import Lottie from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addFavoriteItem, removeFavoriteItem, fetchUserFavorites } from '../redux/FavoriteDeanAddSlice';
import { AppContext } from '../AppContext';

const { width } = Dimensions.get('window');

const formatPrice = (price) => {
  return price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ' : '0 VNĐ';
};

const Gift_Screen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { Cate_presentData = [], Cate_presentStatus } = useSelector((state) => state.cate_present);
  const { InvitationsData = [], InvitationsStatus } = useSelector((state) => state.invitations);
  const { data: favoritesData = [], status: favoriteStatus, error: favoriteError } = useSelector((state) => state.favoriteset);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const { user } = useContext(AppContext);
  const { itemId } = route.params || {};
  const userId = user?._id;

  const type = route.params?.type || 'Present';

  // Kiểm tra isFavorite với log để debug
  const isFavorite = selectedItem
    ? Array.isArray(favoritesData) && favoritesData.some(item => {
        const match = item.type === type && item.itemId === selectedItem._id;
        console.log(`Kiểm tra yêu thích: type=${item.type}, itemId=${item.itemId}, selectedItemId=${selectedItem._id}, match=${match}`);
        return match;
      })
    : false;

  const handleToggleFavorite = async () => {
    if (!userId || !type || !selectedItem?._id) {
      console.error('Không thể thực hiện yêu thích do thông tin không hợp lệ:', { userId, type, itemId: selectedItem?._id });
      Alert.alert('Lỗi', 'Thông tin không hợp lệ, vui lòng thử lại.');
      return;
    }

    if (favoriteLoading) {
      console.log('Đang xử lý yêu thích, vui lòng chờ...');
      return; // Ngăn nhấn liên tục khi đang xử lý
    }

    setFavoriteLoading(true);
    try {
      console.log('Gửi yêu cầu với:', { userId, type, itemId: selectedItem._id });
      if (isFavorite) {
        const result = await dispatch(removeFavoriteItem({ userId, type, itemId: selectedItem._id })).unwrap();
        console.log('Phản hồi từ removeFavoriteItem:', result);
        Alert.alert('Thông báo', 'Đã xóa khỏi danh sách yêu thích.');
      } else {
        const result = await dispatch(addFavoriteItem({ userId, type, itemId: selectedItem._id })).unwrap();
        console.log('Phản hồi từ addFavoriteItem:', result);
        Alert.alert('Thông báo', 'Đã thêm vào danh sách yêu thích.');
      }
      // Làm mới danh sách yêu thích sau khi thêm/xóa
      await dispatch(fetchUserFavorites(userId));
    } catch (error) {
      console.error('Lỗi khi xử lý yêu thích:', error);
      const errorMessage = error.message || (error.response?.data?.message || 'Không thể thực hiện yêu thích, vui lòng thử lại.');
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setFavoriteLoading(false);
    }
  };

  useEffect(() => {
    dispatch(Cate_present());
  }, [dispatch]);

  useEffect(() => {
    if (Cate_presentStatus === 'succeeded' && Cate_presentData.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(Cate_presentData[0]._id);
    }
  }, [Cate_presentData, Cate_presentStatus, selectedCategoryId]);

  useEffect(() => {
    if (selectedCategoryId) {
      setLoading(true);
      dispatch(Invitations(selectedCategoryId)).finally(() => setLoading(false));
    }
  }, [selectedCategoryId, dispatch]);

  useEffect(() => {
    if (userId && favoriteStatus === 'idle') {
      dispatch(fetchUserFavorites(userId));
    }
  }, [dispatch, userId, favoriteStatus]);

  const handleSelect = (id) => {
    if (id !== selectedCategoryId) setSelectedCategoryId(id);
  };

  const handleItemPress = (item) => {
    if (item && item._id) {
      setSelectedItem(item);
      setModalVisible(true);
    }
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <Lottie source={require('../Assets/Animations/loading1.json')} autoPlay loop style={styles.loadingAnimation} />
      <Text style={styles.loadingText}>Chờ xíu...</Text>
    </View>
  );

  const renderCategoryItem = useCallback(
    ({ item }) => (
      <Pressable onPress={() => handleSelect(item._id)}>
        <View style={[styles.categoryItem, selectedCategoryId === item._id && styles.selectedCategory]}>
          <Text style={[styles.categoryText, selectedCategoryId === item._id && styles.selectedCategoryText]}>
            {item.name || 'Unnamed Category'}
          </Text>
        </View>
      </Pressable>
    ),
    [selectedCategoryId]
  );

  const renderItem = ({ item }) => (
    <Pressable onPress={() => handleItemPress(item)}>
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} style={styles.image} resizeMode="cover" />
        <View style={styles.cardContent}>
          <Text style={styles.productName} numberOfLines={1}>{item.name || 'Unnamed Item'}</Text>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
        </View>
      </View>
    </Pressable>
  );

  const renderContent = () => {
    if (loading || InvitationsStatus === 'loading') return renderLoading();
    if (InvitationsStatus === 'failed') {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không thể tải dữ liệu!</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(Invitations(selectedCategoryId))}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (!InvitationsData || InvitationsData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào!</Text>
        </View>
      );
    }
    return (
      <FlatList
        numColumns={2}
        data={InvitationsData}
        renderItem={renderItem}
        keyExtractor={(item) => item._id.toString()}
        style={styles.productList}
        contentContainerStyle={styles.productListContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('TabNavigation')}>
          <Image source={require('../Assets/Images/back.png')} style={styles.icon_1} />
        </TouchableOpacity>
        <Text style={styles.title}>Quà Tặng</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TabNavigation')}>
          <Image source={require('../Assets/Images/home48.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={Cate_presentData}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item._id.toString()}
        style={styles.categoryList}
        contentContainerStyle={styles.categoryListContent}
        showsHorizontalScrollIndicator={false}
      />

      {renderContent()}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                {selectedItem ? (
                  <>
                    <Image
                      source={{ uri: selectedItem.imageUrl || 'https://via.placeholder.com/200' }}
                      style={styles.modalImage}
                      resizeMode="cover"
                    />
                    <Pressable
                      style={styles.favoriteIcon}
                      onPress={handleToggleFavorite}
                      disabled={favoriteLoading}
                    >
                      {favoriteLoading ? (
                        <ActivityIndicator size="small" color="#FF6F61" />
                      ) : (
                        <Image
                          source={require('../Assets/Images/heart_filled.png')}
                          style={[styles.heartImage, { tintColor: isFavorite ? 'red' : '#ccc' }]}
                          resizeMode="contain"
                        />
                      )}
                    </Pressable>
                    <Text style={styles.modalTitle}>{selectedItem.name || 'Không có tên'}</Text>
                    <Text style={styles.modalPrice}>{formatPrice(selectedItem.price)}</Text>
                    <Text style={styles.modalDescription} numberOfLines={3}>
                      {selectedItem.Description || 'Không có mô tả'}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.modalError}>Không có dữ liệu để hiển thị</Text>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default Gift_Screen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
  },
  icon: {
    width: 24,
    height: 24,
  },
  icon_1: {
    width: 20,
    height: 15,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Playfair_me',
    color: '#000',
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
  card: {
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
  cardContent: {
    padding: 10,
  },
  productName: {
    fontSize: 16,
    fontFamily: 'Playfair_me',
    color: '#000',
    marginBottom: 4,
  },
  productPrice: {
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
    width: 80,
    height: 80,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    fontFamily: 'Playfair_me',
    color: '#000',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: 'relative',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Playfair_me',
    color: '#000',
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalPrice: {
    fontSize: 18,
    fontFamily: 'Playfair_me',
    color: 'red',
    fontWeight: '700',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    fontFamily: 'Playfair_me',
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalError: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
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
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Playfair_me',
    color: '#555',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 5,
  },
  heartImage: {
    width: 24,
    height: 24,
  },
});