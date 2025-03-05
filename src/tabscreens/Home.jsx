import React, { useRef, useState, useEffect, useCallback, useContext } from 'react';
import {
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Pressable,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Lottie from 'lottie-react-native';
import { Hall } from '../redux/HallSlice';
import styles from '../Styles/Home_Style';
import { AppContext } from '../AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';


const { width } = Dimensions.get('window');

const slides = [
  {
    image: require('../Assets/Images/backgroud_home.png'),
    title: 'Trang trí ngày cưới',
  },
  {
    image: require('../Assets/Images/backgroud_home2.webp'),
    title: 'Không gian sang trọng',
  },
  {
    image: require('../Assets/Images/backgroud_home3.jpeg'),
    title: 'Lễ cưới đáng nhớ',
  },
];

const ScreenHome = ({ navigation }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const scrollX = useRef(new Animated.Value(0)).current;

  const { user } = useContext(AppContext);
  const dispatch = useDispatch();
  const { HallData, HallStatus } = useSelector(state => state.hall);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await dispatch(Hall());
      setIsLoading(false);
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => {
      flatListRef.current?.scrollToIndex({
        index: (currentIndex + 1) % slides.length,
        animated: true,
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const onSlideChange = useCallback(
    e => {
      const slideIndex = Math.round(e.nativeEvent.contentOffset.x / width);
      if (slideIndex !== currentIndex) {
        setCurrentIndex(slideIndex);
      }
    },
    [currentIndex],
  );

  const renderHallItem = useCallback(
    ({ item }) => (
      <Pressable onPress={() => navigation.navigate('HallWeddings', { productIdHall: item._id })}>
        <View style={styles.backgroudhall}>
          <Image source={{ uri: item.imageUrl }} style={styles.imghall} />
          <Text style={styles.namehall} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.locationText} numberOfLines={1}>{item.SoLuongKhach}</Text>
        </View>
      </Pressable>
    ),
    [navigation],
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <Lottie source={require('../Assets/Animations/loading.json')} autoPlay loop style={styles.loadingAnimation} />
      <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
    </View>
  );

  const renderCarouselItem = ({ item }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.slideImage} />
      <View style={styles.slideOverlay}>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <TouchableOpacity style={styles.exploreButton}>
          <Text style={styles.exploreButtonText}>Khám phá ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {isLoading ? (
        renderLoading()
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setIsSearchClicked(!isSearchClicked)}>
              <Image source={require('../Assets/Images/search.png')} style={styles.searchIcon} />
            </TouchableOpacity>
          </View>

          {/* Greeting */}
          <Text style={styles.greetingText}>Xin chào, {'\n'} {user.name}</Text>
          <Text style={styles.welcomeText}>Hãy lên kế hoạch cho ngày cưới hoàn hảo</Text>

          {/* Deals of the day */}
          <Text style={styles.dealsTitle}>Ưu đãi tốt</Text>

          {/* Carousel */}
          <View style={styles.sliderContainer}>
            <FlatList
              ref={flatListRef}
              data={slides}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onSlideChange}
              renderItem={renderCarouselItem}
              snapToInterval={width}
              decelerationRate="fast"
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
            />
            <View style={styles.indicatorContainer}>
              {slides.map((_, index) => {
                const inputRange = [
                  (index - 1) * width,
                  index * width,
                  (index + 1) * width,
                ];

                const dotOpacity = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.5, 1, 0.5],
                  extrapolate: 'clamp',
                });

                const dotScale = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.8, 1.4, 0.8],
                  extrapolate: 'clamp',
                });

                const dotRotate = scrollX.interpolate({
                  inputRange,
                  outputRange: ['0deg', '360deg', '0deg'],
                  extrapolate: 'clamp',
                });

                const dotColor = scrollX.interpolate({
                  inputRange,
                  outputRange: ['#ccc', '#fff', '#ccc'],
                  extrapolate: 'clamp',
                });

                return (
                  <TouchableOpacity key={index} onPress={() => flatListRef.current?.scrollToIndex({ index, animated: true })}>
                    <Animated.View
                      style={[styles.dot, {
                        opacity: dotOpacity,
                        transform: [{ scale: dotScale }, { rotate: dotRotate }],
                        backgroundColor: dotColor,
                      }]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Survey Section */}
          <View style={styles.surveyContainer}>
            <Image source={require('../Assets/Images/servey.png')} style={styles.surveyIcon} />
            <View style={styles.surveyContent}>
              <Text style={styles.surveyText}>Ngày vui với 1 chạm!!</Text>
              <TouchableOpacity style={styles.surveyButton} onPress={() => navigation.navigate('Thongtincoban')}>
                <Image source={require('../Assets/Images/edit.png')} style={styles.surveyButtonIcon} />
                <Text style={styles.surveyButtonText}>Thực hiện khảo sát</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recommended Section */}
          <View style={styles.recommendedHeader}>
            <Text style={styles.recommendedTitle}>Nổi bật</Text>
            <TouchableOpacity onPress={() => navigation.navigate("AllLobyy")}>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {HallStatus === 'succeeded' && (
            <FlatList
              data={HallData.slice(0, 3)}
              renderItem={renderHallItem}
              keyExtractor={item => item._id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hallListContainer}
            />
          )}

          {HallStatus === 'failed' && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Không thể tải dữ liệu!</Text>
            </View>
          )}

          {/* Wedding Dresses Section */}
          <View style={styles.dressContainer}>
            <Text style={styles.sectionTitle}>Váy Cưới</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Dress')}>
              <Text style={styles.viewAll}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => navigation.navigate('Dress')}>
            <Image
              source={require('../Assets/Images/dresse.png')}
              style={styles.dressImage}
            />
            <View style={styles.dressTextOverlay}>
              <Text style={styles.dressCollectionText}>Bộ sưu tập váy cưới 2025</Text>
              <Text style={styles.dressSubtitle}>100+ mẫu đang có sẵn</Text>
            </View>
          </TouchableOpacity>

          {/* Services Section */}
          <Text style={[styles.sectionTitle, { marginLeft: 20, marginTop: 20 }]}>Dịch vụ khác</Text>

          <View style={styles.locationRow}>
            <TouchableOpacity style={styles.locationItem} onPress={() => navigation.navigate("Gift_Screen")}>
              <Image source={require('../Assets/Images/thiepcuoi.png')} style={styles.serviceIcon} />
              <Text style={styles.locationTitle}>Quà Tặng</Text>
              <Text style={styles.statusText}>Status</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.locationItem} onPress={() => navigation.navigate("DiaDiem_Screen")}>
              <Image source={require('../Assets/Images/diadiem.png')} style={styles.serviceIcon} />
              <Text style={styles.locationTitle}>Địa Điểm</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.flowerContainer}
            onPress={() => navigation.navigate('FlowersScreen')}>
            <Image source={require('../Assets/Images/hoacuoi.jpeg')} style={styles.flowerImage} />
            <View style={styles.overlay}>
              <View style={styles.textContainer}>
                <Text style={styles.flowerTitle}>Đồ ăn</Text>
                <Text style={styles.statusText}>Xem mẫu đồ ăn</Text>
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ScreenHome;