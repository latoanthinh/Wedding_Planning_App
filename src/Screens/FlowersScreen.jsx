import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  ImageBackground,
  Dimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { FlowersAPI } from "../redux/FlowersSlice";
import Lottie from 'lottie-react-native'; // Import Lottie

const { width } = Dimensions.get("window");

const renderLoading = () => (
  <View style={styles.loadingContainer}>
    <Lottie
      source={require('../Assets/Animations/loading.json')}
      autoPlay
      loop
      style={styles.loadingAnimation}
    />
    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
  </View>
);

const FlowersScreen = (props) => {
  const { navigation } = props;
  const dispatch = useDispatch();
  const { FlowersData, FlowersStatus } = useSelector((state) => state.flowers);
  const numColumns = 2;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFlower, setSelectedFlower] = useState(null);
  const [favoris, setFavoris] = useState([]);

  const openModal = (flower) => {
    setSelectedFlower(flower);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const toggleFavoris = (flowerId) => {
    setFavoris((prevFavoris) =>
      prevFavoris.includes(flowerId)
        ? prevFavoris.filter((id) => id !== flowerId)
        : [...prevFavoris, flowerId]
    );
  };

  useEffect(() => {
    dispatch(FlowersAPI());
  }, [dispatch]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <TouchableOpacity onPress={() => openModal(item)}>
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>{formatPrice(item.price)} đ</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>{item.description}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("TabNavigation")}>
          <Image source={require('../Assets/Images/back.png')} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.title}>Flowers</Text>
        <TouchableOpacity>
          <Image source={require('../Assets/Images/home48.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
      <TextInput style={styles.searchBox} placeholder="Search..." />
      {FlowersStatus === "loading" && renderLoading()}
      {FlowersStatus === "succeeded" && (
        <FlatList
          numColumns={numColumns}
          data={FlowersData}
          keyExtractor={(product) => product._id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContainer}
        />
      )}
      {FlowersStatus === "failed" && <Text>Không thể tải dữ liệu!</Text>}

      {/* Modal chi tiết sản phẩm */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalContainer}>
            <View>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  {selectedFlower && (
                    <>
                      <ImageBackground source={{ uri: selectedFlower.imageUrl }} style={styles.modalImage}>
                        <TouchableOpacity
                          style={styles.heartIconModal}
                          onPress={() => toggleFavoris(selectedFlower._id)}
                        >
                          <Image
                            source={favoris.includes(selectedFlower._id)
                              ? require("../Assets/Images/heart_filled.png")
                              : require("../Assets/Images/heart_outline.png")}
                            style={styles.heartImage}
                          />
                        </TouchableOpacity>
                      </ImageBackground>
                      <Text style={styles.modalTitle}>{selectedFlower.name}</Text>
                      <Text style={styles.modalPrice}>{formatPrice(selectedFlower.price)} đ</Text>
                      <Text style={styles.modalDescription}>{selectedFlower.description}</Text>
                    </>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default FlowersScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingAnimation: {
    width: 50,
    height: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000',
  },
  heartImage: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    tintColor: "red",
  },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: 300, backgroundColor: "#fff", padding: 20, borderRadius: 10, alignItems: "center" },
  modalImage: { width: 200, height: 200, borderRadius: 10, marginBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  modalPrice: { fontSize: 16, fontWeight: "bold", color: "#111", marginBottom: 5 },
  modalDescription: { fontSize: 14, textAlign: "center", marginBottom: 10 },
  container: { flex: 1, backgroundColor: "#f5f5f5", paddingHorizontal: 16 },
  icon: { width: 24, height: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "black" },
  searchBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    margin: 8
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    margin: 8,
    elevation: 3,
    width: (width / 2.2) - 16,
  },
  image: { width: "100%", height: 150, borderRadius: 10 },
  productName: { fontSize: 14, fontWeight: "bold", marginTop: 10 },
  productPrice: { fontSize: 16, fontWeight: "bold", color: "#111", marginTop: 5 },
  ratingContainer: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  ratingText: { fontSize: 14, marginLeft: 5 },
  flatListContainer: {
    paddingBottom: 20,
  },
});