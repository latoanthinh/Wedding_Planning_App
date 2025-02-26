import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, FlatList, ImageBackground } from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chitiet } from '../redux/ChitietsanphamSlice';

const DetailClothes = ({ navigation, route }) => {
    const { productIdClo } = route?.params;
    const dispatch = useDispatch();
    const { ChitietData, ChitietStatus, error } = useSelector(state => state.chitiet);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (productIdClo && ChitietStatus === 'idle') {
            dispatch(Chitiet(productIdClo));
        }
    }, [productIdClo, ChitietStatus]);

    useEffect(() => {
        if (ChitietStatus === 'succeeded' && ChitietData?.imageUrl?.length > 0) {
            setSelectedImage(prev => prev || ChitietData.imageUrl[0]);
        }
    }, [ChitietData, ChitietStatus]);

    const renderDetailItem = ({ item }) => (
        <TouchableOpacity onPress={() => setSelectedImage(item)} style={styles.thumbnailWrapper}>
            <View style={[styles.thumbnailBackground, selectedImage === item && styles.selectedThumbnailBackground]}>
                <Image source={{ uri: item }} style={styles.thumbnail} />
            </View>
        </TouchableOpacity>
    );

    if (ChitietStatus === 'loading') return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
    if (ChitietStatus === 'failed') return <Text style={styles.errorText}>Error: {error}</Text>;
    if (!ChitietData?.imageUrl) return <Text style={styles.errorText}>No data available</Text>;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("TabNavigation")}>
                    <Image source={require('../Assets/Images/back.png')} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.title}>Detail</Text>
                <TouchableOpacity onPress={() => navigation.navigate('TabNavigation')}>
                    <Image source={require('../Assets/Images/home48.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>

            <View style={styles.imageContainer}>
                {selectedImage && (
                    <ImageBackground source={{ uri: selectedImage }} style={styles.mainImage}>
                        <View style={styles.thumbnailOverlay}>
                            <FlatList
                                data={ChitietData.imageUrl}
                                horizontal
                                keyExtractor={(item, index) => `${index}`}
                                renderItem={renderDetailItem}
                            />
                        </View>
                    </ImageBackground>
                )}
            </View>

            <Text style={styles.productName}>{ChitietData.name}</Text>
            <Text style={styles.categoryText}>Pre Wedding / Wedding Day</Text>
            <Text style={styles.sectionTitle}>More Information</Text>

            <View style={styles.infoContainer}>
                {Object.entries({
                    Silhouette: ChitietData.Silhouette,
                    Fabrics: ChitietData.fabrics,
                    Color: ChitietData.color,
                    Neckline: ChitietData.neckline,
                    Sleeves: ChitietData.sleeve
                }).map(([label, value], index) => (
                    <View style={styles.row} key={index}>
                        <Text style={styles.label}>{label}</Text>
                        <Text style={styles.value}>{value}</Text>
                    </View>
                ))}
            </View>

            <TouchableOpacity><Text style={styles.viewSizeGuide}>View size guide</Text></TouchableOpacity>
            <TouchableOpacity style={styles.contactButton}><Text style={styles.contactText}>Contact</Text></TouchableOpacity>
        </View>
    );
};

export default DetailClothes;

const styles = StyleSheet.create({
    container: { backgroundColor: '#FFFFFF', flex: 1, alignItems: 'center', paddingHorizontal: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingTop: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
    icon: { width: 24, height: 24 },
    title: { fontSize: 22, fontWeight: 'bold', color: 'black' },
    imageContainer: { marginTop: 15, width: 370, height: 360, borderRadius: 80, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
    mainImage: { width: '100%', height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
    thumbnailOverlay: { position: 'absolute', bottom: 0, width: '100%', paddingVertical: 8, alignItems: 'center' },
    thumbnailWrapper: { marginHorizontal: 5 },
    thumbnailBackground: { backgroundColor: '#E0E0E0', borderRadius: 10, padding: 1.5 },
    selectedThumbnailBackground: { backgroundColor: '#D3D3D3' },
    thumbnail: { width: 60, height: 60, borderRadius: 10 },
    productName: { fontSize: 18, fontWeight: 'bold', color: 'black', marginTop: 15 },
    categoryText: { fontSize: 16, color: 'black', marginTop: 5 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: 'black', marginTop: 10 },
    infoContainer: { width: '100%', marginTop: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
    label: { fontSize: 14, color: '#555' },
    value: { fontSize: 14, fontWeight: 'bold', color: '#000' },
    viewSizeGuide: { fontSize: 14, color: '#007BFF', marginTop: 10, textDecorationLine: 'underline' },
    contactButton: { backgroundColor: '#555', paddingVertical: 10, width: '100%', borderRadius: 5, marginTop: 20, alignItems: 'center' },
    contactText: { fontSize: 16, color: '#FFF', fontWeight: 'bold' },
    loader: { marginTop: 20 },
    errorText: { color: 'red', fontSize: 16, marginTop: 20 }
});
