import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Invitations } from '../redux/InvitationsSlice'; // Giả sử bạn có slice này

const InvitationsScreen = ({ navigation }) => { // Thêm navigation để xử lý nút "View"
  const dispatch = useDispatch();
  const { AllPlanData, AllPlanStatus } = useSelector((state) => state.allplan);

  // Dispatch action để lấy dữ liệu khi component mount
  useEffect(() => {
    dispatch(Invitations()); // Sử dụng action từ InvitationsSlice
  }, [dispatch]);

  // Component cho mỗi thẻ invitation
  const InvitationCard = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('InvitationDetail', { invitationId: item._id })} // Điều hướng đến chi tiết
    >
      <Image
        source={{ uri: item.imageUrl }} // Giả sử item có field imageUrl cho URL hình ảnh
        style={styles.cardImage}
      />
      <Text style={styles.cardTitle}>Happily Ever After</Text>
      <TouchableOpacity style={styles.viewButton}>
        <Text style={styles.viewButtonText}>View</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  ), [navigation]);

  // Hàm render nội dung dựa trên trạng thái
  const renderContent = useCallback(() => {
    switch (AllPlanStatus) {
      case 'idle':
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>Đang chờ dữ liệu...</Text>
          </View>
        );
      case 'loading':
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        );
      case 'succeeded':
        return AllPlanData && AllPlanData.length > 0 ? (
          <FlatList
            data={AllPlanData}
            keyExtractor={(item) => item._id || item.id.toString()} // Đảm bảo keyExtractor hợp lệ
            renderItem={InvitationCard}
            numColumns={2} // Hiển thị 2 cột như trong hình
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        ) : (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>Không có lời mời nào để hiển thị!</Text>
          </View>
        );
      case 'failed':
        return (
          <View style={styles.statusContainer}>
            <Text style={styles.errorText}>Không thể tải dữ liệu!</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(Invitations())}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  }, [AllPlanData, AllPlanStatus, dispatch, InvitationCard]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("TabNavigation")}>
          <Image source={require('../Assets/Images/back.png')} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.title}>INVITECARD</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TabNavigation')}>
          <Image source={require('../Assets/Images/home48.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {renderContent()}
      </View>
    </View>
  );
};

export default InvitationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  icon: {
    width: 28,
    height: 28,
    tintColor: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 5, // Khoảng cách giữa các thẻ
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: 200, // Điều chỉnh kích thước hình ảnh để phù hợp với thiết kế
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginVertical: 10,
    textAlign: 'center',
  },
  viewButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#007AFF',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});