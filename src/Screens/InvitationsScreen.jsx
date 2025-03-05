import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Invitations } from '../redux/InvitationsSlice';

const InvitationsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { AllPlanData, AllPlanStatus } = useSelector((state) => state.allplan);

  useEffect(() => {
    dispatch(Invitations());
  }, [dispatch]);

  const InvitationCard = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('InvitationDetail', { invitationId: item._id })}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardPrice}>${item.price}</Text>
          <Text style={styles.cardDescription} numberOfLines={2}>{item.Description}</Text>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ),
    [navigation]
  );

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
            <ActivityIndicator size="large" color="#FF6F61" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        );
      case 'succeeded':
        return AllPlanData && AllPlanData.length > 0 ? (
          <FlatList
            data={AllPlanData}
            keyExtractor={(item) => item._id || item.id.toString()}
            renderItem={InvitationCard}
            numColumns={2}
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
        <TouchableOpacity onPress={() => navigation.navigate('TabNavigation')}>
          <Image source={require('../Assets/Images/back.png')} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.title}>QUÀ TẶNG</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TabNavigation')}>
          <Image source={require('../Assets/Images/home48.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>{renderContent()}</View>
    </View>
  );
};

export default InvitationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB', // Màu nền nhẹ nhàng
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 5,
    marginTop:50
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#FF6F61', // Màu cam nổi bật
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D2D2D',
    letterSpacing: 1,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 15,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15, // Bo góc mềm mại hơn
    margin: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 150, // Giảm chiều cao để bố cục cân đối
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  cardContent: {
    padding: 10,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6F61', // Màu giá nổi bật
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
  },
  viewButton: {
    backgroundColor: '#FF6F61', // Màu nút đồng bộ với giao diện
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20, // Nút bo tròn hơn
    elevation: 2,
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
    color: '#555',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    color: '#FF6F61',
    marginTop: 10,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
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
    fontWeight: '600',
  },
});