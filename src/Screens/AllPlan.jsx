import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, ActivityIndicator, Button } from 'react-native';
import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plan } from '../redux/GetAllPlanSlice';

const AllPlan = ({ navigation }) => {
    const dispatch = useDispatch();
    const { AllPlanData, AllPlanStatus } = useSelector((state) => state.allplan);

    // Dispatch action để lấy dữ liệu kế hoạch chỉ khi component mount
    useEffect(() => {
        dispatch(Plan());
    }, [dispatch]);

    // Component ProductCard với TouchableOpacity có onPress
    const ProductCard = useCallback(({ item }) => (
        <TouchableOpacity 
            onPress={() => navigation.navigate('PlanDetail', { planId: item._id })} // Điều hướng đến chi tiết kế hoạch (có thể tùy chỉnh)
        >
            <View style={styles.card}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>{item.totalPrice}đ</Text>
                
                <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>{item.status || 'Chưa có trạng thái'}</Text>
                </View>
            </View>
        </TouchableOpacity>
    ), [navigation]);

    // Hàm render nội dung dựa trên status với xử lý lỗi tốt hơn
    const renderContent = useCallback(() => {
        switch (AllPlanStatus) {
            case 'idle':
                return (
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusText}>Đang chờ dữ liệu...</Text>
                    </View>
                );
            case 'loading':
                return (
                    <View style={styles.statusContainer}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                    </View>
                );
            case 'succeeded':
                return AllPlanData && AllPlanData.length > 0 ? (
                    <FlatList
                        data={AllPlanData}
                        keyExtractor={(item) => item._id}
                        renderItem={ProductCard}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.flatListContent}
                    />
                ) : (
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusText}>Không có kế hoạch nào để hiển thị!</Text>
                    </View>
                );
            case 'failed':
                return (
                    <View style={styles.statusContainer}>
                        <Text style={styles.errorText}>Không thể tải dữ liệu!</Text>
                        <TouchableOpacity 
                            style={styles.retryButton} 
                            onPress={() => dispatch(Plan())}
                        >
                            <Text style={styles.retryButtonText}>Thử lại</Text>
                        </TouchableOpacity>
                    </View>
                );
            default:
                return null;
        }
    }, [AllPlanData, AllPlanStatus, dispatch, ProductCard]);

    

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={()=>navigation.navigate("TabNavigation")}>
                    <Image source={require('../Assets/Images/back.png')} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.title}>Plan</Text>
                <TouchableOpacity onPress={() => navigation.navigate('TabNavigation')}>
                    <Image source={require('../Assets/Images/home48.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>

            <View style={styles.listContainer}>
                {renderContent()}
            </View>
        </View>
    );
};

export default AllPlan;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        paddingTop: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#FFFFFF',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    icon: {
        width: 28,
        height: 28,
        tintColor: '#007AFF',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
        letterSpacing: 0.5,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    flatListContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    productName: {
        fontSize: 18, // Giảm kích thước font để tránh tràn giao diện
        fontWeight: '600',
        color: '#1A1A1A',
        marginBottom: 5,
    },
    productPrice: {
        fontSize: 16, // Điều chỉnh kích thước font cho giá
        fontWeight: 'bold',
        color: '#FF3B30',
        marginBottom: 5,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
    },
    statusContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusText: {
        fontSize: 16,
        color: '#1A1A1A',
        textAlign: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#007AFF',
        marginTop: 10,
    },
    errorText: {
        fontSize: 16,
        color: '#FF3B30',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});