import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plan } from '../redux/GetAllPlanSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../AppContext';
import { useBackHandler } from '../hooks/useBackHandler';

const AllPlan = ({ navigation }) => {
  const dispatch = useDispatch();
  const { AllPlanData = [], AllPlanStatus, error } = useSelector((state) => state.plan);
  const { user, isLoading: contextLoading } = useContext(AppContext);
  const userId = user?._id;
  const [loading, setLoading] = useState(false);

  useBackHandler(navigation, 'TabNavigation', { screen: 'Setting' });

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

  useEffect(() => {
    if (!userId) return;

    const fetchPlans = async () => {
      try {
        setLoading(true);
        await dispatch(Plan(userId)).unwrap();
      } catch (error) {
        console.error('Lỗi khi lấy danh sách kế hoạch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();

    return () => {
      setLoading(false);
    };
  }, [dispatch, userId]);

  const PlanCard = useCallback(
    ({ item }) => {
      if (!user || !item || !item._id) return null;
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('DetailPlan', { planId: item._id, fromGenPlan: false })}
          style={styles.cardContainer}
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.productName}>{item.name || 'Kế hoạch không tên'}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                <Text style={styles.statusText}>{item.status || 'Chưa có trạng thái'}</Text>
              </View>
            </View>
            <View style={styles.cardDivider} />
            <View style={styles.cardFooter}>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Tổng tiền:</Text>
                <Text style={styles.productPrice}>{formatPrice(item.totalPrice)}đ</Text>
              </View>
              <View style={styles.detailButton}>
                <Text style={styles.detailButtonText}>Xem chi tiết</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation, user]
  );

  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') || '0';
  };

  const getStatusColor = (status) => {
    if (!status) return '#9E9E9E';
    switch (status.toLowerCase()) {
      case 'đã kích hoạt': return '#4CAF50';
      case 'chưa kích hoạt': return '#2196F3';
      case 'đang chờ': return '#FF9800';
      case 'đã hủy': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const handleRefresh = () => {
    if (userId) {
      dispatch(Plan(userId));
    }
  };

  const handleCreateNewPlan = () => {
    if (!user) return;
    navigation.navigate('Thongtincoban');
  };

  const renderLoading = () => (
    <View style={styles.statusContainer}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
    </View>
  );

  const renderContent = useCallback(() => {
    if (!user) return null;

    if (loading || AllPlanStatus === 'loading') return renderLoading();
    if (AllPlanStatus === 'failed') {
      return (
        <View style={styles.statusContainer}>
          <Image source={require('../Assets/Images/home48.png')} style={[styles.statusIcon, { tintColor: '#F44336' }]} />
          <Text style={styles.errorText}>Không thể tải dữ liệu! Hãy thử lại sau.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(Plan(userId))}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const filteredPlanData = AllPlanData.filter(
      (item) => item && item._id && typeof item._id === 'string'
    );

    if (!filteredPlanData.length) {
      return (
        <View style={styles.statusContainer}>
          <Image source={require('../Assets/Images/home48.png')} style={[styles.statusIcon, { tintColor: '#9E9E9E' }]} />
          <Text style={styles.statusMessage}>Bạn hãy tạo plan mới!</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredPlanData}
        keyExtractor={(item) => item._id.toString()}
        renderItem={PlanCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        refreshing={AllPlanStatus === 'loading'}
        onRefresh={handleRefresh}
      />
    );
  }, [AllPlanData, AllPlanStatus, loading, user, userId, dispatch, PlanCard]);

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
          onPress={() => navigation.navigate('TabNavigation', { screen: 'Setting' })}
        >
          <Image source={require('../Assets/Images/back.png')} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.title}>Kế hoạch của bạn</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('TabNavigation')}
        >
          <Image source={require('../Assets/Images/home48.png')} style={styles.homeIcon} />
        </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
        {renderContent()}
        <TouchableOpacity style={styles.createPlanButton} onPress={handleCreateNewPlan}>
          <Text style={styles.createPlanButtonText}>Tạo plan mới</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  icon: {
    width: 20,
    height: 15,
  },
  homeIcon: {
    width: 20,
    height: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    letterSpacing: 0.5,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  flatListContent: {
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  card: {
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    flex: 1,
    letterSpacing: 0.3,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardDivider: {
    height: 1.5,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'column',
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#200000',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#222222',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 6,
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusIcon: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  statusMessage: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#2196F3',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginVertical: 12,
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
    fontWeight: '700',
  },
  createPlanButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  createPlanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AllPlan;