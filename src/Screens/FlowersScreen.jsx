import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { FlowersAPI } from "../redux/FlowersSlice";
import { Cate_catering } from "../redux/Cate_CateringSlice";
import { SafeAreaView } from 'react-native-safe-area-context';
import Lottie from 'lottie-react-native';
import LoadingIndicator from '../components/LoadingIndicator';
import AntDesign from 'react-native-vector-icons/AntDesign';

const { width } = Dimensions.get("window");

const formatPrice = (num) => {
  if (!num) return "0";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + " VNĐ";
};

const renderLoading = () => <LoadingIndicator text="Chờ xíu..." />;

const FlowersScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { FlowersData, FlowersStatus } = useSelector((state) => state.flowers);
  const { Cate_cateringData, Cate_cateringStatus } = useSelector((state) => state.cate_catering);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    dispatch(Cate_catering());
  }, [dispatch]);

  useEffect(() => {
    if (Cate_cateringStatus === 'succeeded' && Cate_cateringData.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(Cate_cateringData[0]._id);
    }
  }, [Cate_cateringData, Cate_cateringStatus, selectedCategoryId]);

  useEffect(() => {
    if (selectedCategoryId) {
      dispatch(FlowersAPI(selectedCategoryId));
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

  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
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

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('FoodDetail' , {Id: item._id })}>
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.cardContent}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = useCallback(
    ({ item }) => (
      <TouchableOpacity onPress={() => handleSelect(item._id)} activeOpacity={0.8}>
        <View style={[styles.categoryItem, selectedCategoryId === item._id && styles.selectedCategory]}>
          <Text style={[styles.categoryText, selectedCategoryId === item._id && styles.selectedCategoryText]}>
            {item.name}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [selectedCategoryId]
  );

  const renderContent = () => {
    switch (FlowersStatus) {
      case 'loading':
        return renderLoading();
      case 'succeeded':
        return FlowersData.length > 0 ? (
          <FlatList
            numColumns={2}
            data={FlowersData}
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
      case 'failed':
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Không thể tải dữ liệu!</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(FlowersAPI(selectedCategoryId))}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có dữ liệu để hiển thị</Text>
          </View>
        );
    }
  };

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
                <Text style={styles.headerTitle}>Đồ Ăn</Text>
                <TouchableOpacity 
                  style={styles.headerButton} 
                  onPress={() => navigation.navigate('TabNavigation')}
                  activeOpacity={0.6}
                >
                 <Image source={require('../Assets/Images/home48.png')} style={styles.icon} />
                </TouchableOpacity>
              </View>
      <View style={styles.categoryWrapper}>
        <FlatList
          horizontal
          data={Cate_cateringData}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.categoryListContent}
          showsHorizontalScrollIndicator={false}
          extraData={selectedCategoryId}
        />
      </View>

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
                      onPress={() => toggleFavorite(selectedItem._id)}
                    >
                      <Image
                        source={require('../Assets/Images/heart_filled.png')} // Thay bằng đường dẫn đến ảnh trái tim
                        style={[styles.heartImage, favorites.has(selectedItem._id) && styles.heartFilled]}
                        resizeMode="contain"
                      />
                    </Pressable>
                    <Text style={styles.modalTitle}>{selectedItem.name || 'Không có tên'}</Text>
                    <Text style={styles.modalPrice}>{formatPrice(selectedItem.price)}</Text>
                    <Text style={styles.modalDescription} numberOfLines={3}>
                      {selectedItem.description || 'Không có mô tả'}
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

export default FlowersScreen;

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
  title: {
    fontSize: 22,
    fontFamily: 'Playfair_me',
    color: '#000',
  },
  icon: {
    width: 24,
    height: 24,
  },
  icon_1: {
    width: 20,
    height: 15,
  },
  searchBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 15,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Playfair_me',
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  categoryWrapper: {
    height: 70,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  categoryListContent: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignItems: 'center',
  },
  categoryItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#000',
    elevation: 2,
    justifyContent: 'center',
    minWidth: 80,
    height: 50,
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
    color: '#FFFFFF',
    fontFamily: 'Playfair_me',
  },
  flatListContainer: {
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    margin: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    overflow: 'hidden',
    width: (width / 2) - 26,
  },
  image: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  cardContent: {
    padding: 10,
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    fontFamily: 'Playfair_me',
    color: '#333',
    marginBottom: 5,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Playfair_me',
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