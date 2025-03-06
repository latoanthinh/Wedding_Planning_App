import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, ActivityIndicator, Dimensions, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Cate_decorates } from '../redux/Cate_decoratesSlice';
import { getProductsByDecorates } from '../redux/DecoratesByCateSlice';
import Lottie from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get("window");

const DiaDiem_Screen = ({ navigation }) => {
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

    const renderLoading = () => (
        <View style={styles.loadingContainer}>
            <Lottie source={require('../Assets/Animations/loading.json')} autoPlay loop style={styles.loadingAnimation} />
            <Text style={styles.loadingText}>Chờ xíu...</Text>
        </View>
    );

    const formatPrice = (num) => {
        return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + " VNĐ" : "0";
    };

    const renderItem = ({ item }) => (
        <Pressable onPress={() => { }}>
            <View style={styles.itemContainer}>
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemDescription} numberOfLines={2}>{item.Description}</Text>
                    <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                </View>
            </View>
        </Pressable>
    );

    const renderCategoryItem = ({ item }) => (
        <Pressable onPress={() => handleSelect(item._id)}>
            <View style={[styles.categoryItem, selectedCategoryId === item._id && styles.selectedCategory]}>
                <Text style={[styles.categoryText, selectedCategoryId === item._id && styles.selectedCategoryText]}>
                    {item.name}
                </Text>
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("TabNavigation")}>
                    <Image source={require('../Assets/Images/back.png')} style={styles.icon_1} />
                </TouchableOpacity>
                <Text style={styles.title}>Địa điểm</Text>
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
                contentContainerStyle={styles.categoryListContent}
                showsHorizontalScrollIndicator={false}
            />

            {status === 'loading' ? (
                renderLoading()
            ) : (
                <FlatList
                    numColumns={2}
                    data={products}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id.toString()}
                    style={styles.productList}
                    contentContainerStyle={styles.productListContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

export default DiaDiem_Screen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#FFFFFF',
        marginTop: 20,
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
        fontSize: 22,
        fontFamily: 'Playfair_me',
        color: '#000',
    },
    categoryList: {
        flexGrow: 0,
    },
    categoryListContent: {
        paddingHorizontal: 15,
        paddingVertical: 8,
    },
    categoryItem: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 0.5,
        borderColor: '#000',
    },
    selectedCategory: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    categoryText: {
        fontSize: 14,
        fontFamily: 'Playfair_me',
        color: '#000',
    },
    selectedCategoryText: {
        color: '#fff',
    },
    productList: {
        flex: 1,
    },
    productListContent: {
        paddingTop: 10,
        paddingBottom: 20,
        justifyContent: 'space-around',
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
        width: width * 0.45,
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
        fontFamily: 'Playfair_me',
        color: '#000',
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: 12,
        color: '#000',
        marginBottom: 6,
        lineHeight: 16,
        fontFamily: 'Playfair_me',
    },
    itemPrice: {
        fontSize: 16,
        fontFamily: 'Playfair_me',
        color: 'red',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingAnimation: {
        width: 80,
        height: 80,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        fontFamily: 'Playfair_me',
        color: '#000',
    },
});