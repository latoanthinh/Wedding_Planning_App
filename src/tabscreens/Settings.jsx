import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const Settings = (props) => {
  const { navigation } = props;
  const { user } = useContext(AppContext);

  // Add console logs to debug avatar data
  console.log('User object in Settings:', user ? {
    hasAvatar: !!user.avatar,
    avatarType: user.avatar ? typeof user.avatar : 'none',
    avatarLength: user.avatar ? user.avatar.length : 0,
    avatarPreview: user.avatar ? user.avatar.substring(0, 50) + '...' : 'no avatar'
  } : 'no user');

  const handle = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header cố định */}
      <View style={styles.header}>
        <Image source={require('../Assets/Images/Sort.png')} style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Hồ sơ</Text>
        <View style={styles.headerRight}>
          <Image source={require('../Assets/Images/home48.png')} style={styles.headerIcon} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileContainer}>
          {/* Add console log to debug the avatar rendering condition */}
          {console.log('Avatar rendering condition:', !!user, !!user?.avatar)}
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
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity onPress={() => handle('EditProfile')} style={styles.editProfileButton}>
          <Text style={styles.editProfileButtonText}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Options */}
        <TouchableOpacity style={styles.optionRow}>
          <View style={styles.optionLeft}>
            <Image source={require('../Assets/Images/Users.png')} style={styles.optionIcon} />
            <Text style={styles.optionText}>Loại tài khoản</Text>
          </View>
          <Image source={require('../Assets/Images/Next.png')} style={styles.nextIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow}>
          <View style={styles.optionLeft}>
            <Image source={require('../Assets/Images/addfolder.png')} style={styles.optionIcon} />
            <Text style={styles.optionText}>Thêm giới hạn ngân sách</Text>
          </View>
          <Image source={require('../Assets/Images/Next.png')} style={styles.nextIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow} onPress={() => navigation.navigate("AllPlan")}>
          <View style={styles.optionLeft}>
            <Image source={require('../Assets/Images/addfolder.png')} style={styles.optionIcon} />
            <Text style={styles.optionText}>Kế hoạch</Text>
          </View>
          <Image source={require('../Assets/Images/Next.png')} style={styles.nextIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow}>
          <View style={styles.optionLeft}>
            <Image source={require('../Assets/Images/setting.png')} style={styles.optionIcon} />
            <Text style={styles.optionText}>Cài đặt</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow}>
          <View style={styles.optionLeft}>
            <Image source={require('../Assets/Images/question.png')} style={styles.optionIcon} />
            <Text style={styles.optionText}>Trợ giúp & Phản hồi</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#F7F9FC',
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: '#333',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Playfair_me',
  },
  headerRight: {
    flexDirection: 'row',
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
