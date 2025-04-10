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
  const { planId: routePlanId, planData: routePlanData, fromGenPlan } = route?.params || {};
  const dispatch = useDispatch();
  const { ChitietPlanData, ChitietPlanStatus, error } = useSelector((state) => state.chitietplan);
  const { user } = useContext(AppContext);
  const userId = user?._id;
  const [priceDifference, setPriceDifference] = useState(0);
  const [calculatedTotalPrice, setCalculatedTotalPrice] = useState(0);

  const planId = routePlanId || (ChitietPlanData?._id || routePlanData?._id);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const planData = routePlanData || (ChitietPlanData?.plan ? ChitietPlanData.plan : ChitietPlanData) || null;

  // Tính tổng giá và chênh lệch khi từ GenPlan
  useEffect(() => {
    if (fromGenPlan && planData) {
      const sanhPrice = planData.SanhId?.price ? parseFloat(planData.SanhId.price) : 0;
      const cateringTotal = calculateSectionTotal(planData.caterings, true);
      const decorateTotal = calculateSectionTotal(planData.decorates, false);
      const presentTotal = calculateSectionTotal(planData.presents, false);
      const total = sanhPrice + cateringTotal + decorateTotal + presentTotal;
      setCalculatedTotalPrice(total);

      const budget = parseFloat(planData.budget) || 0;
      const difference = budget - total;
      setPriceDifference(difference);
    } else if (!fromGenPlan && planData) {
      const budget = parseFloat(planData.planprice || planData.budget) || 0;
      const totalPrice = parseFloat(planData.totalPrice) || 0;
      const difference = planData.priceDifference !== undefined ? planData.priceDifference : budget - totalPrice;
      setPriceDifference(difference);
      setCalculatedTotalPrice(totalPrice);
    }
  }, [planData, fromGenPlan]);

  useEffect(() => {
    if (routePlanData) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    } else if (planId) {
      dispatch(resetChitietPlan());
      dispatch(ChitietPlan(planId))
        .unwrap()
        .then(() => {
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        })
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

  if (!planData && ChitietPlanStatus !== 'loading' && ChitietPlanStatus !== 'idle') {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContent}>
          <View style={styles.errorIconContainer}>
            <Icon name="alert-circle-outline" size={70} color="#000000" />
          </View>
          <Text style={styles.errorTitle}>Không tìm thấy dữ liệu</Text>
          <Text style={styles.errorText}>Không có dữ liệu kế hoạch để hiển thị</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(ChitietPlan(planId))}
          >
            <Icon name="refresh" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const GUESTS_PER_TABLE = 10;
  const numberOfTables = planData?.plansoluongkhach || planData?.guestCount
    ? Math.ceil((planData.plansoluongkhach || planData.guestCount) / GUESTS_PER_TABLE)
    : 0;

  const calculateSectionTotal = (services, multiplyByTables = false) => {
    if (!services || services.length === 0) return 0;
    const total = services.reduce((sum, item) => {
      const price = item && item.price ? parseFloat(item.price) : 0;
      const quantity = multiplyByTables ? numberOfTables : (item.quantity || 1);
      return sum + (price * quantity);
    }, 0);
    return total;
  };

  const renderServiceItem = (title, services, iconName, color, multiplyByTables = false) => {
    const sectionTotal = calculateSectionTotal(services, multiplyByTables);

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconContainer, { backgroundColor: 'rgba(0, 0, 0, 0.05)' }]}>
            <Icon name={iconName} size={24} color="#000000" />
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {services && services.length > 0 ? (
          <>
            {services.map((item, index) => (
              item ? (
                <View key={index} style={[styles.serviceCard, { borderLeftColor: '#000000' }]}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.serviceImage} />
                  ) : (
                    <View style={[styles.serviceImagePlaceholder, { backgroundColor: 'rgba(0, 0, 0, 0.03)' }]}>
                      <Icon name={iconName} size={30} color="#000000" />
                    </View>
                  )}
                  <View style={styles.serviceContent}>
                    <Text style={styles.serviceText}>{item.name || 'Không có tên'}</Text>
                    {item.price !== undefined && (
                      <View style={styles.servicePriceContainer}>
                        <Text style={[styles.servicePrice, { backgroundColor: 'rgba(0, 0, 0, 0.05)', color: '#000000' }]}>
                          {item.price.toLocaleString('vi-VN')} VNĐ
                        </Text>
                        {title === 'Quà tặng' ? (
                          <Text style={styles.serviceMultiply}>
                            x {item.quantity || 1} = {(item.price * (item.quantity || 1)).toLocaleString('vi-VN')} VNĐ
                          </Text>
                        ) : multiplyByTables ? (
                          <Text style={styles.serviceMultiply}>
                            x {numberOfTables} bàn = {(item.price * numberOfTables).toLocaleString('vi-VN')} VNĐ
                          </Text>
                        ) : null}
                      </View>
                    )}
                    {item.description && (
                      <Text style={styles.serviceDescription}>
                        {item.description || 'Không có mô tả'}
                      </Text>
                    )}
                  </View>
                </View>
              ) : (
                <View key={index} style={styles.noDataContainer}>
                  <Icon name="alert-circle-outline" size={24} color="#000000" />
                  <Text style={styles.noDataText}>Dữ liệu không hợp lệ</Text>
                </View>
              )
            ))}
            <View style={[styles.sectionTotalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.05)' }]}>
              <Text style={[styles.sectionTotalLabel, { color: '#000000' }]}>Tổng chi phí</Text>
              <Text style={[styles.sectionTotal, { color: '#000000' }]}>
                {sectionTotal.toLocaleString('vi-VN')} VNĐ
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Icon name="information-outline" size={32} color="#000000" />
            <Text style={styles.noDataText}>Không có dữ liệu {title.toLowerCase()}</Text>
          </View>
        )}
      </View>
    );
  };

  if (ChitietPlanStatus === 'idle' && !routePlanData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Đang chuẩn bị...</Text>
          <Text style={styles.loadingSubText}>Vui lòng đợi một chút</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (ChitietPlanStatus === 'loading' && !routePlanData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          <Text style={styles.loadingSubText}>Chúng tôi đang lấy thông tin kế hoạch của bạn</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (ChitietPlanStatus === 'failed' && !routePlanData) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.errorContent}>
          <View style={styles.errorIconContainer}>
            <Icon name="close-circle-outline" size={70} color="#000000" />
          </View>
          <Text style={styles.errorTitle}>Đã xảy ra lỗi</Text>
          <Text style={styles.errorText}>{error || 'Không tìm thấy kế hoạch'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => dispatch(ChitietPlan(planId))}
          >
            <Icon name="refresh" size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
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
    const originalPlanId = planData.originalPlanId || planId;

    const navigateToEditPlan = (id, data) => {
      navigation.navigate('EditPlan', {
        planId: id,
        planData: {
          ...data,
          eventDate: data.eventDate || data.plandateevent,
          guestCount: data.guestCount || data.plansoluongkhach,
          budget: data.budget || data.planprice,
        },
      });
    };

    if (isOwner) {
      navigateToEditPlan(planId, planData);
    } else if (planData.isCopy && userIdFromPlan === userId) {
      navigateToEditPlan(planId, planData);
    } else {
      dispatch(duplicatePlan({ planId: originalPlanId, userId }))
        .unwrap()
        .then((newPlan) => {
          const combinedPlanData = {
            ...planData,
            _id: newPlan._id,
            UserId: userId,
            name: newPlan.name || `Copy of ${planData.name}`,
            plandateevent: newPlan.plandateevent || planData.plandateevent || planData.eventDate,
            createdAt: newPlan.createdAt,
            updatedAt: newPlan.updatedAt,
            caterings: planData.caterings || newPlan.caterings || [],
            decorates: planData.decorates || newPlan.decorates || [],
            presents: planData.presents || newPlan.presents || [],
            totalPrice: newPlan.totalPrice || calculatedTotalPrice,
            SanhId: planData.SanhId || newPlan.SanhId || null,
            plansoluongkhach: planData.plansoluongkhach || newPlan.plansoluongkhach || planData.guestCount || 0,
            planprice: planData.planprice || newPlan.planprice || planData.budget || 0,
            eventDate: planData.eventDate || newPlan.plandateevent,
            guestCount: planData.guestCount || newPlan.plansoluongkhach,
            budget: planData.budget || newPlan.planprice,
            isCopy: true,
            originalPlanId: originalPlanId,
          };
          navigateToEditPlan(newPlan._id, combinedPlanData);
          ToastAndroid.show('Đã tạo bản sao kế hoạch để chỉnh sửa!', ToastAndroid.SHORT);
        })
        .catch((err) => {
          ToastAndroid.show(`Lỗi khi tạo mới plan: ${err.message || err}`, ToastAndroid.SHORT);
        });
    }
  };

  const handleDeposit = () => {
    if (!planId) {
      ToastAndroid.show('Không thể đặt cọc: Thiếu planId', ToastAndroid.SHORT);
      return;
    }

    // Kiểm tra xem UserId có tồn tại không
    if (!planData.UserId) {
      ToastAndroid.show('Không thể đặt cọc: Kế hoạch chưa được liên kết với người dùng', ToastAndroid.SHORT);
      return;
    }

    if (planData.status === 'active') {
      ToastAndroid.show('Kế hoạch đã được kích hoạt, không thể đặt cọc!', ToastAndroid.SHORT);
    } else if (planData.status === 'pending') {
      ToastAndroid.show('Kế hoạch đang chờ xử lý, không thể đặt cọc!', ToastAndroid.SHORT);
    } else {
      navigation.navigate('Payos', { planId: planId, totalPrice: calculatedTotalPrice || planData.totalPrice });
    }
  };

  const sanhTotal = planData.SanhId && planData.SanhId.price ? parseFloat(planData.SanhId.price) : 0;
  const isDepositDisabled = planData.status === 'active' || planData.status === 'pending';

  // Tính giá tiền đặt cọc (10% tổng tiền)
  const totalPrice = fromGenPlan ? calculatedTotalPrice : (planData.totalPrice || 0);
  const depositPrice = totalPrice * 0.1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={22} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết kế hoạch</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("TabNavigation")}
          style={styles.backButton}
        >
          <Icon name="home" size={22} color="#000000" />
        </TouchableOpacity>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.planInfoCard}>
            <Text style={styles.planTitle}>{planData.name || 'Kế hoạch không tên'}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.planPrice}>
                {totalPrice.toLocaleString('vi-VN')} VNĐ
              </Text>
              <Text style={styles.planPriceLabel}>Tổng chi phí</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoContainer}>
              <Text style={styles.infoSectionTitle}>Thông tin chung</Text>

              <View style={styles.infoRow}>
                <Icon name="calendar-month" size={22} color="#000000" style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Ngày sự kiện</Text>
                  <Text style={styles.planDetail}>
                    {planData.eventDate || planData.plandateevent
                      ? new Date(planData.eventDate || planData.plandateevent).toLocaleDateString('vi-VN')
                      : 'Chưa xác định'}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Icon name="account-group" size={22} color="#000000" style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Số lượng khách</Text>
                  <Text style={styles.planDetail}>
                    {planData.plansoluongkhach || planData.guestCount || 'N/A'} khách (Dự kiến {numberOfTables} bàn)
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Icon name="cash-multiple" size={22} color="#000000" style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Ngân sách</Text>
                  <Text style={styles.planDetail}>
                    {(planData.planprice || planData.budget || 0).toLocaleString('vi-VN')} VNĐ
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Icon name="scale-balance" size={22} color="#000000" style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Chênh lệch ngân sách</Text>
                  <Text
                    style={[
                      styles.planDetail,
                      {
                        color: priceDifference > 0 ? '#43A047' : priceDifference < 0 ? '#E53935' : '#757575',
                      },
                    ]}
                  >
                    {priceDifference > 0 ? '+' : ''}{priceDifference.toLocaleString('vi-VN')} VNĐ
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {planData.SanhId && (
              <View style={styles.venueContainer}>
                <View style={styles.venueTitleRow}>
                  <Icon name="home-variant" size={26} color="#000000" />
                  <Text style={styles.venueTitle}>Thông tin sảnh cưới</Text>
                </View>
                {planData.SanhId.imageUrl && (
                  <Image source={{ uri: planData.SanhId.imageUrl }} style={styles.sanhImage} />
                )}
                <View style={styles.venueDetails}>
                  <View style={styles.venueDetailItem}>
                    <Icon name="tag" size={20} color="#000000" style={styles.venueItemIcon} />
                    <Text style={styles.venueItemText}>{planData.SanhId.name || 'Chưa có tên'}</Text>
                  </View>
                  <View style={styles.venueDetailItem}>
                    <Icon name="currency-usd" size={20} color="#000000" style={styles.venueItemIcon} />
                    <Text style={styles.venueItemText}>
                      Giá: {(planData.SanhId.price || 0).toLocaleString('vi-VN')} VNĐ
                    </Text>
                  </View>
                  <View style={styles.venueDetailItem}>
                    <Icon name="account-group" size={20} color="#000000" style={styles.venueItemIcon} />
                    <Text style={styles.venueItemText}>
                      Sức chứa: {planData.SanhId.SoLuongKhach || 'N/A'} khách
                    </Text>
                  </View>
                </View>
                <View style={styles.venueTotalContainer}>
                  <Text style={styles.venueTotal}>
                    {sanhTotal.toLocaleString('vi-VN')} VNĐ
                  </Text>
                  <Text style={styles.venueTotalLabel}>Tổng chi phí sảnh</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {renderServiceItem('Dịch vụ ăn uống', planData.caterings, 'food-fork-drink', '#000000', true)}
          {renderServiceItem('Trang trí', planData.decorates, 'flower', '#333333', false)}
          {renderServiceItem('Quà tặng', planData.presents, 'gift', '#000000', false)}
        </Animated.View>
      </ScrollView>

      <View style={styles.persistentBottomBar}>
        <TouchableOpacity
          style={[
            styles.bottomBarButton,
            !planData?.UserId && styles.fullWidthButton, // Nếu không có UserId, nút chỉnh sửa chiếm toàn bộ chiều rộng
          ]}
          onPress={handleEditPlan}
        >
          
          <Text style={styles.bottomBarButtonText}>Chỉnh sửa</Text>
        </TouchableOpacity>
        {planData?.UserId && (
          <TouchableOpacity
            style={[
              styles.bottomBarButton,
              styles.depositBottomBarButton,
              isDepositDisabled && styles.disabledBottomBarButton,
            ]}
            onPress={handleDeposit}
            disabled={isDepositDisabled}
          >
            <View style={styles.depositButtonContent}>
              <View style={styles.depositTextContainer}>
                <Text style={styles.bottomBarButtonText}>
                  {planData.status === 'active' ? 'Đã kích hoạt' : planData.status === 'pending' ? 'Đang chờ' : 'Đặt cọc'}
                </Text>
                <Text style={styles.depositPriceText}>
                  {depositPrice.toLocaleString('vi-VN')} VNĐ
                </Text>
              </View>
              
            </View>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default DetailPlan;

const styles = StyleSheet.create({
  fullWidthButton: {
    flex: 1, // Chiếm toàn bộ không gian khi không có nút đặt cọc
    marginHorizontal: 0, // Xóa margin để nút đầy chiều rộng
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'sans-serif-medium',
  },
  planInfoCard: {
    padding: 0,
    marginBottom: 10,
    marginTop: 10,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  priceContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },
  planPriceLabel: {
    fontSize: 14,
    color: '#000000',
    marginTop: 4,
  },
  venueContainer: {
    padding: 0,
    marginBottom: 10,
    marginTop: 10,
  },
  venueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  venueTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 10,
  },
  sanhImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 16,
  },
  venueDetails: {
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    padding: 15,
  },
  venueDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  venueItemIcon: {
    marginRight: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 8,
    borderRadius: 8,
  },
  venueItemText: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
  },
  venueTotalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 8,
  },
  venueTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'right',
  },
  venueTotalLabel: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'right',
    marginBottom: 6,
  },
  infoContainer: {
    padding: 0,
    marginBottom: 10,
    marginTop: 10,
  },
  infoSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#000000',
  },
  infoIcon: {
    marginRight: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 6,
    borderRadius: 8,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  planDetail: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    paddingBottom: 12,
  },
  sectionIconContainer: {
    marginRight: 12,
    padding: 8,
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 12,
  },
  serviceContent: {
    flex: 1,
    justifyContent: 'center',
  },
  serviceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 6,
  },
  servicePriceContainer: {
    flexDirection: 'column',
    marginBottom: 6,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  serviceMultiply: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: 13,
    color: '#757575',
    lineHeight: 18,
  },
  serviceImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTotalContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  sectionTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sectionTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  noDataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    marginBottom: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  noDataText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  loadingContent: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    padding: 30,
    borderRadius: 10,
    maxWidth: 500,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#000000',
    fontWeight: 'bold',
  },
  loadingSubText: {
    marginTop: 10,
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  errorContent: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    padding: 30,
    borderRadius: 10,
    maxWidth: 500,
  },
  errorIconContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 20,
    borderRadius: 50,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: width - 120,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 24,
  },
  persistentBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    height: 70,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  bottomBarButton: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
    flexDirection: 'row',
    height: 50,
  },
  depositBottomBarButton: {
    backgroundColor: '#333333',
  },
  disabledBottomBarButton: {
    opacity: 0.5,
  },
  bottomBarButtonIcon: {
    marginRight: 8,
  },
  bottomBarButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  depositButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  depositTextContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  depositPriceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});