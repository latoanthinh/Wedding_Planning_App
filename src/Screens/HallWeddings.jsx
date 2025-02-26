import {
    StyleSheet, Text, View, Image, FlatList, ActivityIndicator,
    ToastAndroid, TouchableOpacity
} from 'react-native';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HallTheoWedding } from '../redux/HallTheoWeddingHallsSlice';

const HallWeddings = ({ navigation, route }) => {
    const { productIdHall } = route?.params; // Lấy productIdHall từ params
    
    const dispatch = useDispatch();
    const { HallTheoWeddingFlowersData, HallTheoWeddingFlowersStatus,error } = useSelector(state => state.halltheowedding);

    useEffect(() => {
        
        if (productIdHall) {
            dispatch(HallTheoWedding(productIdHall));
        }
    }, [productIdHall, dispatch]);
    

    const renderHallItem = ({ item }) => {
        return (
            <TouchableOpacity >
                <View style={styles.backgroudhall}>
                    <Image source={{ uri: item.imageUrl }} style={styles.imghall} />
                    <Text style={styles.namehall} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.bottomhall}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Image source={require('../Assets/Images/numberperson.png')} style={{ width: 15, height: 15 }} />
                            <Text>{item.SoLuongKhach} Khách</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image source={require('../Assets/Images/price.png')} style={{ width: 15, height: 15 }} />
                    <Text> {item.price}Đ</Text>
                    </View>
                    </View>
                    
                  
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>


            <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.navigate("TabNavigation")}>
                                <Image source={require('../Assets/Images/back.png')} style={styles.icon} />
                            </TouchableOpacity>
                            <Text style={styles.title}>WEDDINGHALLS</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('TabNavigation')}>
                                <Image source={require('../Assets/Images/home48.png')} style={styles.icon} />
                            </TouchableOpacity>
                        </View>
            {HallTheoWeddingFlowersStatus === 'loading' && <ActivityIndicator size="large" color="#0000ff" />}
            {HallTheoWeddingFlowersStatus === 'succeeded' && (
                <FlatList
                data={Array.isArray(HallTheoWeddingFlowersData) ? HallTheoWeddingFlowersData : [HallTheoWeddingFlowersData]}
                renderItem={renderHallItem}
                keyExtractor={(item) => item._id.toString()}
                showsHorizontalScrollIndicator={false}
            />
            )}
            {HallTheoWeddingFlowersStatus === 'failed' && <Text>Không thể tải dữ liệu!</Text>}
        </View>
    );
};

export default HallWeddings;

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingTop: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
    icon: { width: 24, height: 24 },
    title: { fontSize: 22, fontWeight: 'bold', color: 'black' },
    bottomhall: {
        flexDirection: "row",
        justifyContent: 'space-between',
        padding:10,
        width:"100%"
    },
    namehall: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop:5
    },
    imghall: {
        width: "100%",
        height: 140,
        borderTopLeftRadius: 20,  // Bo góc trái trên
        borderTopRightRadius: 20, // Bo góc phải trên
    },
    
    backgroudhall: {
        width: 350,
        height: 220,
        marginRight: 10,
        borderRadius: 15, // Bo góc toàn bộ item
        overflow: "hidden", // Đảm bảo hình ảnh không bị lẹm ra ngoài
        backgroundColor: "#fff", // Nền trắng cho card
        elevation: 2, // Bóng đổ trên Android
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        marginTop:10,
        alignItems:"center"
    },
    
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        alignItems:"center"
      }
});
