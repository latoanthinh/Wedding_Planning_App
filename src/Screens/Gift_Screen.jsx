import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Invitations } from '../redux/InvitationsSlice';
import { Cate_present } from '../redux/Cate_PresentSlice';
import Lottie from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get("window");

const formatPrice = (num) => (num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "0");

const InvitationsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { Cate_presentData = [], Cate_presentStatus } = useSelector((state) => state.cate_present);
  const { InvitationsData = [], InvitationsStatus } = useSelector((state) => state.invitations);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

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
      dispatch(Invitations(selectedCategoryId));
    }
  }, [selectedCategoryId, dispatch]);

  const handleSelect = (id) => {
    if (id !== selectedCategoryId) {
      setSelectedCategoryId(id);
    }
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <Lottie source={require('../Assets/Animations/loading.json')} autoPlay loop style={styles.loadingAnimation} />
      <Text style={styles.loadingText}>Chờ xíu...</Text>
    </View>
  );

  const renderCategoryItem = useCallback(({ item }) => (
    <TouchableOpacity onPress={() => handleSelect(item._id)} activeOpacity={0.7}>
      <View style={[styles.categoryItem, selectedCategoryId === item._id && styles.selectedCategory]}>
        <Text style={[styles.categoryText, selectedCategoryId === item._id && styles.selectedCategoryText]}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  ), [selectedCategoryId]);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('InvitationDetail', { invitationId: item._id })}>
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.cardContent}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
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
    </SafeAreaView>
  );
};

export default InvitationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#F8F9FB',
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
    backgroundColor: '#F8F9FB',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECEF',
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
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
    justifyContent: 'center',
    minWidth: 70,
    height: 34,
  },
  selectedCategory: {
    backgroundColor: '#FF6F61',
    borderColor: '#FF6F61',
    elevation: 2,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContainer: {
    flex: 1,
    paddingTop: 10,
  },
  flatListContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
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
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6F61',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingAnimation: {
    width: 120,
    height: 120,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Playfair-re',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
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
});