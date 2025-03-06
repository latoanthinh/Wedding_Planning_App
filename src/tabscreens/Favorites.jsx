import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

const Favorites = ({ navigation }) => {
    const dispatch = useDispatch();
   
    const [favoritesCombos, setFavoritesCombos] = useState([
        { _id: '1', name: 'Combo 1', description: 'Combo tiết kiệm 15%', image: require('../Assets/Images/combo.png') },
        { _id: '2', name: 'Combo 2', description: 'Combo gia đình', image: require('../Assets/Images/combo.png') },
        { _id: '3', name: 'Combo 3', description: 'Combo đặc biệt', image: require('../Assets/Images/combo.png') }
    ]);

    const [favoritesItems, setFavoritesItems] = useState([
        { _id: '1', name: 'Sản phẩm 1', description: 'Mô tả sản phẩm 1', image: require('../Assets/Images/dresse.png'), price: 250000 },
        { _id: '2', name: 'Sản phẩm 2', description: 'Mô tả sản phẩm 2', image: require('../Assets/Images/dresse.png'), price: 350000 },
        { _id: '3', name: 'Sản phẩm 3', description: 'Mô tả sản phẩm 3', image: require('../Assets/Images/dresse.png'), price: 150000 }
    ]);

    useEffect(() => {
        // fetch data nếu cần
    }, [dispatch]);

    // Format price with separator
    const formatPrice = (price) => {
        return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // Remove combo from favorites
    const removeCombo = (id) => {
        setFavoritesCombos(favoritesCombos.filter(combo => combo._id !== id));
    };

    // Remove item from favorites
    const removeItem = (id) => {
        setFavoritesItems(favoritesItems.filter(item => item._id !== id));
    };

    // Empty state component
    const EmptyState = ({ title, message }) => (
        <View style={styles.emptyContainer}>
            <Image 
                source={require('../Assets/Images/heart_outline.png')} 
                style={styles.emptyIcon} 
            />
            <Text style={styles.emptyTitle}>{title}</Text>
            <Text style={styles.emptyMessage}>{message}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header - đã bỏ nút back, hạ paddingTop xuống */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Favorites</Text>
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                {/* Favorite Combos Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Combo yêu thích</Text>
                    
                    {favoritesCombos.length > 0 ? (
                        <ScrollView 
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.comboList}
                        >
                            {favoritesCombos.map(item => (
                                <TouchableOpacity
                                    key={item._id}
                                    onPress={() => navigation.navigate('ComboDetail', { comboId: item._id })}
                                    style={styles.comboCard}
                                >
                                    <Image source={item.image} style={styles.comboImage} />
                                    <View style={styles.comboContent}>
                                        <Text style={styles.comboName}>{item.name}</Text>
                                        <Text style={styles.comboDescription} numberOfLines={1}>{item.description}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.heartButton}
                                        onPress={() => removeCombo(item._id)}
                                    >
                                        <Image 
                                            source={require('../Assets/Images/heart_filled.png')} 
                                            style={styles.heartIcon} 
                                        />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    ) : (
                        <EmptyState 
                            title="Không có combo yêu thích" 
                            message="Hãy thêm combo vào danh sách yêu thích của bạn"
                        />
                    )}
                </View>

                {/* Favorite Items Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Các mục yêu thích</Text>
                    
                    {favoritesItems.length > 0 ? (
                        <View style={styles.itemList}>
                            {favoritesItems.map(item => (
                                <TouchableOpacity
                                    key={item._id}
                                    onPress={() => navigation.navigate('ItemDetail', { itemId: item._id })}
                                    style={styles.itemCard}
                                >
                                    <Image source={item.image} style={styles.itemImage} />
                                    <View style={styles.itemContent}>
                                        <Text style={styles.itemName}>{item.name}</Text>
                                        <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
                                        <Text style={styles.itemPrice}>{formatPrice(item.price)}đ</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.heartButton}
                                        onPress={() => removeItem(item._id)}
                                    >
                                        <Image 
                                            source={require('../Assets/Images/heart_filled.png')} 
                                            style={styles.heartIcon} 
                                        />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <EmptyState 
                            title="Không có mục yêu thích" 
                            message="Hãy thêm sản phẩm vào danh sách yêu thích của bạn"
                        />
                    )}
                </View>
            </ScrollView>

            {/* Floating Add Button */}
            <TouchableOpacity 
                style={styles.floatingButton}
                onPress={() => navigation.navigate('TabNavigation')}//cần all product
            >
                <Text style={styles.floatingButtonText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Favorites;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 20, // giảm paddingTop để header thấp hơn
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#212121',
        letterSpacing: 0.5,
    },
    scrollContainer: {
        paddingBottom: 100, // không gian cho floating button
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#212121',
        marginBottom: 16,
        letterSpacing: 0.3,
    },
    comboList: {
        paddingRight: 16,
    },
    comboCard: {
        width: 240,
        marginRight: 16,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    comboImage: {
        width: '100%',
        height: 120,
        resizeMode: 'cover',
    },
    comboContent: {
        padding: 12,
    },
    comboName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 4,
    },
    comboDescription: {
        fontSize: 14,
        color: '#757575',
    },
    heartButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    heartIcon: {
        width: 18,
        height: 18,
        tintColor: '#F44336',
    },
    itemList: {
        gap: 16,
    },
    itemCard: {
        flexDirection: 'row',
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
        marginBottom: 16,
    },
    itemImage: {
        width: 100,
        height: 100,
        resizeMode: 'cover',
    },
    itemContent: {
        flex: 1,
        padding: 12,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 8,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F44336',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        tintColor: '#9E9E9E',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 8,
    },
    emptyMessage: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
    },
    floatingButton: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#ffb3c6',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    floatingButtonText: {
        fontSize: 32,
        color: '#FFFFFF',
        fontWeight: '300',
    },
});
