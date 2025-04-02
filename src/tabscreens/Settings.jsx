import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Switch, Alert, Platform } from 'react-native';
import React, { useContext, useState } from 'react';
import { AppContext } from '../AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserStatusIndicator from '../components/UserStatusIndicator';
import { useDispatch } from 'react-redux';
import { updateUserOnlineStatus } from '../redux/UserActivitySlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reset } from '../redux/LoginSlice';

const Settings = (props) => {
    const { navigation } = props;
    const { user, logout,setUser } = useContext(AppContext);
    const dispatch = useDispatch();
    
    const [isOnline, setIsOnline] = useState(true);

    console.log('User object in Settings:', user ? {
        hasAvatar: !!user.avatar,
        avatarType: user.avatar ? typeof user.avatar : 'none',
        avatarLength: user.avatar ? user.avatar.length : 0,
        avatarPreview: user.avatar ? user.avatar.substring(0, 50) + '...' : 'no avatar'
    } : 'no user');

    const handle = (screenName) => {
        navigation.navigate(screenName);
    };
    
    const toggleOnlineStatus = (value) => {
        setIsOnline(value);
        if (user && user._id) {
            dispatch(updateUserOnlineStatus({ 
                userId: user._id, 
                isOnline: value 
            }));
        }
    };

    const onLogout = async () => {
      try {
          console.log('Gọi logout từ Settings...');
          // Gọi hàm logout từ AppContext
          await logout();
          
          console.log('Resetting LoginSlice...');
          dispatch(reset());
  
          console.log('Xóa thông tin đăng nhập từ AsyncStorage...');
          await AsyncStorage.multiRemove([
              'savedEmail',
              'savedPassword',
              'rememberMe',
              'userData',
              'token',
          ]);
          await AsyncStorage.setItem('isLoggedOut', 'true');
          console.log("Đã đăng xuất thành công từ Settings");
  
         
      } catch (error) {
          console.error("Lỗi khi đăng xuất:", error);
          Alert.alert("Lỗi", "Không thể đăng xuất. Vui lòng thử lại sau.");
      }
  };

    // const onLogout = async () => {
    //     setUsers(null); // Xoa thong tin nguoi dung trong Context
    //     await AsyncStorage.removeItem('user');
    //   }
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Hồ sơ</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.profileContainer}>
                    {user && user.avatar ? (
                        <>
                            {console.log('Trying to render avatar with URI:', user.avatar.substring(0, 50) + '...')}
                            <Image 
                                source={{ uri: user.avatar }} 
                                style={styles.profileImage} 
                                onError={(error) => console.error('Image loading error:', error.nativeEvent.error)}
                            />
                        </>
                    ) : (
                        <>
                            {console.log('Rendering default avatar image')}
                            <Image source={require('../Assets/Images/mask.png')} style={styles.profileImage} />
                        </>
                    )}
                    <View style={styles.profileTextContainer}>
                        <Text style={styles.profileName} numberOfLines={1}>{user.name}</Text>
                        <Text style={styles.profileEmail} numberOfLines={1}>{user.email}</Text>
                        
                        {user && user._id && (
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

                <TouchableOpacity style={styles.optionRow} onPress={() => navigation.navigate("AllPlan")}>
                    <View style={styles.optionLeft}>
                        <Image source={require('../Assets/Images/addfolder.png')} style={styles.optionIcon} />
                        <Text style={styles.optionText}>Kế hoạch</Text>
                    </View>
                    <Image source={require('../Assets/Images/Next.png')} style={styles.nextIcon} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionRow} onPress={() => navigation.navigate('TabNavigation', { screen: 'Message' })}>
                    <View style={styles.optionLeft}>
                        <Image source={require('../Assets/Images/question.png')} style={styles.optionIcon} />
                        <Text style={styles.optionText}>Trợ giúp & Phản hồi</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionRow} onPress={ onLogout}>
                    <View style={styles.optionLeft}>
                        <Image 
                            source={require('../Assets/Images/back.png')} 
                            style={[styles.optionIcon, { tintColor: '#E74C3C', transform: [{ rotate: '180deg' }], width: 20, height: 15 }]} 
                        />
                        <Text style={[styles.optionText, { color: '#E74C3C' }]}>Đăng Xuất</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Settings;

// Styles không thay đổi, giữ nguyên như bạn đã cung cấp
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
});