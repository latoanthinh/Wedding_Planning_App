import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Pressable,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useDispatch, useSelector } from "react-redux";
import { Clothes } from "../redux/ClothesSlice";

const Dress = (props) => {
  const { navigation } = props;
  const dispatch = useDispatch();
  const { ClothesData, ClothesStatus } = useSelector((state) => state.clothes);

  useEffect(() => {
    dispatch(Clothes());
  }, [dispatch]);

  const categories = [
    { title: "LỰA CHỌN HÀNG ĐẦU" },
    { title: "NGOÀI TRỜI" },
    { title: "THƯƠNG HIỆU" },
  ];



  const ProductCard = ({ item }) => (
    <Pressable onPress={() => navigation.navigate("DetailClothes", { productIdClo: item._id })}>
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl[0] }} style={styles.image} />
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>Giảm giá 40%</Text>
        </View>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}đ</Text>
        <Text style={styles.oldPrice}>4.999.999 VNĐ</Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={16} color="#facc15" />
          <Text style={styles.ratingText}>4.9 (256)</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("TabNavigation")}>
          <Image source={require('../Assets/Images/back.png')} style={styles.icon_1} />
        </TouchableOpacity>
        <Text style={styles.title}>Váy cưới</Text>
        <TouchableOpacity>
          <Image source={require('../Assets/Images/home48.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
      <TextInput style={styles.searchBox} placeholder="Tìm váy cưới..." />
      {ClothesStatus === "loading" && <ActivityIndicator size="large" color="#0000ff" />}
      {ClothesStatus === "succeeded" && (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => (
            <View>
              <Text style={styles.categoryTitle}>{item.title}</Text>
              <FlatList
                data={ClothesData}
                keyExtractor={(product) => product._id.toString()}
                renderItem={({ item }) => <ProductCard item={item} />}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}
        />
      )}
      {ClothesStatus === "failed" && <Text>Không thể tải dữ liệu!</Text>}
    </View>
  );
};
export default Dress

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: "#fff",
    padding: 20
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  title: {
    fontSize: 22,
    color: "black",
    fontFamily: 'Playfair-re'
  },
  searchBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#000",
    borderWidth: 0.5,
  },
  icon: {
    width: 24,
    height: 24,
  },
  icon_1: {
    width: 20,
    height: 15,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 8,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    margin: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: { width: "100%", height: 150, borderRadius: 10 },
  discountBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#f87171",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold"
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
    marginTop: 5
  },
  oldPrice: {
    fontSize: 14,
    textDecorationLine: "line-through",
    color: "#a1a1a1"
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5
  },
  ratingText: {
    fontSize: 14,
    marginLeft: 5
  },
});


