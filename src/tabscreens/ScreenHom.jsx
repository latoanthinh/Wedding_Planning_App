import { Text, View, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import React, { useRef, useState, useEffect, useCallback, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Lottie from 'lottie-react-native';
import { Hall } from '../redux/HallSlice';
import styles from '../Styles/Home_Style';

import { AppContext } from '../AppContext';



const slides = [
  { image: require("../Assets/Images/backgroud_home.png") },
  { image: require("../Assets/Images/backgroud_home2.webp") },
  { image: require("../Assets/Images/backgroud_home3.jpeg") },
];

const ScreenHom = ({ navigation }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useContext(AppContext); // Lấy thông tin user từ Context


  

  const dispatch = useDispatch();
  const { HallData, HallStatus } = useSelector((state) => state.hall);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await dispatch(Hall());
      setIsLoading(false);
    };
    fetchData();
  }, [dispatch]);

  const renderHallItem = useCallback(({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("HallWeddings", { productIdHall: item._id })}>
      <View style={styles.backgroudhall}>
        <Image source={{ uri: item.imageUrl }} style={styles.imghall} />
        <Text style={styles.namehall} numberOfLines={1}>{item.name}</Text>
        <Text numberOfLines={1}>{item.location}</Text>
        <View style={styles.bottomhall}>

          <View style={styles.detailRow}>
            <Image source={require('../Assets/Images/house.png')} style={styles.icon} />
            <Text> {item.sanh} Sảnh</Text>
          </View>

        </View>

      </View>
    </TouchableOpacity>
  ), [navigation]);

  const renderLoading = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Lottie source={require('../Assets/Animations/loading.json')} autoPlay loop
        style={{ width: 100, height: 100 }} />
      <Text>Đang tải dữ liệu...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        renderLoading()
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
          <View>
            <View style={styles.header}>
              <Image source={require('../Assets/Images/Sort.png')} />
              <View style={styles.rightHeader}>
                <Image source={require('../Assets/Images/notifi.png')} style={styles.notificationImage} />
                <TouchableOpacity onPress={() => setIsSearchClicked(!isSearchClicked)}>
                  <Image source={require('../Assets/Images/search.png')} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.greetingText}>
              Hello, {user.name}
            </Text>
            <Text style={styles.sectionTitle}>All danh sách</Text>
            <Text style={styles.dealsTitle}>Deals of the day</Text>
            <View style={styles.sliderContainer}>
              <FlatList
                ref={flatListRef}
                data={slides}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.slide}>
                    <Image source={item.image} style={styles.image} />
                  </View>
                )}
              />
              <View style={styles.indicatorContainer}>
                {slides.map((_, index) => (
                  <TouchableOpacity key={index} onPress={() => flatListRef.current.scrollToIndex({ index, animated: true })}>
                    <View style={[styles.dot, currentIndex === index && styles.activeDot]} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <Text style={styles.recommendedTitle}>Recommended</Text>
            {HallStatus === 'succeeded' && (
              <FlatList
                data={HallData}
                renderItem={renderHallItem}
                keyExtractor={(item) => item._id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
              />
            )}
            {HallStatus === 'failed' && <Text>Không thể tải dữ liệu!</Text>}
            <View style={styles.dressContainer}>
              <Text style={styles.sectionTitle}>Váy Cưới</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Dress")}>
                <Text style={styles.viewAll}>View all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.imageContainer}>
              <Image source={require('../Assets/Images/dresse.png')} />
            </View>
            <View style={styles.locationRow}>
              <View style={styles.locationItem}>
                <Image source={require('../Assets/Images/thiepcuoi.png')} />
                <Text style={styles.locationTitle}>Thiệp Cưới</Text>
                <Text style={styles.statusText}>Status</Text>
              </View>
              <View style={styles.locationItem}>
                <Image source={require('../Assets/Images/diadiem.png')} />
                <Text style={styles.locationTitle}>Địa Điểm</Text>
                <Text style={styles.statusText}>Status</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.locationItem} onPress={() => navigation.navigate("FlowersScreen")}>
              <Image source={require('../Assets/Images/thiepcuoi.png')} />
              <Text style={styles.locationTitle}>Flowers</Text>
              <Text style={styles.statusText}>Status</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

export default ScreenHom;