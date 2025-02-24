import React, { useEffect } from "react";
import {
    View, Text, FlatList, Image,StyleSheet,TouchableOpacity, TextInput,ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { FlowersAPI } from "../redux/FlowersSlice";
const FlowersScreen = (props) => {

    const { navigation } = props;
      const dispatch = useDispatch();
      const { FlowersData, FlowersStatus } = useSelector((state) => state.flowers);
      const numColumns = 2;

      useEffect(() => {
          dispatch(FlowersAPI());
        }, [dispatch]);

        const ProductCard = ({ item }) => (
            <TouchableOpacity >
              <View style={styles.card}>
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.price}đ</Text>
                <View style={styles.ratingContainer}>
                  
                  <Text style={styles.ratingText}>{item.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );


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
             {FlowersStatus === "loading" && <ActivityIndicator size="large" color="#0000ff" />}
             {FlowersStatus === "succeeded" && (
               
                     <FlatList
                        numColumns={numColumns}
                       data={FlowersData}
                       keyExtractor={(product) => product._id.toString()}
                       renderItem={({ item }) => <ProductCard item={item} />}
                       showsHorizontalScrollIndicator={false}
                     />
                   
                 )}
            
             {FlowersStatus === "failed" && <Text>Không thể tải dữ liệu!</Text>}
           </View>
    )
}

export default FlowersScreen

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5", paddingHorizontal: 16 },
    icon: { width: 24, height: 24 },
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
    width:180,

  },
  image: { width: "100%", height: 150, borderRadius: 10 },
  
  
  productName: { fontSize: 14, fontWeight: "bold", marginTop: 10 },
  productPrice: { fontSize: 16, fontWeight: "bold", color: "#111", marginTop: 5 },
  
  ratingContainer: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  ratingText: { fontSize: 14, marginLeft: 5 },
})