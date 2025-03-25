import React, { useRef, useEffect, useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { ChitietPlan, resetChitietPlan, duplicatePlan } from '../redux/ChitietPlanSlice';
import { AppContext } from '../AppContext';

const { width } = Dimensions.get('window');

const DetailPlan = ({ navigation, route }) => {
  const { planId: routePlanId, planData: routePlanData } = route?.params || {};
  const dispatch = useDispatch();
  const { ChitietPlanData, ChitietPlanStatus, error } = useSelector((state) => state.chitietplan);
  const { user } = useContext(AppContext);
  const userId = user?._id; // Sửa user._id thành user.userId
  const [priceDifference, setPriceDifference] = useState(0);

  const planId = routePlanId || (ChitietPlanData?._id || routePlanData?._id);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (planData) {
      const budget = parseFloat(planData.planprice) || 0;
      const total = parseFloat(planData.totalPrice) || 0;
      const difference = budget - total;
      setPriceDifference(difference);
    }
  }, [planData]);

  useEffect(() => {
    if (routePlanData) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    } else if (planId) {
      dispatch(resetChitietPlan());
      dispatch(ChitietPlan(planId))
        .unwrap()
        .catch((err) => {
          ToastAndroid.show(`Lỗi tải chi tiết kế hoạch: ${err.message || err}`, ToastAndroid.SHORT);
        });
    } else {
      ToastAndroid.show('Không có ID kế hoạch để tải chi tiết!', ToastAndroid.SHORT);
    }
  }, [dispatch, planId, routePlanData]);

  useEffect(() => {
    if (ChitietPlanStatus === 'succeeded' && !routePlanData) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  }, [ChitietPlanStatus, routePlanData]);

  useEffect(() => {
    if (error) {
      ToastAndroid.show(`Lỗi: ${error}`, ToastAndroid.SHORT);
    }
  }, [error]);

  const planData = routePlanData || (ChitietPlanData?.plan ? ChitietPlanData.plan : ChitietPlanData) || null;

  // Kiểm tra nếu không có dữ liệu kế hoạch
  if (!planData && ChitietPlanStatus !== 'loading' && ChitietPlanStatus !== 'idle') {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="alert-circle" size={60} color="#FF4444" />
        <Text style={styles.errorText}>Không có dữ liệu kế hoạch để hiển thị</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(ChitietPlan(planId))}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const GUESTS_PER_TABLE = 10;
  const numberOfTables = planData?.plansoluongkhach
    ? Math.ceil(planData.plansoluongkhach / GUESTS_PER_TABLE)
    : 0;

  const calculateSectionTotal = (services, multiplyByTables = false) => {
    if (!services || services.length === 0) return 0;
    const total = services.reduce((sum, item) => {
      const price = item && item.price ? parseFloat(item.price) : 0;
      return sum + (multiplyByTables ? price * numberOfTables : price);
    }, 0);
    return total;
  };

  const renderServiceItem = (title, services, iconName, color, multiplyByTables = false) => {
    const sectionTotal = calculateSectionTotal(services, multiplyByTables);

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name={iconName} size={28} color={color} style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {services && services.length > 0 ? (
          <>
            {services.map((item, index) => (
              item ? (
                <View key={index} style={styles.serviceCard}>
                  {item.imageUrl && (
                    <Image source={{ uri: item.imageUrl }} style={styles.serviceImage} />
                  )}
                  <View style={styles.serviceContent}>
                    <Text style={styles.serviceText}>{item.name || 'Không có tên'}</Text>
                    {item.price !== undefined && (
                      <Text style={styles.servicePrice}>
                        Giá: {item.price.toLocaleString('vi-VN')} VNĐ{' '}
                        {multiplyByTables &&
                          `x ${numberOfTables} bàn = ${(item.price * numberOfTables).toLocaleString('vi-VN')} VNĐ`}
                      </Text>
                    )}
                    {item.description && (
                      <Text style={styles.serviceDescription}>
                        {item.description || 'Không có mô tả'}
                      </Text>
                    )}
                  </View>
                </View>
              ) : (
                <Text key={index} style={styles.noDataText}>Dữ liệu không hợp lệ</Text>
              )
            ))}
            <Text style={styles.sectionTotal}>
              Tổng tiền: {sectionTotal.toLocaleString('vi-VN')} VNĐ
            </Text>
          </>
        ) : (
          <Text style={styles.noDataText}>Không có dữ liệu</Text>
        )}
      </View>
    );
  };

  if (ChitietPlanStatus === 'idle' && !routePlanData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6F61" />
        <Text style={styles.loadingText}>Đang chuẩn bị...</Text>
      </SafeAreaView>
    );
  }

  if (ChitietPlanStatus === 'loading' && !routePlanData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6F61" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  if (ChitietPlanStatus === 'failed' && !routePlanData) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="alert-circle" size={60} color="#FF4444" />
        <Text style={styles.errorText}>{error || 'Không tìm thấy kế hoạch'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(ChitietPlan(planId))}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleEditPlan = () => {
    if (!userId) {
      ToastAndroid.show('Không tìm thấy thông tin người dùng!', ToastAndroid.SHORT);
      return;
    }

    const userIdFromPlan = typeof planData.UserId === 'string' ? planData.UserId : planData.UserId?._id;
    const isOwner = userIdFromPlan && userIdFromPlan.toString() === userId.toString();

    if (isOwner) {
      // Truyền thêm eventDate, guestCount, budget vào EditPlan
      navigation.navigate('EditPlan', {
        planId: planId,
        planData: {
          ...planData,
          eventDate: planData.eventDate, // Từ GenPlan
          guestCount: planData.guestCount, // Từ GenPlan
          budget: planData.budget, // Từ GenPlan
        },
      });
    } else {
      dispatch(duplicatePlan({ planId: planId, userId }))
        .unwrap()
        .then((newPlan) => {
          console.log('Dữ liệu newPlan:', newPlan);
          const combinedPlanData = {
            ...planData,
            _id: newPlan._id,
            UserId: userId,
            name: newPlan.name || `Copy of ${planData.name}`,
            plandateevent: newPlan.plandateevent || planData.plandateevent,
            createdAt: newPlan.createdAt,
            updatedAt: newPlan.updatedAt,
            caterings: planData.caterings || newPlan.caterings || [],
            decorates: planData.decorates || newPlan.decorates || [],
            presents: planData.presents || newPlan.presents || [],
            totalPrice: planData.totalPrice || newPlan.totalPrice || 0,
            SanhId: planData.SanhId || newPlan.SanhId || null,
            plansoluongkhach: planData.plansoluongkhach || newPlan.plansoluongkhach || 0,
            planprice: planData.planprice || newPlan.planprice || 0,
            eventDate: planData.eventDate, // Truyền thêm eventDate
            guestCount: planData.guestCount, // Truyền thêm guestCount
            budget: planData.budget, // Truyền thêm budget
          };
          console.log('Dữ liệu combinedPlanData:', combinedPlanData);
          navigation.navigate('EditPlan', { planId: newPlan._id, planData: combinedPlanData });
          ToastAndroid.show('Đã tạo bản sao kế hoạch để chỉnh sửa!', ToastAndroid.SHORT);
        })
        .catch((err) => {
          console.log('Lỗi khi tạo bản sao:', err);
          ToastAndroid.show(`Lỗi khi tạo mới plan: ${err.message || err}`, ToastAndroid.SHORT);
        });
    }
  };

  const handleDeposit = () => {
    if (!planId) {
      ToastAndroid.show('Không thể đặt cọc: Thiếu planId', ToastAndroid.SHORT);
      return;
    }
    navigation.navigate('Payos', { planId: planId, totalPrice: planData.totalPrice });
  };

  const sanhTotal = planData.SanhId && planData.SanhId.price ? parseFloat(planData.SanhId.price) : 0;

  const isDepositDisabled = planData.status === 'active';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6F61" />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi tiết kế hoạch</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("TabNavigation")}
              style={styles.backButton}
            >
              <Image source={require("../Assets/Images/home48.png")} style={styles.homeIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.planInfoCard}>
            <Text style={styles.planTitle}>{planData.name || 'Kế hoạch không tên'}</Text>
            <Text style={styles.planPrice}>
              Tổng giá: {(planData.totalPrice || 0).toLocaleString('vi-VN')} VNĐ
            </Text>
            {planData.SanhId && (
              <View style={styles.infoRow}>
                <Icon name="home" size={24} color="#FF6F61" style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.planDetail}>Sảnh: {planData.SanhId.name || 'N/A'}</Text>
                  <Text style={styles.planSubDetail}>
                    Giá: {(planData.SanhId.price || 0).toLocaleString('vi-VN')} VNĐ
                  </Text>
                  <Text style={styles.planSubDetail}>
                    Số lượng khách: {planData.SanhId.SoLuongKhach || 'N/A'}
                  </Text>
                  {planData.SanhId.imageUrl && (
                    <Image source={{ uri: planData.SanhId.imageUrl }} style={styles.sanhImage} />
                  )}
                  <Text style={styles.sectionTotal}>
                    Tổng tiền sảnh: {sanhTotal.toLocaleString('vi-VN')} VNĐ
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.infoRow}>
              <Icon name="calendar" size={24} color="#FF6F61" style={styles.infoIcon} />
              <Text style={styles.planDetail}>
                Ngày: {planData.plandateevent
                  ? new Date(planData.plandateevent).toLocaleDateString('vi-VN')
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="account-group" size={24} color="#FF6F61" style={styles.infoIcon} />
              <Text style={styles.planDetail}>
                Số khách: {planData.plansoluongkhach || 'N/A'} (Dự kiến: {numberOfTables} bàn)
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="cash" size={24} color="#FF6F61" style={styles.infoIcon} />
              <Text style={styles.planDetail}>
                Ngân sách: {(planData.planprice || 0).toLocaleString('vi-VN')} VNĐ
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="scale-balance" size={24} color="#FF6F61" style={styles.infoIcon} />
              <Text
                style={[
                  styles.planDetail,
                  {
                    color:
                      priceDifference > 0 ? '#4CAF50' : priceDifference < 0 ? '#FF4444' : '#777',
                    fontWeight: '600',
                  },
                ]}
              >
                Chênh lệch: {priceDifference.toLocaleString('vi-VN')} VNĐ
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.editButton} onPress={handleEditPlan}>
                <Icon name="pencil" size={20} color="#FFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Chỉnh sửa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.depositButton, isDepositDisabled && styles.disabledButton]}
                onPress={handleDeposit}
                disabled={isDepositDisabled}
              >
                <Icon name="cash-plus" size={20} color="#FFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Đặt cọc</Text>
              </TouchableOpacity>
            </View>
          </View>

          {renderServiceItem('Dịch vụ ăn uống', planData.caterings, 'food-fork-drink', '#FF6F61', true)}
          {renderServiceItem('Trang trí', planData.decorates, 'flower', '#FFB300', false)}
          {renderServiceItem('Quà tặng', planData.presents, 'gift', '#4CAF50', true)}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF6F61',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginBottom: 25,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: 'sans-serif-medium',
  },
  homeIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFF',
  },
  planInfoCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  planTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FF6F61',
    marginBottom: 20,
    textAlign: 'center',
    backgroundColor: '#FFF3F2',
    paddingVertical: 8,
    borderRadius: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  infoIcon: {
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  planDetail: {
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
  },
  planSubDetail: {
    fontSize: 14,
    color: '#777',
    marginTop: 6,
  },
  sanhImage: {
    width: '100%',
    height: 180,
    borderRadius: 15,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
    paddingBottom: 10,
  },
  sectionIcon: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  serviceImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#EDEDED',
  },
  serviceContent: {
    flex: 1,
  },
  serviceText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FF6F61',
    marginBottom: 6,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  sectionTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
    marginTop: 12,
    textAlign: 'right',
    backgroundColor: '#F0F9F0',
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  depositButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F7F9FC',
  },
  errorText: {
    fontSize: 20,
    color: '#FF4444',
    textAlign: 'center',
    marginTop: 15,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 25,
    backgroundColor: '#FF6F61',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 5,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DetailPlan;