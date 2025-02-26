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
    { title: "FOR SALE" },
    { title: "OUTDOOR" },
    { title: "SIGNATURE" },
  ];



  const ProductCard = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate("DetailClothes", { productIdClo: item._id })}>
      <View style={styles.card}>
        <Image source={{ uri: item.imageUrl[0] }} style={styles.image} />
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>45% OFF</Text>
        </View>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>{item.price}đ</Text>
        <Text style={styles.oldPrice}>4.999.999đ</Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={16} color="#facc15" />
          <Text style={styles.ratingText}>4.9 (256)</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("TabNavigation")}>
          <Icon name="arrow-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Dress</Text>
        <TouchableOpacity>
          <Icon name="home" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      <TextInput style={styles.searchBox} placeholder="Search..." />
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
  container: { flex: 1, backgroundColor: "#f5f5f5", paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "black" },
  searchBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
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
  discountText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  productName: { fontSize: 14, fontWeight: "bold", marginTop: 10 },
  productPrice: { fontSize: 16, fontWeight: "bold", color: "#111", marginTop: 5 },
  oldPrice: { fontSize: 14, textDecorationLine: "line-through", color: "#a1a1a1" },
  ratingContainer: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  ratingText: { fontSize: 14, marginLeft: 5 },
});


