import {
    StyleSheet, Text, View, Image,
    TouchableOpacity, Dimensions, Pressable
} from 'react-native';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HallTheoWedding } from '../redux/HallTheoWeddingHallsSlice';
import Lottie from 'lottie-react-native';

const { width } = Dimensions.get('window');

const HallWeddings = ({ navigation, route }) => {
    const { productIdHall } = route?.params;
    const dispatch = useDispatch();
    const { HallTheoWeddingFlowersData, HallTheoWeddingFlowersStatus } = useSelector(state => state.halltheowedding);

    useEffect(() => {
        if (productIdHall) {
            dispatch(HallTheoWedding(productIdHall));
        }
    }, [productIdHall, dispatch]);

    // Hàm định dạng giá tiền
    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + " VNĐ";
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
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image source={require('../Assets/Images/back.png')} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.title}>Chi Tiết Sảnh</Text>
                <TouchableOpacity onPress={() => navigation.navigate('TabNavigation')}>
                    <Image source={require('../Assets/Images/home48.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>

            {/* Loading */}
            {HallTheoWeddingFlowersStatus === 'loading' && renderLoading()}

            {/* Nếu có dữ liệu, hiển thị item đầu tiên */}
            {HallTheoWeddingFlowersStatus === 'succeeded' && HallTheoWeddingFlowersData && (
                <Pressable style={styles.cardContainer}>
                    <Image source={{ uri: HallTheoWeddingFlowersData.imageUrl }} style={styles.imghall} />
                    <View style={styles.cardContent}>
                        <Text style={styles.namehall} numberOfLines={1}>{HallTheoWeddingFlowersData.name}</Text>
                        <View style={styles.bottomhall}>
                            <View style={styles.infoRow}>
                                <Image source={require('../Assets/Images/numberperson.png')} style={styles.iconSmall} />
                                <Text style={styles.infoText}>{HallTheoWeddingFlowersData.SoLuongKhach} Khách</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Image source={require('../Assets/Images/price.png')} style={styles.iconSmall} />
                                <Text style={styles.priceText}>{formatPrice(HallTheoWeddingFlowersData.price)}</Text>
                            </View>
                        </View>
                    </View>
                </Pressable>
            )}

            {/* Trường hợp lỗi hoặc không có dữ liệu */}
            {HallTheoWeddingFlowersStatus === 'failed' && <Text style={styles.errorText}>Không thể tải dữ liệu!</Text>}
        </View>
    );
};

export default HallWeddings;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
        paddingTop: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        elevation: 3,
        marginTop:30
    },
    icon: {
        width: 28,
        height: 28,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 15,
        marginHorizontal: 15,
        marginTop: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    imghall: {
        width: '100%',
        height: width * 0.5,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    cardContent: {
        padding: 15,
    },
    namehall: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    bottomhall: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconSmall: {
        width: 18,
        height: 18,
        marginRight: 5,
    },
    infoText: {
        fontSize: 16,
        color: '#555',
    },
    priceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#E53935',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingAnimation: {
        width: 120,
        height: 120,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#E53935',
        marginTop: 20,
    },
});
