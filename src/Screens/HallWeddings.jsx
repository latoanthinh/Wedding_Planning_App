import {
    StyleSheet, Text, View, Image,
    TouchableOpacity, Dimensions, ScrollView, StatusBar, ActivityIndicator, Animated
} from 'react-native';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HallTheoWedding } from '../redux/HallTheoWeddingHallsSlice';
import { addFavoriteItem, removeFavoriteItem, fetchUserFavorites } from '../redux/FavoriteDeanAddSlice';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ToastAndroid } from 'react-native';
import { AppContext } from '../AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const HallWeddings = ({ route }) => {
    const { productIdHall, item } = route?.params || {};
    const dispatch = useDispatch();
    const { HallTheoWeddingFlowersData, HallTheoWeddingFlowersStatus } = useSelector(state => state.halltheowedding);
    const { data: favorites = [], status: favoritesStatus } = useSelector(state => state.favoriteset);
    const { user } = useContext(AppContext);
    const userId = user?._id;
    const navigation = useNavigation();

    const [loadingImage, setLoadingImage] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);

    const nameAnim = useRef(new Animated.Value(0)).current;
    const descAnim = useRef(new Animated.Value(0)).current;
    const priceAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (userId && productIdHall) {
            dispatch(fetchUserFavorites(userId));
        }
        if (!item && productIdHall) {
            dispatch(HallTheoWedding(productIdHall));
        }
    }, [productIdHall, dispatch, item, userId]);

    useEffect(() => {
        if (favorites && productIdHall) {
            const isFav = favorites.some((fav) => fav.itemId === productIdHall && fav.type === 'Sanh');
            setIsFavorite(isFav);
        }
    }, [favorites, productIdHall]);

    useEffect(() => {
        if ((HallTheoWeddingFlowersStatus === 'succeeded' && HallTheoWeddingFlowersData) || item) {
            Animated.stagger(300, [
                Animated.timing(nameAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(descAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(priceAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            ]).start();
        }
    }, [HallTheoWeddingFlowersStatus, HallTheoWeddingFlowersData, item]);

    const formatPrice = (price) => {
        if (price === undefined || price === null || isNaN(price)) {
            return "Liên hệ";
        }
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + " VNĐ";
    };

    const handleImageLoad = () => setLoadingImage(false);

    const handleToggleFavorite = () => {
        if (!productIdHall || !user || !user._id) {
            ToastAndroid.show('Vui lòng đăng nhập để sử dụng tính năng này', ToastAndroid.SHORT);
            navigation.navigate('LoginScreen');
            return;
        }

        const payload = { userId: user._id, type: 'Sanh', itemId: productIdHall };
        console.log('Payload gửi đi:', payload); // Ghi log để kiểm tra

        setIsFavoriteLoading(true);
        if (isFavorite) {
            dispatch(removeFavoriteItem(payload))
                .unwrap()
                .then(() => {
                    setIsFavorite(false);
                    ToastAndroid.show('Đã xóa khỏi danh sách yêu thích', ToastAndroid.SHORT);
                })
                .catch((err) => {
                    const errorMessage = err.message || 'Lỗi không xác định';
                    ToastAndroid.show(`Không thể xóa: ${errorMessage}`, ToastAndroid.SHORT);
                })
                .finally(() => setIsFavoriteLoading(false));
        } else {
            dispatch(addFavoriteItem(payload))
                .unwrap()
                .then(() => {
                    setIsFavorite(true);
                    ToastAndroid.show('Đã thêm vào danh sách yêu thích', ToastAndroid.SHORT);
                })
                .catch((err) => {
                    const errorMessage = err.message || 'Lỗi không xác định';
                    ToastAndroid.show(`Không thể thêm: ${errorMessage}`, ToastAndroid.SHORT);
                })
                .finally(() => setIsFavoriteLoading(false));
        }
    };

    const displayData = item || HallTheoWeddingFlowersData;
    if (!productIdHall) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>ID không hợp lệ</Text>
            </SafeAreaView>
        );
    }

    if (!item && HallTheoWeddingFlowersStatus === 'loading') {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#A67C52" />
            </SafeAreaView>
        );
    }

    if (!displayData) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>Không có dữ liệu chi tiết</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: displayData.image || displayData.imageUrl || 'https://via.placeholder.com/300' }}
                    style={styles.hallImage}
                    onLoad={handleImageLoad}
                    resizeMode="cover"
                />
                <View style={styles.imageOverlay} />
                <View style={styles.headerButtons}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="chevron-left" size={28} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.favoriteButton}
                        onPress={handleToggleFavorite}
                        disabled={isFavoriteLoading}
                    >
                        {isFavoriteLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Icon
                                name={isFavorite ? "heart" : "heart-outline"}
                                size={24}
                                color={isFavorite ? "#FF6B6B" : "#fff"}
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.contentCard}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    <View style={styles.titleContainer}>
                        <Animated.Text
                            style={[styles.hallName, { opacity: nameAnim, transform: [{ translateY: nameAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}
                        >
                            {displayData.name || 'Không có tên'}
                        </Animated.Text>
                        <View style={styles.ratingTag}>
                            <Icon name="star" size={16} color="#A67C52" />
                            <Text style={styles.ratingText}>4.9</Text>
                        </View>
                    </View>
                    <View style={styles.tagsContainer}>
                        <View style={styles.tagItem}><Text style={styles.tagText}>Sảnh cưới</Text></View>
                        <View style={styles.tagItem}><Text style={styles.tagText}>Sang trọng</Text></View>
                        <View style={styles.tagItem}><Text style={styles.tagText}>Cao cấp</Text></View>
                    </View>
                    
                    <View style={styles.divider} />
                    <View style={styles.featuresSection}>
                        <Text style={styles.sectionTitle}>Đặc điểm</Text>
                        <View style={styles.featureItem}>
                            <Icon name="account-group" size={20} color="#A67C52" />
                            <Text style={styles.featureText}>Sức chứa: {displayData.SoLuongKhach || 'N/A'} khách</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Icon name="check-circle" size={20} color="#A67C52" />
                            <Text style={styles.featureText}>Dịch vụ trọn gói</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Icon name="star" size={20} color="#A67C52" />
                            <Text style={styles.featureText}>Thiết kế cao cấp</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <Animated.View style={[styles.priceContainer, { opacity: priceAnim, transform: [{ translateY: priceAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
                        <Text style={styles.priceLabel}>Giá:</Text>
                        <Text style={styles.priceValue}>{formatPrice(displayData.price)}</Text>
                    </Animated.View>
                    <View style={styles.noteContainer}>
                        <Icon name="information-outline" size={22} color="#A67C52" />
                        <Text style={styles.noteText}>Giá có thể thay đổi tùy theo thời điểm</Text>
                    </View>
                </ScrollView>
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.contactButton} onPress={() => navigation.navigate('TabNavigation', { screen: 'Message' })}>
                        <Icon name="phone" size={20} color="#A67C52" />
                        <Text style={styles.contactButtonText}>Liên hệ</Text>
                    </TouchableOpacity>
                   
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDF8F3',
    },
    imageContainer: {
        height: 300,
        width: '100%',
        position: 'relative',
    },
    hallImage: {
        width: '100%',
        height: '100%',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerButtons: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        zIndex: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        marginTop: -30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingTop: 25,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    hallName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        flex: 1,
        fontFamily: 'serif',
    },
    ratingTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9E9',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    ratingText: {
        marginLeft: 5,
        color: '#A67C52',
        fontWeight: 'bold',
        fontFamily: 'serif',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    tagItem: {
        backgroundColor: '#F7E9D7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginRight: 10,
        marginBottom: 10,
    },
    tagText: {
        color: '#A67C52',
        fontSize: 12,
        fontWeight: '500',
        fontFamily: 'serif',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 14,
        fontFamily: 'serif',
    },
    descriptionText: {
        fontSize: 15,
        color: '#555555',
        lineHeight: 22,
        marginBottom: 10,
        fontFamily: 'serif',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1E4D8',
        marginVertical: 20,
    },
    featuresSection: {
        marginBottom: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    featureText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#444444',
        fontFamily: 'serif',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#220000',
        padding: 15,
        borderRadius: 15,
        marginVertical: 20,
        shadowColor: '#B78D51',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
    priceLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginRight: 10,
        fontFamily: 'serif',
    },
    priceValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'serif',
        letterSpacing: 1,
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8E8',
        padding: 14,
        borderRadius: 10,
        marginBottom: 20,
    },
    noteText: {
        fontSize: 15,
        color: '#A67C52',
        marginLeft: 10,
        fontFamily: 'serif',
    },
    actionButtons: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#F1E4D8',
    },
    contactButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#A67C52',
        borderRadius: 10,
       
    },
    contactButtonText: {
        marginLeft: 8,
        color: '#A67C52',
        fontWeight: '600',
        fontFamily: 'serif',
    },
    addToCartButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#220000',
        paddingVertical: 12,
        borderRadius: 10,
        shadowColor: '#B78D51',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    addToCartText: {
        marginLeft: 8,
        color: '#FFFFFF',
        fontWeight: '600',
        fontFamily: 'serif',
    },
    errorText: {
        fontSize: 16,
        fontFamily: 'serif',
        color: '#FF3B30',
        textAlign: 'center',
        marginTop: 20,
    },
});

export default HallWeddings;