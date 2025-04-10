import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, ScrollView, Modal, Animated } from 'react-native';
import React, { useEffect, useContext, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserFavorites, resetFavorites, removeFavoriteItem } from '../redux/FavoriteDeanAddSlice';
import { AppContext } from '../AppContext';
import LoadingIndicator from '../components/LoadingIndicator';

// Custom Icon Component for CustomAlert
const CustomIcon = ({ type }) => {
  const iconStyles = [styles.iconBase];
  let iconContent = '!'; // Default icon content

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

const Favorites = ({ navigation }) => {
  const dispatch = useDispatch();
  const { data, status, error } = useSelector((state) => state.favoriteset);
  const { user } = useContext(AppContext);
  const userId = user?._id;

  // State for Custom Alert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('info');
  const [alertActions, setAlertActions] = useState(null);

  // Custom alert function
  const showAlert = (title, message, type = 'info', actions = null) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertActions(actions);
    setAlertVisible(true);
  };

  useEffect(() => {
    if (!userId) {
      navigation.navigate('LoginScreen');
    } else {
      dispatch(resetFavorites());
      dispatch(fetchUserFavorites(userId));
    }
  }, [dispatch, userId, navigation]);

  const flattenData = Array.isArray(data) ? data.flat() : [];
  const validatedData = Array.from(
    new Map(flattenData.map((item) => [item._id, item])).values()
  );

  const groupedData = validatedData.reduce((acc, item) => {
    const type = item.type || 'unknown';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {});

  const formatPrice = (price) => {
    return price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ' : '0 VNĐ';
  };

  const handleRetry = () => {
    if (userId) {
      dispatch(fetchUserFavorites(userId));
    }
  };

  const handleRemoveFavorite = (item) => {
    if (userId && item.itemId && item.type) {
      showAlert(
        'Xác nhận',
        'Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách yêu thích?',
        'warning',
        [
          {
            text: 'Hủy',
            onPress: () => {
              // No action needed, just close the alert
            },
          },
          {
            text: 'Xóa',
            onPress: () => {
              dispatch(removeFavoriteItem({ userId, type: item.type, itemId: item.itemId }))
                .catch((error) => {
                  console.error('Lỗi khi xóa mục yêu thích:', error);
                  showAlert('Lỗi', 'Không thể xóa mục yêu thích, vui lòng thử lại.', 'error');
                });
            },
          },
        ]
      );
    } else {
      showAlert('Lỗi', 'Thông tin không hợp lệ.', 'error');
    }
  };

  const handleNavigateToDetail = (item) => {
    const detailScreens = {
      Sanh: 'HallWeddings',
      catering: 'FoodDetail',
      decorate: 'DecorDetail',
      present: 'GiftDetail',
    };

    const idParams = {
      Sanh: 'productIdHall',
      catering: 'Id',
      decorate: 'decorId',
      present: 'GitflId',
    };

    const screen = detailScreens[item.type] || 'ItemDetail';
    const idToPass = item.itemId || item._id;
    const idParamName = idParams[item.type] || 'itemId';

    console.log(`Điều hướng đến: ${screen}, ${idParamName}: ${idToPass}, type: ${item.type}`);
    console.log('Dữ liệu item đầy đủ:', JSON.stringify(item, null, 2));

    if (!idToPass) {
      console.warn('Không có itemId hoặc _id để điều hướng:', item);
      showAlert('Lỗi', 'Không thể điều hướng do thiếu ID.', 'error');
      return;
    }

    try {
      const params = {
        [idParamName]: idToPass,
        type: item.type,
        item: item,
      };

      navigation.navigate(screen, params);
    } catch (err) {
      console.error('Lỗi điều hướng:', err);
      showAlert('Lỗi', 'Không thể điều hướng đến trang chi tiết.', 'error');
    }
  };

  const renderItem = ({ item }) => {
    if (!item || typeof item !== 'object' || !item._id) {
      console.warn('Dữ liệu item không hợp lệ:', item);
      return null;
    }

    console.log('Rendering item:', item);

    return (
      <View style={styles.itemCard}>
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => handleNavigateToDetail(item)}
        >
          <Image
            source={{ uri: item.image || item.imageUrl || 'https://via.placeholder.com/90' }}
            style={styles.itemImage}
            resizeMode="cover"
          />
          <View style={styles.itemContent}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.name || 'Không có tên'}
            </Text>
            <View style={styles.itemDetails}>
              <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleRemoveFavorite(item)}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSection = (title, items) => {
    if (!items || items.length === 0) return null;

    console.log(`Rendering section: ${title}, items:`, items);

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item, index) => item?._id?.toString() || `fallback-${index}`}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>♡</Text>
      </View>
      <Text style={styles.emptyTitle}>Không có mục yêu thích</Text>
      <Text style={styles.emptyMessage}>Hãy thêm sản phẩm vào danh sách yêu thích của bạn</Text>
    </View>
  );

  if (status === 'loading') {
    return <LoadingIndicator text="Đang tải..." useLottie={true} />;
  }

  if (status === 'failed') {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <Text style={styles.errorIcon}>!</Text>
        </View>
        <Text style={styles.errorText}>Lỗi: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sections = [
    { title: 'Sảnh', items: groupedData['Sanh'] || [], type: 'Sanh' },
    { title: 'Món ăn', items: groupedData['catering'] || [], type: 'catering' },
    { title: 'Trang trí', items: groupedData['decorate'] || [], type: 'decorate' },
    { title: 'Quà tặng', items: groupedData['present'] || [], type: 'present' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh sách yêu thích</Text>
      </View>

      {validatedData.length === 0 ? (
        renderEmpty()
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {sections.map((section, index) => (
            <View key={section.type || index}>
              {renderSection(section.title, section.items)}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Custom Alert Component */}
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

// Styles (merged with CustomAlert styles)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Playfair_me',
    color: '#000',
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Playfair_me',
    color: '#000',
    fontWeight: '700',
    marginHorizontal: 12,
    marginBottom: 10,
  },
  itemCard: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 12,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  itemContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
    height: 80,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Playfair_me',
    color: '#000',
    fontWeight: '600',
    lineHeight: 22,
  },
  itemDetails: {
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontFamily: 'Playfair_me',
    color: '#FF6F61',
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#FF6F61',
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
  },
  emptyIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 40,
    color: '#CCCCCC',
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Playfair_me',
    color: '#000',
  },
  emptyMessage: {
    fontSize: 16,
    fontFamily: 'Playfair_me',
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 111, 97, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 40,
    color: '#FF6F61',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF6F61',
    fontSize: 16,
    fontFamily: 'Playfair_me',
    marginVertical: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF6F61',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 2,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Playfair_me',
    fontWeight: '600',
  },
  // Custom Icon Styles
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
  // Custom Alert Styles
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
});


export default Favorites;