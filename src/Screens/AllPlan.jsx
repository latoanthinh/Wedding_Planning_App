import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useCallback, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plan } from '../redux/GetAllPlanSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../AppContext';

const AllPlan = ({ navigation }) => {
  const dispatch = useDispatch();
  const { AllPlanData, AllPlanStatus, error } = useSelector((state) => state.plan);
  const { user } = useContext(AppContext);
  const userId = user._id;

  useEffect(() => {
    if (userId) {
      dispatch(Plan(userId));
    } else {
      console.warn('Không có userId để lấy danh sách kế hoạch');
    }
  }, [dispatch, userId]);

  const PlanCard = useCallback(({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (!item._id) {
            return;
          }
          navigation.navigate("DetailPlan", { planId: item._id, fromGenPlan: false });
        }}
        style={styles.cardContainer}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.productName}>{item.name || 'Kế hoạch không tên'}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) }
            ]}>
              <Text style={styles.statusText}>
                {item.status || 'Chưa có trạng thái'}
              </Text>
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
              <Image
                source={require('../Assets/Images/back.png')}
                style={styles.arrowIcon}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [navigation]);

  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") || '0';
  };

  const getStatusColor = (status) => {
    if (!status) return '#9E9E9E';
    switch (status.toLowerCase()) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#2196F3';
      case 'chờ xác nhận': return '#FF9800';
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
    navigation.navigate('Thongtincoban'); // Điều hướng đến màn hình tạo plan mới
  };

  const renderContent = useCallback(() => {
    return (
      <>
        {(() => {
          switch (AllPlanStatus) {
            case 'idle':
              return (
                <View style={styles.statusContainer}>
                  <Image source={require('../Assets/Images/home48.png')} style={[styles.statusIcon, { tintColor: '#9E9E9E' }]} />
                  <Text style={styles.statusMessage}>Đang chờ dữ liệu...</Text>
                </View>
              );
            case 'loading':
              return (
                <View style={styles.statusContainer}>
                  <ActivityIndicator size="large" color="#2196F3" />
                  <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                </View>
              );
            case 'succeeded':
              return AllPlanData && AllPlanData.length > 0 ? (
                <FlatList
                  data={AllPlanData}
                  keyExtractor={(item) => item._id}
                  renderItem={PlanCard}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.flatListContent}
                  refreshing={AllPlanStatus === 'loading'}
                  onRefresh={handleRefresh}
                  
                />
              ) : (
                <View style={styles.statusContainer}>
                  <Image source={require('../Assets/Images/home48.png')} style={[styles.statusIcon, { tintColor: '#9E9E9E' }]} />
                  <Text style={styles.statusMessage}>Bạn hãy tạo plan mới!</Text>
                </View>
              );
            case 'failed':
              return (
                <View style={styles.statusContainer}>
                  <Image source={require('../Assets/Images/home48.png')} style={[styles.statusIcon, { tintColor: '#F44336' }]} />
                  <Text style={styles.errorText}>Bạn Hãy tạo Thêm Kế Hoạch nhé</Text>
                </View>
              );
            default:
              return null;
          }
        })()}

        {/* Nút tạo plan mới */}
        <TouchableOpacity
          style={styles.createPlanButton}
          onPress={handleCreateNewPlan}
        >
          <Text style={styles.createPlanButtonText}>Tạo plan mới</Text>
        </TouchableOpacity>
      </>
    );
  }, [AllPlanData, AllPlanStatus, error, dispatch, userId, PlanCard]);

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
  arrowIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
    transform: [{ rotate: '180deg' }],
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
    paddingBottom: 100, // Tăng padding để nút "Tạo plan mới" không che danh sách
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