import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, Dimensions, ActivityIndicator, Modal, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Invitations } from '../redux/InvitationsSlice';
import { Cate_present } from '../redux/Cate_PresentSlice';
import Lottie from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get("window");

const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + " VNĐ";
};

const Gift_Screen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { Cate_presentData = [], Cate_presentStatus } = useSelector((state) => state.cate_present);
  const { InvitationsData = [], InvitationsStatus } = useSelector((state) => state.invitations);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(false); 

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
      dispatch(Invitations(selectedCategoryId)).finally(() => {
        setLoading(false); 
      });
    }
  }, [selectedCategoryId, dispatch]);

  const handleSelect = (id) => {
    if (id !== selectedCategoryId) {
      setSelectedCategoryId(id);
    }
  };

  const handleItemPress = (item) => {
    if (item && item._id) {
      setSelectedItem(item);
      setModalVisible(true);
    }
  };

  const toggleFavorite = (itemId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId);
    } else {
      newFavorites.add(itemId);
    }
    setFavorites(newFavorites);
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <Lottie source={require('../Assets/Animations/loading1.json')} autoPlay loop style={styles.loadingAnimation} />
      <Text style={styles.loadingText}>Chờ xíu...</Text>
    </View>
  );

  const renderCategoryItem = useCallback(({ item }) => (
    <TouchableOpacity onPress={() => handleSelect(item._id)} activeOpacity={0.7}>
      <View style={[styles.categoryItem, selectedCategoryId === item._id && styles.selectedCategory]}>
        <Text style={[styles.categoryText, selectedCategoryId === item._id && styles.selectedCategoryText]}>
          {item.name || 'Unnamed Category'}
        </Text>
      </View>
    </TouchableOpacity>
  ), [selectedCategoryId]);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)} style={styles.touchableContainer}>
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} style={styles.image} resizeMode="cover" />
        <View style={styles.cardContent}>
          <Text style={styles.productName} numberOfLines={1}>{item.name || 'Unnamed Item'}</Text>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) {
      return renderLoading();
    }
    if (InvitationsStatus === 'loading') {
      return <ActivityIndicator size="large" color="#FF6F61" style={styles.loading} />;
    }
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
    return InvitationsData.length > 0 ? (
      <FlatList
        numColumns={2}
        data={InvitationsData}
        renderItem={renderItem}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.flatListContainer}
        showsVerticalScrollIndicator={false}
      />
    ) : (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào!</Text>
      </View>
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

      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          data={Cate_presentData}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.categoryListContent}
          showsHorizontalScrollIndicator={false}
          extraData={selectedCategoryId}
        />
      </View>

      <View style={styles.listContainer}>
        {renderContent()}
      </View>

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
                    <TouchableOpacity
                      style={styles.favoriteIcon}
                      onPress={() => toggleFavorite(selectedItem._id)}
                    >
                      <Image
                        source={require('../Assets/Images/heart_filled.png')}
                        style={[styles.heartImage, favorites.has(selectedItem._id) && styles.heartFilled]}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
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
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Playfair_me',
    alignSelf: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
  icon_1: {
    width: 20,
    height: 15,
  },
  categoryContainer: {
    height: 48,
    backgroundColor: '#fff',
  },
  categoryListContent: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    alignItems: 'center',
  },
  categoryItem: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#000',
    justifyContent: 'center',
    minWidth: 70,
    height: 34,
  },
  selectedCategory: {
    backgroundColor: '#000',
    borderColor: '#000',
    elevation: 2,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: 'Playfair_me',
    color: '#000',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontFamily: 'Playfair_me',
  },
  listContainer: {
    flex: 1,
    paddingTop: 10,
  },
  flatListContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  touchableContainer: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: (width / 2) - 22,
  },
  image: {
    width: '100%',
    height: 130,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 8,
    alignItems: 'center',
  },
  productName: {
    fontSize: 15,
    fontFamily: 'Playfair_me',
    color: '#000',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
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
    fontSize: 20,
    color: '#000',
    fontFamily: 'Playfair-re',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Playfair_me',
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#FF6F61',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 2,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
    tintColor: '#ccc',
  },
  heartFilled: {
    tintColor: 'red',
  },
});