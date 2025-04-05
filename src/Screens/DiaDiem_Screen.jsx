import { StyleSheet, Text, View, Image, Pressable, FlatList, Dimensions, ActivityIndicator, Modal, TouchableWithoutFeedback, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState, useMemo, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Cate_decorates } from '../redux/Cate_decoratesSlice';
import { getProductsByDecorates } from '../redux/DecoratesByCateSlice';
import Lottie from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';

const { width } = Dimensions.get('window');

const formatPrice = (num) => {
  return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ' : '0';
};

const DiaDiem_Screen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { Cate_decoratesData, Cate_decoratesStatus } = useSelector((state) => state.cate_decorates);
  const { products, status } = useSelector((state) => state.decoratesbyCate);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  

  

  useEffect(() => {
    dispatch(Cate_decorates());
  }, [dispatch]);

  useEffect(() => {
    if (Cate_decoratesStatus === 'succeeded' && Cate_decoratesData.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(Cate_decoratesData[0]._id);
    }
  }, [Cate_decoratesData, Cate_decoratesStatus, selectedCategoryId]);

  useEffect(() => {
    if (selectedCategoryId) {
      dispatch(getProductsByDecorates(selectedCategoryId));
    }
  }, [selectedCategoryId, dispatch]);

  useEffect(() => {
    if (status === 'succeeded' && products.length > 0) {
      console.log('Products data structure:', JSON.stringify(products[0], null, 2));
    }
  }, [products, status]);

  

  const handleSelect = (id) => {
    if (id !== selectedCategoryId) setSelectedCategoryId(id);
  };




  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <Lottie source={require('../Assets/Animations/blackloading.json')} autoPlay loop style={styles.loadingAnimation} />
      <Text style={styles.loadingText}>Chờ xíu...</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('DecorDetail', { 
      decorId: item._id
    })}>
      <View style={styles.itemContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }) => (
    <Pressable onPress={() => handleSelect(item._id)}>
      <View style={[styles.categoryItem, selectedCategoryId === item._id && styles.selectedCategory]}>
        <Text style={[styles.categoryText, selectedCategoryId === item._id && styles.selectedCategoryText]}>
          {item.name}
        </Text>
      </View>
    </Pressable>
  );

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

      {status === 'loading' ? (
        renderLoading()
      ) : (
        <FlatList
          numColumns={2}
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item._id.toString()}
          style={styles.productList}
          contentContainerStyle={styles.productListContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      
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
  itemDescription: {
    fontSize: 12,
    color: '#000',
    marginBottom: 6,
    lineHeight: 16,
    fontFamily: 'Playfair_me',
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
  },
});