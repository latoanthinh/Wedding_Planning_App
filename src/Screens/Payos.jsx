import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, Animated } from 'react-native';
import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import WebView from 'react-native-webview';
import CryptoJS from 'crypto-js';
import { AppContext } from '../AppContext';

// Custom Icon Component instead of using libraries
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

  // Background color based on alert type
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

  // Button color based on alert type
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

const Payos = ({ route, navigation }) => {
  const { planId, planData } = route.params || {}; // Thêm planData nếu cần truyền dữ liệu kế hoạch
  const clientID = 'd851a1c7-f29f-43fd-a51f-cabc526edab2';
  const apiKey = '4c732585-b003-45f0-a686-127b794c3a5e';
  const checkSum = 'd31e918a6c1be81129af70962f6478884b694c1ad3a4c60d2c0f196134d962d9';

  const [paymentLink, setPaymentLink] = useState('');
  const [orderCode, setOrderCode] = useState(null);
  const { user } = useContext(AppContext);
  const userId = user?._id;
  const [transactionSaved, setTransactionSaved] = useState(false);
  
  // Add states for custom alert
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
    console.log('Route params trong Payos:', route.params);
    if (!planId) {
      console.log('Lỗi: planId không được truyền vào Payos.');
    }
    if (!userId) {
      console.log('Lỗi: userId không lấy được từ AppContext.');
    }
  }, [planId, userId, route.params]);

  const Payment = async () => {
    const amount = 5000;
    const cancelUrl = 'https://abc123.ngrok.io/cancel';
    const description = 'đặt cọc ';
    const newOrderCode = Date.now();
    const returnUrl = 'https://abc123.ngrok.io/success';

    const dataString = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${newOrderCode}&returnUrl=${returnUrl}`;
    const signature = CryptoJS.HmacSHA256(dataString, checkSum).toString(CryptoJS.enc.Hex);

    const body = {
      orderCode: newOrderCode,
      amount: amount,
      description: description,
      cancelUrl: cancelUrl,
      returnUrl: returnUrl,
      signature: signature,
    };

    try {
      const response = await axios.post('https://api-merchant.payos.vn/v2/payment-requests', body, {
        headers: {
          'x-client-id': clientID,
          'x-api-key': apiKey,
        },
      });
      console.log('Phản hồi từ PayOS:', response.data);
      if (response.data.code === '00') {
        setPaymentLink(response.data.data.checkoutUrl);
        setOrderCode(newOrderCode);
      } else {
        console.log('Lỗi rùi!! :(');
        showAlert('Thông báo', 'Không thể tạo link thanh toán.', 'error');
      }
    } catch (error) {
      console.log('Lỗi PayOS:', error.message);
      showAlert('Thông báo', 'Có lỗi xảy ra khi kết nối với PayOS.', 'error');
    }
  };

  const saveTransaction = async (depositAmount) => {
    if (!userId || !planId) {
      showAlert('Thông báo', 'Thiếu userId hoặc planId.', 'error');
      throw new Error('Thiếu userId hoặc planId');
    }

    const transactionData = { planId, userId, depositAmount };
    console.log('Dữ liệu gửi đi:', transactionData);

    try {
      const response = await axios.post('https://apidatn.onrender.com/users/transactions', transactionData);
      console.log('Giao dịch đã được lưu:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lưu giao dịch:', error.response ? error.response.data : error.message);
      let errorMessage = 'Không thể lưu giao dịch';
      
      if (error.response?.status === 500) {
        errorMessage = 'Server gặp lỗi. Vui lòng kiểm tra backend.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy endpoint /transactions.';
      } else {
        errorMessage = `Không thể lưu giao dịch: ${error.message}`;
      }
      
      showAlert('Thông báo', errorMessage, 'error');
      throw error;
    }
  };

  const handleNavigationChange = (navState) => {
    const { url } = navState;
    console.log('URL hiện tại:', url);

    if (url.includes('/success') && !transactionSaved) {
      setTransactionSaved(true);
      saveTransaction(5000)
        .then(() => {
          showAlert(
            'Thành công',
            'Bạn đã thanh toán thành công!',
            'success',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('AllPlan'),
              },
            ]
          );
        })
        .catch((error) => {
          showAlert(
            'Thông báo',
            `Thanh toán thành công nhưng không thể lưu giao dịch: ${error.message}`,
            'warning'
          );
        });
    } else if (url.includes('/cancel')) {
      showAlert(
        'Thông báo',
        'Bạn đã hủy thanh toán.',
        'warning',
        [
          {
            text: 'OK',
            onPress: () => {
              // Quay về màn hình Detail với planId và planData (nếu có)
              navigation.goBack();
            },
          },
        ]
      );
      setPaymentLink(''); // Xóa paymentLink để quay về giao diện ban đầu
      setOrderCode(null); // Reset orderCode
    }
  };

  const handleGoBack = () => {
    setPaymentLink('');
    setOrderCode(null);
    navigation.goBack(); // Quay về Detail khi nhấn nút "Quay lại"
  };

  return (
    <View style={styles.container}>
      {paymentLink ? (
        <>
          <ScrollView contentContainerStyle={styles.webViewContainer}>
            <WebView
              source={{ uri: paymentLink }}
              style={styles.webView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              onNavigationStateChange={handleNavigationChange}
            />
          </ScrollView>
          
        </>
      ) : (
        <View style={styles.initialContainer}>
          <Text style={styles.title}>Thanh Toán Với PayOS</Text>
          <Text style={styles.subtitle}>Nhấn nút dưới đây để bắt đầu thanh toán</Text>
          <TouchableOpacity style={styles.payButton} onPress={Payment}>
            <Text style={styles.buttonText}>Thanh Toán Ngay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
            <Text style={styles.buttonText}>Quay Lại</Text>
          </TouchableOpacity>
        </View>
        
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
    </View>
  );
};

export default Payos;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  initialContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  payButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  goBackButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    margin: 20,
    alignSelf: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  webViewContainer: {
    flexGrow: 1,
  },
  webView: {
    width: '100%',
    height: 600,
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