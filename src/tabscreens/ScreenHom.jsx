import { StyleSheet, Text, View, Image, FlatList, ActivityIndicator, ToastAndroid, Dimensions, Animated, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Hall } from '../redux/HallSlice';
import { Clothes } from '../redux/ClothesSlice';

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

const ScreenHom = (props) => {
  const { navigation } = props;
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSearchClicked, setIsSearchClicked] = useState(false);

  const dispatch = useDispatch();


  //xử lý Clothes

  const { ClothesData, ClothesStatus } = useSelector((state) => state.clothes);

  useEffect(() => {
    dispatch(Clothes());
  }, [dispatch]);

  // Xử lý khi không thể fetch dữ liệu
  useEffect(() => {
    if (ClothesStatus === 'failed') {
      ToastAndroid.show('Không thể tải Hall!', ToastAndroid.SHORT);
    }
  }, [ClothesStatus]);
  useEffect(() => {
    if (ClothesStatus === 'succeeded') {
      console.log('Dữ liệu sản phẩm:', ClothesData);
    }
  }, [ClothesStatus, ClothesData]);

  const renderCloItem = ({ item }) => {

    return (
      <TouchableOpacity>
        <View style={styles.backgroudClo}>
          <Image source={{ uri: item.imageUrl[0] }} style={styles.imgClo} />

          <Text style={styles.nameClo} numberOfLines={1} >{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };



  //xử lý hall

  const { HallData, HallStatus } = useSelector((state) => state.hall);



  useEffect(() => {
    dispatch(Hall());
  }, [dispatch]);

  // Xử lý khi không thể fetch dữ liệu
  useEffect(() => {
    if (HallStatus === 'failed') {
      ToastAndroid.show('Không thể tải Hall!', ToastAndroid.SHORT);
    }
  }, [HallStatus]);
  useEffect(() => {
    if (HallStatus === 'succeeded') {
      console.log('Dữ liệu sản phẩm:', HallData);
    }
  }, [HallStatus, HallData]);

  // Render một item trong danh sách hall
  const renderHallItem = ({ item }) => {
    return (
      <TouchableOpacity>
        <View style={styles.backgroudhall}>
          <Image source={{ uri: item.imageUrl }} style={styles.imghall} />
          <Text style={styles.namehall} numberOfLines={2} >{item.name}</Text>
          <Text style={{height:35}} numberOfLines={2}>{item.location}</Text>
          <View style={styles.bottomhall}>
            <View style={{ flexDirection: "row", alignItems: "center" }} >
              <Image source={require('../Assets/Images/numberperson.png')} style={{ width: 15, height: 15 }} />
              <Text>{item.soluongkhach} Khách</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image source={require('../Assets/Images/house.png')} style={{ width: 15, height: 15 }} />
              <Text> Sảnh {item.sanh}</Text>
            </View>
          </View>
          <View style={{ borderWidth: 1, borderColor: "#CECBCB" }}></View>
          <Text style={{fontWeight:'bold'}} >Xem sảnh</Text>
        </View>
      </TouchableOpacity>
    );
  };
  //xử lý hall

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const updateIndex = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleSearchClick = () => {
    setIsSearchClicked(!isSearchClicked);
  };

  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);

  const handleAddTask = () => {
    if (task) {
      if (editIndex !== -1) {
        const updatedTasks = [...tasks];
        updatedTasks[editIndex] = task;
        setTasks(updatedTasks);
        setEditIndex(-1);
      } else {
        setTasks([...tasks, task]);
      }
      setTask("");
    }
  };

  const handleDeleteTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.task}>
      <Text style={styles.itemList}>{item}</Text>
      <View style={styles.taskButtons}>
        <TouchableOpacity onPress={() => handleDeleteTask(index)}>
          <Image source={require('../Assets/Images/delete.png')} style={styles.deleteImage} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {isSearchClicked ? (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View>
            <View style={styles.header}>
              <Image source={require('../Assets/Images/Sort.png')} />
              <View style={styles.rightHeader}>
                <Image source={require('../Assets/Images/notifi.png')} style={styles.notificationImage} />
                <TouchableOpacity onPress={handleSearchClick}>
                  <Image source={require('../Assets/Images/home48.png')} style={styles.homeIcon} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Bạn muốn tìm gì ?"
                value={task}
                onChangeText={(text) => setTask(text)} />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddTask}>
                <Image source={require('../Assets/Images/search.png')} style={styles.searchIcon} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={tasks}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
          <View>
            <View style={styles.header}>
              <Image source={require('../Assets/Images/Sort.png')} />
              <View style={styles.rightHeader}>
                <Image source={require('../Assets/Images/notifi.png')} style={styles.notificationImage} />
                <TouchableOpacity onPress={handleSearchClick}>
                  <Image source={require('../Assets/Images/search.png')} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.greetingText}>Hello, <Text>Your Name</Text></Text>
            <Text style={styles.dealsTitle}>Deals of the day</Text>
            <View style={styles.sliderContainer}>
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
            <Text style={styles.recommendedTitle}>Recommended</Text>
            <View>
              {HallStatus === 'loading' && <ActivityIndicator size="large" color="#0000ff" />}
              {HallStatus === 'succeeded' && (
                <FlatList
                  data={HallData}
                  renderItem={renderHallItem}
                  keyExtractor={(item) => item._id.toString()}
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                />
              )}
              {HallStatus === 'failed' && <Text>Không thể tải dữ liệu!</Text>}
            </View>
            <View style={styles.dressContainer}>
              <Text style={styles.sectionTitle}>Váy Cưới</Text>
              <Text style={styles.viewAll}>View all</Text>
            </View>
            <View style={styles.imageContainer}>
              <Image source={require('../Assets/Images/dresse.png')} />
            </View>
            <View style={styles.dressRow}>

              {ClothesStatus === 'loading' && <ActivityIndicator size="large" color="#0000ff" />}
              {ClothesStatus === 'succeeded' && (
                <FlatList
                  data={ClothesData}
                  renderItem={renderCloItem}
                  keyExtractor={(item) => item._id.toString()}
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                />
              )}
              {ClothesStatus === 'failed' && <Text>Không thể tải dữ liệu!</Text>}

            </View>
            <View style={styles.dressContainer}>
              <Text style={styles.sectionTitle}>Kế hoạch</Text>
              <Text style={styles.viewAll}>View all</Text>
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
          </View>

          <View style={styles.Tou}>
            <TouchableOpacity onPress={() => navigation.navigate('Thongtincoban')} style={styles.Combo}>
              <Text >
                Combo
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      )}
    </View>
  );
}

