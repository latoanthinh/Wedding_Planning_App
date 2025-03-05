import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, ActivityIndicator, Animated } from 'react-native';
import React, { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Invitations } from '../redux/InvitationsSlice';
import Lottie from 'lottie-react-native';

const InvitationsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { AllPlanData, AllPlanStatus } = useSelector((state) => state.allplan);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dispatch(Invitations());
  }, [dispatch]);

  useEffect(() => {
    if (AllPlanStatus === 'loading') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [AllPlanStatus, fadeAnim]);

  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + " VNĐ";
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Lottie
          source={require('../Assets/Animations/loading.json')}
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
      </Animated.View>
      <Text style={styles.loadingText}>Chờ xíu...</Text>
    </View>
  );

  const InvitationCard = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('InvitationDetail', { invitationId: item._id })}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
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
        return <Text style={styles.statusText}>Đang chờ dữ liệu...</Text>;
      case 'loading':
        return renderLoading();
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
          <Text style={styles.statusText}>Không có lời mời nào để hiển thị!</Text>
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
          <Image source={require('../Assets/Images/back.png')} style={styles.icon_1} />
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 30,
  },
  icon: {
    width: 24,
    height: 24,
  },
  icon_1: {
    width: 20,
    height: 15,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Playfair_me',
    color: '#000',
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
    borderRadius: 15,
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
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  cardContent: {
    padding: 10,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Playfair-re',
    color: '#333',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontFamily: 'Playfair-re',
    color: 'red',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 8,
    fontFamily: 'Playfair-re',
  },
  viewButton: {
    backgroundColor: '#000',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 2,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Playfair_me',
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    color: '#000',
    marginTop: 10,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'Playfair_me',
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
    fontFamily: 'Playfair_me',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
},
loadingAnimation: {
    width: 120,
    height: 120,
},
loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily:'Playfair-re'
},
});