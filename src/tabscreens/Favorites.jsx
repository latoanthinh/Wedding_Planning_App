import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, ActivityIndicator, Alert } from 'react-native';
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
            Alert.alert(
                'Xác nhận',
                'Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách yêu thích?',
                [
                    {
                        text: 'Hủy',
                        style: 'cancel',
                    },
                    {
                        text: 'Xóa',
                        onPress: () => {
                            console.log(`Xóa mục yêu thích: userId=${userId}, type=${item.type}, itemId=${item.itemId}`);
                            dispatch(removeFavoriteItem({ userId, type: item.type, itemId: item.itemId }))
                                .then(() => {
                                    // Làm mới danh sách sau khi xóa thành công
                                    dispatch(fetchUserFavorites(userId));
                                })
                                .catch((error) => {
                                    console.error('Lỗi khi xóa mục yêu thích:', error);
                                    Alert.alert('Lỗi', 'Không thể xóa mục yêu thích, vui lòng thử lại.');
                                });
                        },
                        style: 'destructive',
                    },
                ]
            );
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
                    style={styles.itemContainer}
                    onPress={() => navigation.navigate('ItemDetail', { itemId: item._id, type: item.type })}
                >
                    <Image
                        source={{ uri: item.image || 'https://via.placeholder.com/90' }}
                        style={styles.itemImage}
                        resizeMode="cover"
                    />
                    <View style={styles.itemContent}>
                        <Text style={styles.itemName} numberOfLines={2}>
                            {item.name || 'Không có tên'}
                        </Text>
                        <View style={styles.itemDetails}>
                            <Text style={styles.itemCategory}>
                                {item.category || 'Chưa phân loại'}
                            </Text>
                            <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveFavorite(item)}
                >
                    <Text style={styles.deleteButtonText}>✕</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>♡</Text>
            </View>
            <Text style={styles.emptyTitle}>Không có mục yêu thích</Text>
            <Text style={styles.emptyMessage}>Hãy thêm sản phẩm vào danh sách yêu thích của bạn</Text>
            <TouchableOpacity 
                style={styles.shopButton}
                onPress={() => navigation.navigate('HomeScreen')}
            >
                <Text style={styles.shopButtonText}>Tiếp tục mua sắm</Text>
            </TouchableOpacity>
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
                <View style={styles.errorIconContainer}>
                    <Text style={styles.errorIcon}>!</Text>
                </View>
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
                <Text style={styles.itemCount}>{validatedData.length} sản phẩm</Text>
            </View>

            <FlatList
                data={validatedData}
                renderItem={renderItem}
                keyExtractor={(item, index) => item?._id?.toString() || `fallback-${index}`}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={[
                    styles.listContent,
                    validatedData.length === 0 && styles.emptyListContent
                ]}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

export default Favorites;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },
    header: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTitle: {
        fontSize: 22,
        fontFamily: 'Playfair_me',
        color: '#000',
        fontWeight: '700',
    },
    itemCount: {
        fontSize: 14,
        fontFamily: 'Playfair_me',
        color: '#666',
        marginTop: 4,
    },
    listContent: {
        paddingBottom: 20,
        paddingTop: 10,
    },
    emptyListContent: {
        flexGrow: 1,
    },
    itemCard: {
        flexDirection: 'row',
        padding: 12,
        marginHorizontal: 12,
        marginVertical: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        alignItems: 'center',
    },
    itemContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemImage: {
        width: 90,
        height: 90,
        borderRadius: 10,
    },
    itemContent: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
        height: 80,
    },
    itemName: {
        fontSize: 16,
        fontFamily: 'Playfair_me',
        color: '#000',
        fontWeight: '600',
        lineHeight: 22,
    },
    itemDetails: {
        marginTop: 8,
    },
    itemCategory: {
        fontSize: 14,
        fontFamily: 'Playfair_me',
        color: '#666',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 16,
        fontFamily: 'Playfair_me',
        color: '#FF6F61',
        fontWeight: '700',
    },
    deleteButton: {
        backgroundColor: '#FF6F61',
        width: 36,
        height: 36,
        borderRadius: 18,
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: 100,
    },
    emptyIconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#F2F2F2',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyIcon: {
        fontSize: 40,
        color: '#CCCCCC',
    },
    errorIconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 111, 97, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    errorIcon: {
        fontSize: 40,
        color: '#FF6F61',
        fontWeight: 'bold',
    },
    emptyTitle: {
        fontSize: 20,
        fontFamily: 'Playfair_me',
        color: '#000',
        fontWeight: '600',
    },
    emptyMessage: {
        fontSize: 16,
        fontFamily: 'Playfair_me',
        color: '#666',
        marginTop: 10,
        textAlign: 'center',
        marginBottom: 20,
    },
    shopButton: {
        backgroundColor: '#FF6F61',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        elevation: 2,
        marginTop: 10,
    },
    shopButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Playfair_me',
        fontWeight: '600',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#FF6F61',
        fontSize: 16,
        fontFamily: 'Playfair_me',
        marginVertical: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#FF6F61',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        elevation: 2,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Playfair_me',
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        fontFamily: 'Playfair_me',
        color: '#000',
    },
});