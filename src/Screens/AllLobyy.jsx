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
    StyleSheet
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Hall } from '../redux/HallSlice';
import Lottie from 'lottie-react-native';

const { width } = Dimensions.get('window');

const AllLobyy = ({ navigation }) => {


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

    const renderHallItem = ({ item }) => {
        return (
            <Pressable onPress={() => navigation.navigate('HallWeddings', { productIdHall: item._id })}>
                <View style={styles.backgroudhall}>
                    <Image source={{ uri: item.imageUrl }} style={styles.imghall} />
                    <Text style={styles.namehall} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.bottomhall}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Image source={require('../Assets/Images/numberperson.png')} style={styles.iconSmall} />
                            <Text>{item.SoLuongKhach} Khách</Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        );
    };
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
    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("TabNavigation")}>
                    <Image source={require('../Assets/Images/back.png')} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.title}>Tất cả Sảnh</Text>
                <TouchableOpacity onPress={() => navigation.navigate('TabNavigation')}>
                    <Image source={require('../Assets/Images/home48.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>
            {HallStatus === 'loading' && renderLoading()}
            {HallStatus === 'succeeded' && (
                <FlatList
                    data={HallData}
                    renderItem={renderHallItem}
                    keyExtractor={item => item._id.toString()}
                    showsVerticalScrollIndicator={false} 
                    contentContainerStyle={styles.flatListContent}
                />
            )}

            {HallStatus === 'failed' && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Không thể tải dữ liệu!</Text>
                </View>
            )}
        </View>
    )
}

export default AllLobyy

const styles = StyleSheet.create({

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingTop: 30,
        paddingBottom: 10,
        paddingHorizontal: 10
    },
    icon: { width: 24, height: 24 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    bottomhall: {
        flexDirection: "row",
        justifyContent: 'space-between',
        padding: 10,
        width: "100%"
    },
    namehall: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 5,
        color: '#555'
    },
    imghall: {
        width: "99%",
        height: width * 0.35,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    backgroudhall: {
        width: 350,
        height: width * 0.55,
        marginRight: 10,
        borderRadius: 15,
        overflow: "hidden",
        backgroundColor: "#fff",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        marginTop: 15,
        alignItems: "center",
        marginLeft: 10
    },
    container: {
        width: '100%',
        height: '100%',
        padding: 10,
        backgroundColor: '#fff',
        alignItems: "center",
        justifyContent: "center",
    },
    iconSmall: {
        width: 15,
        height: 15,
        marginRight: 5
    },
    flatListContent: {
        paddingBottom: 20
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingAnimation: {
        width: 100,
        height: 100,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
    }


})