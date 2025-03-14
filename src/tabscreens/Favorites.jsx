import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserFavorites, resetFavorites, removeFavoriteItem } from '../redux/FavoriteDeanAddSlice';
import { AppContext } from '../AppContext';

const Favorites = ({ navigation }) => {
    const dispatch = useDispatch();
    const { data, status, error } = useSelector((state) => state.favoriteset);
    const { user } = useContext(AppContext);
    const userId = user?._id;

    useEffect(() => {
        if (userId) {
            // Reset dữ liệu trước khi fetch mới
            dispatch(resetFavorites());
            dispatch(fetchUserFavorites(userId));
        } else {
            console.warn('userId không tồn tại, không thể tải danh sách yêu thích');
        }
    }, [dispatch, userId]);

    // Làm phẳng và loại bỏ trùng lặp
    const flattenData = Array.isArray(data) ? data.flat() : [];
    const validatedData = Array.from(
        new Map(flattenData.map(item => [item._id, item])).values()
    );

    const formatPrice = (price) => {
        return price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ' : '0 VNĐ';
    };

    const handleRetry = () => {
        if (userId) {
            dispatch(fetchUserFavorites(userId));
        }
    };

    const handleRemoveFavorite = (item) => {
        if (userId && item.itemId && item.type) {
            console.log(`Xóa mục yêu thích: userId=${userId}, type=${item.type}, itemId=${item.itemId}`);
            dispatch(removeFavoriteItem({ userId, type: item.type, itemId: item.itemId })).then(() => {
                // Làm mới danh sách sau khi xóa thành công
                dispatch(fetchUserFavorites(userId));
            }).catch((error) => {
                console.error('Lỗi khi xóa mục yêu thích:', error);
                Alert.alert('Lỗi', 'Không thể xóa mục yêu thích, vui lòng thử lại.');
            });
        } else {
            console.warn('Không thể xóa: Thiếu userId, type hoặc itemId', item);
            Alert.alert('Lỗi', 'Thông tin không hợp lệ.');
        }
    };

    const renderItem = ({ item }) => {
        if (!item || typeof item !== 'object' || !item._id) {
            console.warn('Dữ liệu item không hợp lệ:', item);
            return null;
        }
        return (
            <View style={styles.itemCard}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('ItemDetail', { itemId: item._id, type: item.type })}
                >
                    <Image
                        source={{ uri: item.image || 'https://via.placeholder.com/80' }}
                        style={styles.itemImage}
                        resizeMode="cover"
                    />
                    <View style={styles.itemContent}>
                        <Text style={styles.itemName} numberOfLines={1}>
                            {item.name || 'Không có tên'}
                        </Text>
                        <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveFavorite(item)}
                >
                    <Text style={styles.deleteButtonText}>Xóa</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Không có mục yêu thích</Text>
            <Text style={styles.emptyMessage}>Hãy thêm sản phẩm vào danh sách yêu thích của bạn</Text>
        </View>
    );

    if (status === 'loading') {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6F61" />
                <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
        );
    }

    if (status === 'failed') {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Lỗi: {error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                    <Text style={styles.retryButtonText}>Thử lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Danh sách yêu thích</Text>
                <View style={styles.placeholder} />
            </View>

            <FlatList
                data={validatedData}
                renderItem={renderItem}
                keyExtractor={(item, index) => item?._id?.toString() || `fallback-${index}`}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

export default Favorites;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        elevation: 2,
    },
    backIcon: {
        width: 20,
        height: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Playfair_me',
        color: '#000',
        fontWeight: '700',
    },
    placeholder: {
        width: 20,
    },
    listContent: {
        paddingBottom: 20,
        paddingTop: 10,
    },
    itemCard: {
        flexDirection: 'row',
        padding: 10,
        marginHorizontal: 10,
        marginVertical: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        alignItems: 'center',
    },
    itemImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
    },
    itemContent: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    itemName: {
        fontSize: 16,
        fontFamily: 'Playfair_me',
        color: '#000',
        fontWeight: '600',
    },
    itemPrice: {
        fontSize: 14,
        fontFamily: 'Playfair_me',
        color: 'red',
        marginTop: 5,
    },
    deleteButton: {
        backgroundColor: '#FF6F61',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginLeft: 10,
    },
    deleteButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Playfair_me',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: 50,
    },
    emptyTitle: {
        fontSize: 18,
        fontFamily: 'Playfair_me',
        color: '#000',
        fontWeight: '600',
    },
    emptyMessage: {
        fontSize: 14,
        fontFamily: 'Playfair_me',
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        fontFamily: 'Playfair_me',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#FF6F61',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 20,
        elevation: 2,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Playfair_me',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        fontFamily: 'Playfair_me',
        color: '#000',
    },
});