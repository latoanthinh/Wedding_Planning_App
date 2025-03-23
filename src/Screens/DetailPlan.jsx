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
  const { planId, planData: routePlanData } = route?.params || {}; // Lấy planData từ route.params
  const dispatch = useDispatch();
  const { ChitietPlanData, ChitietPlanStatus, error } = useSelector((state) => state.chitietplan);
  const { user } = useContext(AppContext);
  const userId = user._id;

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (routePlanData) {
      // Nếu có dữ liệu từ route.params, không cần gọi API
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else if (planId) {
      // Nếu không có routePlanData, gọi API
      dispatch(ChitietPlan(planId))
        .unwrap()
        .catch((err) => {
          ToastAndroid.show(`Lỗi tải chi tiết kế hoạch: ${err.message || err}`, ToastAndroid.SHORT);
        });
    } else {
      ToastAndroid.show('Không có ID kế hoạch để tải chi tiết!', ToastAndroid.SHORT);
    }
    return () => {
      dispatch(resetChitietPlan());
    };
  }, [dispatch, planId, routePlanData]); // Thêm routePlanData vào dependency

  useEffect(() => {
    if (ChitietPlanStatus === 'succeeded' && !routePlanData) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [ChitietPlanStatus, routePlanData]);

  useEffect(() => {
    if (error) {
      ToastAndroid.show(`Lỗi: ${error}`, ToastAndroid.SHORT);
    }
  }, [error]);

  // Sử dụng routePlanData nếu có, nếu không thì dùng ChitietPlanData
  const planData = routePlanData || (ChitietPlanData?.plan ? ChitietPlanData.plan : ChitietPlanData) || {};
  

  const renderServiceItem = (title, services, iconName, color) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Icon name={iconName} size={24} color={color} style={styles.sectionIcon} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {services && services.length > 0 ? (
        services.map((item, index) => (
          item ? ( // Kiểm tra item có tồn tại
            <View key={index} style={styles.serviceCard}>
              {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.serviceImage} />
              )}
              <View style={styles.serviceContent}>
                <Text style={styles.serviceText}>{item.name || 'Không có tên'}</Text>
                {item.price !== undefined && (
                  <Text style={styles.servicePrice}>
                    Giá: {item.price.toLocaleString('vi-VN')} VNĐ
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
        ))
      ) : (
        <Text style={styles.noDataText}>Không có dữ liệu</Text>
      )}
    </View>
  );

  if (ChitietPlanStatus === 'loading' && !routePlanData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
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
  
    // Kiểm tra UserId là chuỗi hay object
    const userIdFromPlan = typeof planData.UserId === 'string' ? planData.UserId : planData.UserId?._id;
    const isOwner = userIdFromPlan && userIdFromPlan.toString() === userId.toString();
  
    if (isOwner) {
      navigation.navigate('EditPlan', { planId: planId, planData });
    } else {
      dispatch(duplicatePlan({ planId: planId, userId }))
        .unwrap()
        .then((newPlan) => {
          const combinedPlanData = {
            ...planData,
            _id: newPlan._id,
            UserId: userId, // Đảm bảo UserId là chuỗi
            name: newPlan.name || `Copy of ${planData.name}`,
            plandateevent: newPlan.plandateevent || planData.plandateevent,
            createdAt: newPlan.createdAt,
            updatedAt: newPlan.updatedAt,
            caterings: planData.caterings || newPlan.caterings || [],
            decorates: planData.decorates || newPlan.decorates || [],
            presents: planData.presents || newPlan.presents || [],
          };
          navigation.navigate('EditPlan', { planId: newPlan._id, planData: combinedPlanData });
          ToastAndroid.show('Đã tạo bản sao kế hoạch để chỉnh sửa!', ToastAndroid.SHORT);
        })
        .catch((err) => {
          console.log('Lỗi khi tạo bản sao:', err);
          ToastAndroid.show(`Lỗi khi tạo mới plan: ${err}`, ToastAndroid.SHORT);
        });
    }
  };

  const handleDeposit = () => {
    navigation.navigate('DepositPlan', { planId: planId, totalPrice: planData.totalPrice });
  };

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
                <Icon name="home" size={20} color="#FF6F61" style={styles.infoIcon} />
                <View style={styles.infoContent}>
                  <Text style={styles.planDetail}>Sảnh: {planData.SanhId.name || 'N/A'}</Text>
                  <Text style={styles.planSubDetail}>
                    Giá: {(planData.SanhId.price || 0).toLocaleString('vi-VN')} VNĐ
                  </Text>
                  <Text style={styles.planSubDetail}>
                    Số lượng khách: {planData.SanhId.SoLuongKhach || 'N/A'}
                  </Text>
                  {planData.SanhId.imageUrl && (
                    <Image
                      source={{ uri: planData.SanhId.imageUrl }}
                      style={styles.sanhImage}
                    />
                  )}
                </View>
              </View>
            )}
            <View style={styles.infoRow}>
              <Icon name="calendar" size={20} color="#FF6F61" style={styles.infoIcon} />
              <Text style={styles.planDetail}>
                Ngày sự kiện: {planData.plandateevent
                  ? new Date(planData.plandateevent).toLocaleDateString('vi-VN')
                  : 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="account-group" size={20} color="#FF6F61" style={styles.infoIcon} />
              <Text style={styles.planDetail}>
                Số lượng khách: {planData.plansoluongkhach || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="cash" size={20} color="#FF6F61" style={styles.infoIcon} />
              <Text style={styles.planDetail}>
                Ngân sách: {(planData.planprice || 0).toLocaleString('vi-VN')} VNĐ
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.editButton} onPress={handleEditPlan}>
                <Icon name="pencil" size={20} color="#FFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Chỉnh sửa Plan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.depositButton} onPress={handleDeposit}>
                <Icon name="cash-plus" size={20} color="#FFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Đặt cọc</Text>
              </TouchableOpacity>
            </View>
          </View>

          {renderServiceItem('Dịch vụ ăn uống', planData.caterings, 'food-fork-drink', '#FF6F61')}
          {renderServiceItem('Trang trí', planData.decorates, 'flower', '#FFB300')}
          {renderServiceItem('Quà tặng', planData.presents, 'gift', '#4CAF50')}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles giữ nguyên như bạn đã cung cấp
const styles = StyleSheet.create({
  homeIcon: {
    width: 22,
    height: 22,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#F5F5F5',
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
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FF6F61',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    marginBottom: 20,
  },
  backButton: {
    width: 22,
    height: 22,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  planInfoCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF6F61',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  planDetail: {
    fontSize: 16,
    color: '#666',
  },
  planSubDetail: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  sanhImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginTop: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  serviceCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  serviceContent: {
    flex: 1,
  },
  serviceText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginBottom: 5,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6F61',
    marginBottom: 5,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
  },
  depositButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DetailPlan;