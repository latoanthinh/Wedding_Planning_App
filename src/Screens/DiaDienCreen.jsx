import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Cate_decorates } from '../redux/Cate_decoratesSlice';
import { getProductsByDecorates } from '../redux/DecoratesByCateSlice';

const DiaDienCreen = ({ navigation }) => {
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const dispatch = useDispatch();
    const { Cate_decoratesData, Cate_decoratesStatus } = useSelector((state) => state.cate_decorates);
    const { products, status } = useSelector((state) => state.decoratesbyCate);

    useEffect(() => {
        dispatch(Cate_decorates());
    }, [dispatch]);

    useEffect(() => {
        if (Cate_decoratesStatus === 'succeeded' && Cate_decoratesData.length > 0) {
            setSelectedCategoryId(Cate_decoratesData[0]._id);
        }
    }, [Cate_decoratesData, Cate_decoratesStatus]);

    useEffect(() => {
        if (selectedCategoryId) {
            dispatch(getProductsByDecorates(selectedCategoryId));
        }
    }, [selectedCategoryId, dispatch]);

    const handleSelect = (id) => {
        setSelectedCategoryId(id);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => {}}>
            <View style={styles.itemContainer}>
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemDescription} numberOfLines={2}>{item.Description}</Text>
                    <Text style={styles.itemPrice}>${item.price}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderCategoryItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleSelect(item._id)}>
            <View style={[styles.categoryItem, selectedCategoryId === item._id && styles.selectedCategory]}>
                <Text style={[styles.categoryText, selectedCategoryId === item._id && styles.selectedCategoryText]}>
                    {item.name}
                </Text>
            </View>
        </TouchableOpacity>
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

            <FlatList
                horizontal
                data={Cate_decoratesData}
                renderItem={renderCategoryItem}
                keyExtractor={(item) => item._id.toString()}
                style={styles.categoryList}
                contentContainerStyle={styles.categoryListContent} // Thêm để kiểm soát khoảng cách
                showsHorizontalScrollIndicator={false}
            />

            {status === 'loading' ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6F61" />
                </View>
            ) : (
                <FlatList
                    numColumns={2}
                    data={products}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id.toString()}
                    style={styles.productList}
                    contentContainerStyle={styles.productListContent} // Thêm để tối ưu khoảng cách
                />
            )}
        </View>
    );
};

export default DiaDienCreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        elevation: 5,
        marginTop:50
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: '#FF6F61',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2D2D2D',
        letterSpacing: 0.2,
    },
    categoryList: {
        flexGrow: 0, // Ngăn không cho danh sách mở rộng quá mức
    },
    categoryListContent: {
        paddingHorizontal: 15,
        paddingVertical: 8, // Giảm khoảng cách dọc
    },
    categoryItem: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        elevation: 2,
    },
    selectedCategory: {
        backgroundColor: '#FF6F61',
        borderColor: '#FF6F61',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#555',
    },
    selectedCategoryText: {
        color: '#FFFFFF',
    },
    productList: {
        flex: 1, // Đảm bảo danh sách sản phẩm chiếm hết không gian còn lại
    },
    productListContent: {
        paddingHorizontal: 10,
        paddingTop: 10, // Khoảng cách nhỏ giữa danh mục và sản phẩm
        paddingBottom: 20,
    },
    itemContainer: {
        flex: 1,
        margin: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        width:180
    },
    image: {
        width: '100%',
        height: 130,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    itemInfo: {
        padding: 10,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: 12,
        color: '#888',
        marginBottom: 6,
        lineHeight: 16,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FF6F61',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});