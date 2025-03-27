import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import WebView from 'react-native-webview';
import CryptoJS from 'crypto-js';
import { AppContext } from '../AppContext';


const Payos = ({ route, navigation }) => { // Thêm route và navigation vào tham số
  const { planId } = route.params || {}; // Lấy planId từ route.params
  const clientID = 'd851a1c7-f29f-43fd-a51f-cabc526edab2';
  const apiKey = '4c732585-b003-45f0-a686-127b794c3a5e';
  const checkSum = 'd31e918a6c1be81129af70962f6478884b694c1ad3a4c60d2c0f196134d962d9';

  const [paymentLink, setPaymentLink] = useState('');
  const [orderCode, setOrderCode] = useState(null);
  const { user } = useContext(AppContext);
  const userId = user?._id;
  const [transactionSaved, setTransactionSaved] = useState(false);

  useEffect(() => {
    console.log('Route params trong Payos:', route.params); // Log để kiểm tra
    if (!planId) {
      console.log('Lỗi: planId không được truyền vào Payos.');
    }
    if (!userId) {
      console.log('Lỗi: userId không lấy được từ AppContext.');
    }
  }, [planId, userId, route.params]);

  const Payment = async () => {
    const amount = 5000;
    const cancelUrl = 'https://abc123.ngrok.io/cancel'; // Thay bằng URL thực tế
    const description = 'Đơn hàng của Bikerrrr nè';
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
        Alert.alert('Lỗi', 'Không thể tạo link thanh toán.');
      }
    } catch (error) {
      console.log('Lỗi PayOS:', error.message);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi kết nối với PayOS.');
    }
  };

  const saveTransaction = async (depositAmount) => {
    if (!userId || !planId) {
      Alert.alert('Lỗi', 'Thiếu userId hoặc planId.');
     
      return;
    }

    const transactionData = { planId, userId, depositAmount };
    console.log('Dữ liệu gửi đi:', transactionData);

    try {
      const response = await axios.post('https://apidatn.onrender.com/users/transactions', transactionData);
      console.log('Giao dịch đã được lưu:', response.data);
      
    } catch (error) {
      console.error('Lỗi khi lưu giao dịch:', error.response ? error.response.data : error.message);
      if (error.response?.status === 500) {
        Alert.alert('Lỗi', 'Server gặp lỗi. Vui lòng kiểm tra backend.');
      } else if (error.response?.status === 404) {
        Alert.alert('Lỗi', 'Không tìm thấy endpoint /transactions.');
      } else {
        Alert.alert('Lỗi', `Không thể lưu giao dịch: ${error.message}`);
      }
    }
  };

  const handleNavigationChange = (navState) => {
    const { url } = navState;
    console.log('URL hiện tại:', url);
    
    if (url.includes('/success') && !transactionSaved) {
      setTransactionSaved(true); // Đánh dấu đã gửi giao dịch
      Alert.alert('Thành công', 'Bạn đã thanh toán thành công', [
        { text: 'OK', onPress: () => saveTransaction(5000) },
      ]);
    } else if (url.includes('/cancel')) {
      Alert.alert('Thất bại', 'Đã hủy thanh toán.');
      setPaymentLink('');
    }
  };

  const handleGoBack = () => {
    setPaymentLink('');
    setOrderCode(null);
    navigation.goBack(); // Quay lại màn hình trước (DetailPlan)
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
          <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
            <Text style={styles.buttonText}>Quay Lại</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.initialContainer}>
          <Text style={styles.title}>Thanh Toán Với PayOS</Text>
          <Text style={styles.subtitle}>Nhấn nút dưới đây để bắt đầu thanh toán</Text>
          <TouchableOpacity style={styles.payButton} onPress={Payment}>
            <Text style={styles.buttonText}>Thanh Toán Ngay</Text>
          </TouchableOpacity>
        </View>
      )}
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
});