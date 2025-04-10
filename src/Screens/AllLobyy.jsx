import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
    Text,
    View,
    Image,
    FlatList,
    TouchableOpacity,
    Dimensions,
    Pressable,
    StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Hall } from '../redux/HallSlice';
import Lottie from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../AppContext'; // Thêm AppContext
import AntDesign from 'react-native-vector-icons/AntDesign';

const { width } = Dimensions.get('window');

const AllLobyy = ({ navigation }) => {
    const dispatch = useDispatch();
    const { HallData = [], HallStatus } = useSelector(state => state.hall);
    const { user, isLoading: contextLoading } = useContext(AppContext); // Lấy user từ AppContext
    const [loading, setLoading] = useState(false);

    // Kiểm tra user khi component mount hoặc user thay đổi
    useEffect(() => {
        if (!contextLoading && !user) {
            console.log('User không tồn tại, không tải dữ liệu');
            setLoading(false);
            navigation.reset({
                index: 0,
                routes: [{ name: 'SignIn' }],
            });
        }
    }, [user, contextLoading, navigation]);

    // Gọi API lấy danh sách sảnh
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                await dispatch(Hall()).unwrap();
            } catch (error) {
                console.error('Lỗi khi lấy danh sách sảnh:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            setLoading(false);
        };
    }, [dispatch, user]);

    const renderHallItem = useCallback(
        ({ item }) => {
            if (!user || !item || !item._id) return null;
            return (
                <Pressable
                    onPress={() => navigation.navigate('HallWeddings', { productIdHall: item._id })}
                    android_ripple={{ color: '#e0e0e0' }}
                >
                    <View style={styles.backgroudhall}>
                        <Image
                            source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
                            style={styles.imghall}
                        />
                        <Text style={styles.namehall} numberOfLines={1}>
                            {item.name || 'Unnamed Hall'}
                        </Text>
                        <View style={styles.bottomhall}>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Image
                                    source={require('../Assets/Images/numberperson.png')}
                                    style={styles.iconSmall}
                                />
                                <Text style={styles.guestText}>
                                    {item.SoLuongKhach || 0} Khách
                                </Text>
                            </View>
                        </View>
                    </View>
                </Pressable>
            );
        },
        [navigation, user]
    );

    const renderLoading = () => (
        <View style={styles.loadingContainer}>
            <Lottie
                source={require('../Assets/Animations/blackloading.json')}
                autoPlay
                loop
                style={styles.loadingAnimation}
            />
            <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
    );

    const renderContent = useCallback(() => {
        if (!user) return null;

        if (loading || HallStatus === 'loading') return renderLoading();
        if (HallStatus === 'failed') {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Không thể tải dữ liệu!</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={() => dispatch(Hall())}
                    >
                        <Text style={styles.retryButtonText}>Thử lại</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        const filteredHallData = HallData.filter(
            (item) => item && item._id && typeof item._id === 'string'
        );

        if (!filteredHallData.length) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Không tìm thấy sảnh nào!</Text>
                </View>
            );
        }

        return (
            <FlatList
                data={filteredHallData}
                renderItem={renderHallItem}
                keyExtractor={(item) => item._id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.flatListContent}
                style={styles.flatList}
            />
        );
    }, [HallData, HallStatus, loading, user, dispatch, renderHallItem]);

    if (contextLoading) {
        return (
            <SafeAreaView style={styles.container}>
                {renderLoading()}
            </SafeAreaView>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("TabNavigation")}>
                    <AntDesign name="arrowleft" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Tất cả Sảnh</Text>
                <TouchableOpacity onPress={() => navigation.navigate('TabNavigation')}>
                    <Image source={require('../Assets/Images/home48.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>

            {renderContent()}
        </SafeAreaView>
    );
};

export default AllLobyy;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
       
        paddingBottom: 10,
        paddingHorizontal: 10,
    },
    icon: {
        width: 24,
        height: 24,
    },
    icon_1: {
        width: 20,
        height: 15,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Playfair_me',
        color: '#333',
    },
    bottomhall: {
        flexDirection: "row",
        justifyContent: 'space-between',
        paddingLeft: 10,
        width: "100%",
    },
    namehall: {
        fontSize: 18,
        fontFamily: 'Playfair_me',
        marginTop: 5,
        color: '#555',
    },
    imghall: {
        width: '100%',
        height: 130,
        borderRadius: 8,
        marginBottom: 8,
    },
    backgroudhall: {
        width: width - 40,
        height: width * 0.55,
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
    },
    container: {
        width: '100%',
        height: '100%',
        padding: 10,
        backgroundColor: '#fff',
        alignItems: "center",
    },
    iconSmall: {
        width: 15,
        height: 15,
        marginRight: 5,
    },
    flatListContent: {
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingAnimation: {
        width: 100,
        height: 100,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#555',
        fontFamily: 'Playfair_me',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#FF3B30',
        fontFamily: 'Playfair_me',
    },
    guestText: {
        fontFamily: 'Playfair_me',
        fontSize: 14,
        color: '#666',
    },
});