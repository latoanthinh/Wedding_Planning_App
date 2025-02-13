import { StyleSheet, Text, View, Image, FlatList, Dimensions, Animated, TouchableOpacity, Alert, ScrollView } from 'react-native';
import React, { useRef, useState } from 'react';

const { width } = Dimensions.get("window");

const slides = [
  {
    image: require("../Assets/Images/backgroud_home.png"),
    onPress: () => Alert.alert("Bạn đã nhấn nút 1"),
  },
  {
    image: require("../Assets/Images/backgroud_home2.webp"),
    onPress: () => Alert.alert("Bạn đã nhấn nút 2"),
  },
  {
    image: require("../Assets/Images/backgroud_home3.jpeg"),
    onPress: () => Alert.alert("Bạn đã nhấn nút 3"),
  },
];

const ScreenHom = () => {
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const updateIndex = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#fff'}}>
      <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
        <Image source={require('../Assets/Images/Sort.png')} />
        <View style={{ flexDirection: 'row' }}>
          <Image source={require('../Assets/Images/notifi.png')} style={{ marginRight: 20 }} />
          <Image source={require('../Assets/Images/search.png')} />
        </View>
      </View>

      <Text style={{ fontSize: 26, marginTop: 10 }}> Hello, <Text>Your Name</Text></Text>
      <View>
        <Text>'All danh sach'</Text>
      </View>
      <Text style={{ fontSize: 26, marginTop: 10, fontWeight: 'bold' }} >Deals of the day</Text>

      <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: 180, marginTop: 10, padding: 10 }}>
        <FlatList
          ref={flatListRef}
          data={slides}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onMomentumScrollEnd={updateIndex}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <Image source={item.image} style={styles.image} />
              {/* Nội dung nằm trên ảnh */}
              <View style={styles.overlay}>
                <Text style={styles.description}>{item.description}</Text>
              </View>
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

      <Text style={{ fontSize: 16, marginTop: 10, fontWeight: 'bold' }} >Recommended</Text>
      <View>
        <Text>"Hall Danh sach"</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, alignItems: 'center' }}>
        <Text style={{ fontSize: 16, marginTop: 10, fontWeight: 'bold' }} >Váy Cưới</Text>
        <Text style={{ fontSize: 16, marginTop: 8, color: '#38E03F', textDecorationLine: 'underline' }} >View all</Text>
      </View>
      
      <View style={{ justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: 20 }}>
        <Image source={require('../Assets/Images/dresse.png')} />
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop:20 }}>
        <Image source={require('../Assets/Images/dresses1.png')} />
        <Image source={require('../Assets/Images/dresses2.png')} />
        <Image source={require('../Assets/Images/dresses3.png')} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10, alignItems: 'center' }}>
        <Text style={{ fontSize: 16, marginTop: 10, fontWeight: 'bold' }} >Kế hoạch</Text>
        <Text style={{ fontSize: 16, marginTop: 8, color: '#38E03F', textDecorationLine: 'underline' }} >View all</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom:50 }}>
        <View style={{padding:10}}>
        <Image source={require('../Assets/Images/thiepcuoi.png')} />
        <Text style={{ fontSize: 13, marginTop: 8, fontWeight: 'bold' }} >Thiệp Cưới</Text>
        <Text style={{ fontSize: 13, marginTop: 8, color:'orange', marginStart:20 }} >Status</Text>
        </View>
        <View style={{padding:10}}>
        <Image source={require('../Assets/Images/diadiem.png')} />
        <Text style={{ fontSize: 13, marginTop: 8, fontWeight: 'bold' }} >Địa Điểm</Text>
        <Text style={{ fontSize: 13, marginTop: 8, color:'green', marginStart:20 }} >Status</Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default ScreenHom;

const styles = StyleSheet.create({
  slide: {
    width: 'auto',
    height: "100%",
    alignItems: "center",
    overflow: 'hidden',
  },
  image: {
    width: width,
    height: 141,
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
  },
  description: {
    fontSize: 32,
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  indicatorContainer: {
    position: "absolute",
    bottom: 5,
    flexDirection: "row",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#bbb",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#3498db",
  },
});