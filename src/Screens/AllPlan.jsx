import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';
import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plan, deletePlan, cancelPlan } from '../redux/GetAllPlanSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../AppContext';
import { useBackHandler } from '../hooks/useBackHandler';

// Custom Icon Component
const CustomIcon = ({ type }) => {
  const iconStyles = [styles.iconBase];
  let iconContent = '!';

  switch (type) {
    case 'success':
      iconStyles.push(styles.successIcon);
      iconContent = '✓';
      break;
    case 'error':
      iconStyles.push(styles.errorIcon);
      iconContent = '✕';
      break;
    case 'warning':
      iconStyles.push(styles.warningIcon);
      iconContent = '!';
      break;
    case 'info':
      iconStyles.push(styles.infoIcon);
      iconContent = 'i';
      break;
    default:
      iconStyles.push(styles.defaultIcon);
  }

  return (
    <View style={iconStyles}>
      <Text style={styles.iconText}>{iconContent}</Text>
    </View>
  );
};

// Custom Alert Component
const CustomAlert = ({ visible, title, message, type, onClose, actions }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getHeaderColor = () => {
    switch (type) {
      case 'success':
        return '#E8F5E9';
      case 'error':
        return '#FFEBEE';
      case 'warning':
        return '#FFF8E1';
      case 'info':
        return '#E3F2FD';
      default:
        return '#F5F5F5';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={closeModal}
    >
      <View style={styles.alertOverlay}>
        <Animated.View
          style={[
            styles.alertContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={[styles.alertHeader, { backgroundColor: getHeaderColor() }]}>
            <View style={styles.alertIconContainer}>
              <CustomIcon type={type} />
            </View>
          </View>

          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>{title}</Text>
            <Text style={styles.alertMessage}>{message}</Text>

            <View style={styles.alertActions}>
              {actions ? (
                actions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.alertButton, { backgroundColor: getButtonColor() }]}
                    onPress={() => {
                      closeModal();
                      action.onPress && action.onPress();
                    }}
                  >
                    <Text style={styles.alertButtonText}>{action.text}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <TouchableOpacity
                  style={[styles.alertButton, { backgroundColor: getButtonColor() }]}
                  onPress={closeModal}
                >
                  <Text style={styles.alertButtonText}>Đóng</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const AllPlan = ({ navigation }) => {
  const dispatch = useDispatch();
  const { AllPlanData = [], AllPlanStatus, deleteStatus, cancelStatus, error } = useSelector((state) => state.plan);
  const { user, isLoading: contextLoading } = useContext(AppContext);
  const userId = user?._id;
  const [loading, setLoading] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('info');
  const [alertActions, setAlertActions] = useState(null);

  const showAlert = (title, message, type = 'info', actions = null) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertActions(actions);
    setAlertVisible(true);
  };

  useBackHandler(navigation, 'TabNavigation', { screen: 'Setting' });

  const handleDeletePlan = useCallback(
    (planId) => {
      showAlert(
        'Xác nhận xóa',
        'Bạn có chắc muốn xóa kế hoạch này?',
        'warning',
        [
          {
            text: 'Hủy',
            onPress: () => {},
          },
          {
            text: 'Xóa',
            onPress: async () => {
              try {
                await dispatch(deletePlan({ userId, planId })).unwrap();
                showAlert('Thành công', 'Kế hoạch đã được xóa', 'success');
              } catch (error) {
                showAlert('Lỗi', `Không thể xóa kế hoạch: ${error}`, 'error');
              }
            },
          },
        ]
      );
    },
    [dispatch, userId]
  );

  const handleCancelPlan = useCallback(
    (planId) => {
      showAlert(
        'Xác nhận hủy',
        'Bạn có chắc muốn hủy kế hoạch này? Trạng thái sẽ được cập nhật thành "Đã hủy".',
        'warning',
        [
          {
            text: 'Đóng',
            onPress: () => {},
          },
          {
            text: 'Hủy kế hoạch',
            onPress: async () => {
              try {
                await dispatch(cancelPlan(planId)).unwrap();
                showAlert('Thành công', 'Kế hoạch đã được hủy', 'success');
              } catch (error) {
                showAlert('Lỗi', `Không thể hủy kế hoạch: ${error}`, 'error');
              }
            },
          },
        ]
      );
    },
    [dispatch]
  );

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
        const result = await dispatch(Plan(userId)).unwrap();
        console.log('Fetched Plans:', result);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách kế hoạch:', error);
        // Xử lý lỗi 404: Không có kế hoạch
        if (error.message?.includes('404')) {
          // Giả lập trạng thái rỗng
          dispatch({
            type: 'plan/getAllPlan/fulfilled',
            payload: [],
          });
        }
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
      try {
        if (!user || !item || !item._id) {
          console.log('Invalid item or user, skipping render:', item);
          return null;
        }

        const status = item.status ? item.status.toLowerCase() : '';
        const showDeleteButton = status === 'chưa đặt cọc';
        const showCancelButton = status === 'đang chờ';

        return (
          <TouchableOpacity
            onPress={() => navigation.navigate('DetailPlan', { planId: item._id, fromGenPlan: false })}
            style={styles.cardContainer}
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.productName}>{(item.name || 'Kế hoạch không tên').slice(0, 20)}</Text>
                <View style={styles.statusBadgeContainer}>
                  <View
                    style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}
                  >
                    <Text style={styles.statusText}>{item.status || 'Chưa có trạng thái'}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.cardDivider} />
              <View style={styles.cardFooter}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Tổng tiền:</Text>
                  <Text style={styles.productPrice}>{formatPrice(item.totalPrice)}đ</Text>
                </View>
                <View style={styles.buttonsContainer}>
                  {showCancelButton && (
                    <TouchableOpacity
                      style={[styles.cancelButton, cancelStatus === 'loading' && styles.cancelButtonDisabled]}
                      onPress={() => handleCancelPlan(item._id)}
                      disabled={cancelStatus === 'loading'}
                    >
                      <Text style={styles.cancelButtonText}>Hủy</Text>
                    </TouchableOpacity>
                  )}
                  {showDeleteButton && (
                    <TouchableOpacity
                      style={[styles.deleteButton, deleteStatus === 'loading' && styles.deleteButtonDisabled]}
                      onPress={() => handleDeletePlan(item._id)}
                      disabled={deleteStatus === 'loading'}
                    >
                      <Text style={styles.deleteButtonText}>Xóa</Text>
                    </TouchableOpacity>
                  )}
                  <View style={styles.detailButton}>
                    <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      } catch (error) {
        console.error('Error rendering PlanCard:', error);
        return null;
      }
    },
    [navigation, user, handleDeletePlan, handleCancelPlan, deleteStatus, cancelStatus]
  );

  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') || '0';
  };

  const getStatusColor = (status) => {
    if (!status) return '#9E9E9E';
    switch (status.toLowerCase()) {
      case 'đã đặt cọc':
        return '#4CAF50';
      case 'chưa đặt cọc':
        return '#2196F3';
      case 'đang chờ':
        return '#FF9800';
      case 'đã hủy':
        return '#F44336';
      case 'đang chờ xác nhận':
        return '#FFC107';
      default:
        return '#9E9E9E';
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
    if (!user) {
      console.log('No user, rendering null');
      return null;
    }

    if (loading || AllPlanStatus === 'loading') {
      console.log('Rendering loading state');
      return renderLoading();
    }

    const filteredPlanData = AllPlanData?.filter(
      (item) => item && item._id && typeof item._id === 'string'
    ) || [];

    console.log('Filtered Plan Data:', filteredPlanData);

    if (!filteredPlanData.length) {
      console.log('No plans, rendering empty state');
      return (
        <View style={styles.statusContainer}>
          <Image
            source={require('../Assets/Images/home48.png')}
            style={[styles.statusIcon, { tintColor: '#9E9E9E' }]}
          />
          <Text style={styles.statusMessage}>Bạn hãy tạo kế hoạch mới!</Text>
          
        </View>
      );
    }

    console.log('Rendering plan list');
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
    return <SafeAreaView style={styles.container}>{renderLoading()}</SafeAreaView>;
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
          <Text style={styles.createPlanButtonText}>Tạo kế hoạch mới</Text>
        </TouchableOpacity>
      </View>
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertVisible(false)}
        actions={alertActions}
      />
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
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
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
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginRight: 8,
    shadowColor: '#222222',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButtonDisabled: {
    backgroundColor: '#FF9800',
    opacity: 0.5,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginRight: 8,
    shadowColor: '#222222',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonDisabled: {
    backgroundColor: '#F44336',
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
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
  createPlanButtonEmpty: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginTop: 10,
    alignSelf: 'center',
  },
  createPlanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  alertHeader: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    padding: 20,
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  alertButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 120,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  iconBase: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    backgroundColor: '#4CAF50',
  },
  errorIcon: {
    backgroundColor: '#F44336',
  },
  warningIcon: {
    backgroundColor: '#FF9800',
  },
  infoIcon: {
    backgroundColor: '#2196F3',
  },
  defaultIcon: {
    backgroundColor: '#757575',
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AllPlan;