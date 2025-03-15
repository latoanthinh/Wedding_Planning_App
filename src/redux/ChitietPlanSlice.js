import React, { useRef, useEffect, useState } from 'react';
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
import { ChitietPlan, resetChitietPlan } from '../redux/ChitietPlanSlice';

const { width } = Dimensions.get('window');

const DetailPlan = ({ navigation, route }) => {
  const { DetailPlanId } = route?.params || {};
  const dispatch = useDispatch();
  const { ChitietPlanData, ChitietPlanStatus, error } = useSelector((state) => state.chitietplan);

  const fadeAnim = useRef(new Animated.Value(0)).current; // Animation cho fade in

  // Gọi API khi component mount hoặc khi DetailPlanId thay đổi
  useEffect(() => {
    if (DetailPlanId) {
      dispatch(ChitietPlan(DetailPlanId));
    }
    return () => {
      dispatch(resetChitietPlan()); // Reset state khi rời màn hình
    };
  }, [dispatch, DetailPlanId]);

  // Xử lý animation khi dữ liệu được tải xong
  useEffect(() => {
    if (ChitietPlanStatus === 'succeeded') {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [ChitietPlanStatus]);

  // Hiển thị Toast khi có lỗi
  useEffect(() => {
    if (error) {
      ToastAndroid.show(`Lỗi: ${error}`, ToastAndroid.SHORT);
    }
  }, [error]);

  // Hàm render item dịch vụ
  const renderServiceItem = (title, services) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {services && services.length > 0 ? (
        services.map((item, index) => (
          <View key={index} style={styles.serviceItem}>
            <Text style={styles.serviceText}>{item.name || 'Không có tên'}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noDataText}>Không có dữ liệu</Text>
      )}
    </View>
  );

  // Xử lý loading
  if (ChitietPlanStatus === 'loading') {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  // Xử lý lỗi hoặc không có dữ liệu
  if (ChitietPlanStatus === 'failed' || !ChitietPlanData) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon name="alert-circle" size={50} color="#ff0000" />
        <Text style={styles.errorText}>{error || 'Không tìm thấy kế hoạch'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => dispatch(ChitietPlan(DetailPlanId))}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi tiết kế hoạch</Text>
          </View>

          {/* Thông tin chính */}
          <View style={styles.planInfo}>
            <Text style={styles.planTitle}>Tổng giá: {ChitietPlanData.totalPrice || 0} VNĐ</Text>
            {ChitietPlanData.SanhId && (
              <Text style={styles.planDetail}>Sảnh: {ChitietPlanData.SanhId.name}</Text>
            )}
            {ChitietPlanData.UserId && (
              <Text style={styles.planDetail}>
                Người dùng: {ChitietPlanData.UserId.name} ({ChitietPlanData.UserId.email})
              </Text>
            )}
          </View>

          {/* Danh sách dịch vụ */}
          {renderServiceItem('Dịch vụ ăn uống', ChitietPlanData.caterings)}
          {renderServiceItem('Trang trí', ChitietPlanData.decorates)}
          {renderServiceItem('Quà tặng', ChitietPlanData.presents)}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 10,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  planInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  planDetail: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  serviceItem: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    marginBottom: 5,
  },
  serviceText: {
    fontSize: 16,
    color: '#444',
  },
  noDataText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default DetailPlan;