import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Switch, Alert, ActivityIndicator, Modal } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserStatusIndicator from '../components/UserStatusIndicator';
import { useDispatch } from 'react-redux';
import { updateUserOnlineStatus } from '../redux/UserActivitySlice';
import { reset } from '../redux/LoginSlice';


const Settings = (props) => {
    const { navigation } = props;
    const { user, logout, isLoading } = useContext(AppContext);
    const dispatch = useDispatch();

    const [isOnline, setIsOnline] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            console.log('User không tồn tại, chuyển hướng về SignIn');
            navigation.reset({
                index: 0,
                routes: [{ name: 'SignIn' }],
            });
        }
    }, [user, isLoading, navigation]);

    const isValidAvatar = (avatar) => {
        return typeof avatar === 'string' && avatar.length > 0 && avatar.startsWith('http');
    };

    const handle = (screenName, params) => {
        if (!user) {
            console.log('User không tồn tại, không thể chuyển trang');
            Alert.alert('Lỗi', 'Vui lòng đăng nhập lại để tiếp tục.');
            navigation.reset({
                index: 0,
                routes: [{ name: 'SignIn' }],
            });
            return;
        }
        navigation.navigate(screenName, params);
    };

    const toggleOnlineStatus = (value) => {
        setIsOnline(value);
        if (user?._id) {
            dispatch(updateUserOnlineStatus({
                userId: user._id,
                isOnline: value,
            }));
        }
    };

    const performLogout = async () => {
        try {
            setIsLoggingOut(true);
            setShowLogoutModal(false);

            // Gọi logout và chờ hoàn tất
            await logout();

            // Dispatch reset sau khi logout hoàn tất
            dispatch(reset());

            // Chuyển hướng sau khi tất cả các bước hoàn tất
            // navigation.reset({
            //     index: 0,
            //     routes: [{ name: 'SignIn' }],
            // });
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
            Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại sau.");
        } finally {
            setIsLoggingOut(false);
        }
    };

    const onLogout = () => {
        if (isLoggingOut) return;
        setShowLogoutModal(true);
    };

    const LogoutModal = () => (
        <Modal
            visible={showLogoutModal}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Image 
                        source={require('../Assets/Images/logout.png')} 
                        style={styles.logoutIcon}
                        defaultSource={require('../Assets/Images/logout.png')}
                    />
                    <Text style={styles.modalTitle}>Xác nhận đăng xuất</Text>
                    <Text style={styles.modalMessage}>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</Text>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity 
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => setShowLogoutModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.modalButton, styles.logoutButton]}
                            onPress={performLogout}
                        >
                            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#200000" />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <SafeAreaView style={styles.container}>
            {isLoggingOut && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#200000" />
                    <Text style={styles.loadingText}>Đang đăng xuất...</Text>
                </View>
            )}
            
            <LogoutModal />
            
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Hồ sơ</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.profileContainer}>
                    {isValidAvatar(user.avatar) ? (
                        <Image
                            source={{ uri: user.avatar }}
                            style={styles.profileImage}
                            onError={(error) => console.error('Image loading error:', error.nativeEvent.error)}
                        />
                    ) : (
                        <Image source={require('../Assets/Images/mask.png')} style={styles.profileImage} />
                    )}
                    <View style={styles.profileTextContainer}>
                        <Text style={styles.profileName} numberOfLines={1}>{user.name || 'Không có tên'}</Text>
                        <Text style={styles.profileEmail} numberOfLines={1}>{user.email || 'Không có email'}</Text>
                        {user._id && (
                            <View style={styles.statusContainer}>
                                <UserStatusIndicator
                                    userId={user._id}
                                    showText={true}
                                    size="small"
                                />
                            </View>
                        )}
                    </View>
                </View>

                <TouchableOpacity onPress={() => handle('EditProfile')} style={styles.editProfileButton}>
                    <Text style={styles.editProfileButtonText}>Chỉnh sửa hồ sơ</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <View style={styles.optionRow}>
                    <View style={styles.optionLeft}>
                        <Image source={require('../Assets/Images/Users.png')} style={styles.optionIcon} />
                        <Text style={styles.optionText}>Trạng thái hoạt động</Text>
                    </View>
                    <Switch
                        trackColor={{ false: "#767577", true: "#4CAF50" }}
                        thumbColor={isOnline ? "#fff" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleOnlineStatus}
                        value={isOnline}
                    />
                </View>

                <TouchableOpacity style={styles.optionRow} onPress={() => handle("AllPlan")}>
                    <View style={styles.optionLeft}>
                        <Image source={require('../Assets/Images/addfolder.png')} style={styles.optionIcon} />
                        <Text style={styles.optionText}>Kế hoạch</Text>
                    </View>
                    <Image source={require('../Assets/Images/Next.png')} style={styles.nextIcon} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionRow} onPress={() => handle('TabNavigation', { screen: 'Message' })}>
                    <View style={styles.optionLeft}>
                        <Image source={require('../Assets/Images/question.png')} style={styles.optionIcon} />
                        <Text style={styles.optionText}>Trợ giúp & Phản hồi</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.optionRow} 
                    onPress={onLogout}
                    disabled={isLoggingOut}
                >
                    <View style={styles.optionLeft}>
                        <Image
                            source={require('../Assets/Images/logout.png')}
                            style={[styles.optionIcon, { tintColor: '#E74C3C', width: 25, height: 25 }]}
                        />
                        <Text style={[styles.optionText, { color: '#E74C3C' }]}>Đăng Xuất</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Settings;

// Styles giữ nguyên như cũ
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F9FC',
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 10,
        backgroundColor: '#F7F9FC',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '600',
        color: '#333',
        fontFamily: 'Playfair_me',
    },
    scrollContainer: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        marginVertical: 15,
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        resizeMode: 'cover',
    },
    profileTextContainer: {
        marginLeft: 15,
        flexShrink: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        fontFamily: 'Playfair_me',
    },
    profileEmail: {
        fontSize: 14,
        color: '#888',
        marginTop: 3,
        fontFamily: 'Playfair_me',
    },
    statusContainer: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    editProfileButton: {
        backgroundColor: '#200000',
        paddingVertical: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    editProfileButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Playfair_me',
    },
    divider: {
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
        marginVertical: 20,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionIcon: {
        width: 25,
        height: 25,
        marginRight: 20,
        tintColor: '#333',
    },
    optionText: {
        fontSize: 18,
        color: '#333',
        flexShrink: 1,
        fontFamily: 'Playfair_me',
    },
    nextIcon: {
        width: 20,
        height: 20,
        tintColor: '#888',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
        fontFamily: 'Playfair_me',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    logoutIcon: {
        width: 60,
        height: 60,
        marginBottom: 15,
        tintColor: '#E74C3C',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#333',
        marginBottom: 10,
        fontFamily: 'Playfair_me',
    },
    modalMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'Playfair_me',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        marginHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#F2F2F2',
    },
    logoutButton: {
        backgroundColor: '#E74C3C',
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Playfair_me',
    },
    logoutButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Playfair_me',
    }
});