export default ScreenHom;

const styles = StyleSheet.create({

  nameClo: {
    fontSize: 10,
    height: 40,
    padding:10
  },


  imgClo: {
    width: 110,
    height: 122,
    marginRight: 10,
    borderRadius: 10,
  },
  backgroudClo: {
    alignItems: "center",
    height: 160,
  },
  bottomhall: {
    flexDirection: "row",
    justifyContent: 'space-between',
    marginTop: 3
  },
  namehall: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
    height:50
  },
  imghall: {
    width: "100%",
    height: 140,

  },
  backgroudhall: {
    width: 320,
    height: 290,
    padding: 10,
  },
  Combo: {
    width: 320,
    height: 40,
    backgroundColor: "#CECBCB",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center"

  },
  Tou: {

    height: 50,
    justifyContent: "center",
    alignItems: 'center'



  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  scrollViewContent: {
    flexGrow: 1
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightHeader: {
    flexDirection: 'row',
  },
  notificationImage: {
    marginRight: 25
  },
  homeIcon: {
    width: 24,
    height: 24
  },
  searchInputContainer: {
    marginBottom: 20
  },
  input: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    fontSize: 14,
    marginTop: 40,
    backgroundColor: '#f3f3f3',
    paddingStart: 20
  },
  addButton: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    position: 'absolute',
    top: 40,
    right: 10
  },
  searchIcon: {
    width: 20,
    height: 20
  },
  task: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    padding: 10,
    borderRadius: 8
  },
  taskButtons: {
    flexDirection: 'row',
  },
  deleteImage: {
    width: 20,
    height: 20,
    marginEnd: 10
  },
  itemList: {
    fontSize: 14,
    paddingStart: 5
  },
  greetingText: {
    fontSize: 26,
    marginTop: 10
  },
  sectionTitle: {
    fontSize: 16,
    marginTop: 10
  },
  dealsTitle: {
    fontSize: 26,
    marginTop: 10,
    fontWeight: 'bold'
  },
  sliderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: 180,
    marginTop: 10,
    padding: 10
  },
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
    borderRadius: 10
  },
  description: {
    fontSize: 32,
    color: "white",
    textAlign: "center",
    marginBottom: 10
  },
  indicatorContainer: {
    position: "absolute",
    bottom: 5,
    flexDirection: "row"
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#bbb",
    marginHorizontal: 5
  },
  activeDot: {
    backgroundColor: "#3498db"
  },
  recommendedTitle: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: 'bold'
  },
  dressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    alignItems: 'center'
  },
  viewAll: {
    fontSize: 16,
    marginTop: 8,
    color: '#38E03F',
    textDecorationLine: 'underline'
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 20
  },
  dressRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 50
  },
  locationItem: {
    padding: 10
  },
  locationTitle: {
    fontSize: 13,
    marginTop: 8,
    fontWeight: 'bold'
  },
  statusText: {
    fontSize: 13,
    marginTop: 8,
    color: 'orange',
    marginStart: 20
  }
});
