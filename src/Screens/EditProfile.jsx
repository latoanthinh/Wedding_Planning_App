import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform, PermissionsAndroid, Linking } from 'react-native';
import { AppContext } from '../AppContext';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser, resetUpdateStatus, checkApiStatus } from '../redux/UserSlice';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

const EditProfile = (props) => {
  const { navigation } = props;
  const { user, setUser } = useContext(AppContext);
  const dispatch = useDispatch();
  
  // Get update status from Redux store
  const updateStatus = useSelector((state) => state.user.updateStatus);
  const updateError = useSelector((state) => state.user.updateError);
  const serverResponse = useSelector((state) => state.user.serverResponse);
  const apiStatus = useSelector((state) => state.user.apiStatus);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [oldPasswordSecureEntry, setOldPasswordSecureEntry] = useState(true);
  const [hasImagePermission, setHasImagePermission] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);

  // Kiểm tra trạng thái API khi component mount
  useEffect(() => {
    dispatch(checkApiStatus());
  }, [dispatch]);

  // Yêu cầu quyền truy cập camera
  const requestCameraPermission = async () => {
    try {
      console.log('Requesting camera permission...');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Quyền truy cập Camera',
          message: 'Ứng dụng cần quyền truy cập camera để chụp ảnh đại diện mới.',
          buttonPositive: 'Đồng ý',
          buttonNegative: 'Từ chối',
        }
      );
      
      const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
      console.log('Camera permission result:', granted, 'Granted:', hasPermission);
      setHasCameraPermission(hasPermission);
      return hasPermission;
    } catch (err) {
      console.error('Error requesting camera permission:', err);
      return false;
    }
  };

  // Yêu cầu quyền truy cập bộ nhớ
  const requestStoragePermission = async () => {
    try {
      console.log('Requesting storage permission...');
      const androidVersion = parseInt(Platform.Version, 10);
      console.log('Android version:', androidVersion);
      
      // Quyền khác nhau dựa trên phiên bản Android
      let permission;
      if (androidVersion >= 33) {
        permission = PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
      } else {
        permission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      }
      
      console.log('Requesting permission:', permission);
      const granted = await PermissionsAndroid.request(
        permission,
        {
          title: 'Quyền truy cập Thư viện ảnh',
          message: 'Ứng dụng cần quyền truy cập thư viện ảnh để chọn ảnh đại diện.',
          buttonPositive: 'Đồng ý',
          buttonNegative: 'Từ chối',
        }
      );
      
      const hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
      console.log('Storage permission result:', granted, 'Granted:', hasPermission);
      setHasImagePermission(hasPermission);
      return hasPermission;
    } catch (err) {
      console.error('Error requesting storage permission:', err);
      return false;
    }
  };

  // Yêu cầu quyền ngay khi component mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Yêu cầu quyền camera trước
        const cameraPermission = await requestCameraPermission();
        console.log('Camera permission check result:', cameraPermission);
        
        // Sau đó yêu cầu quyền bộ nhớ
        const storagePermission = await requestStoragePermission();
        console.log('Storage permission check result:', storagePermission);
      } catch (error) {
        console.error('Error checking permissions:', error);
      }
    };
    
    checkPermissions();
  }, []);

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      console.log('Loading user data:', JSON.stringify(user));
      setName(user.name || '');
      setEmail(user.email || '');
      setAvatar(user.avatar || null);
      
      // Debug info - chỉ log ra console, không hiển thị trên UI
      console.log(`Debug Info - User ID: ${user._id || 'undefined'}, Email: ${user.email || 'undefined'}, API Status: ${apiStatus}`);
    } else {
      console.warn('User data is null or undefined');
    }
  }, [user, apiStatus]);

  // Handle update status changes
  useEffect(() => {
    console.log('Update status changed:', updateStatus);
    
    if (updateStatus === 'succeeded') {
      console.log('Update successful, server response:', JSON.stringify(serverResponse));
      
      Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật.');
      
      // Update local context with the new user data
      if (serverResponse && serverResponse.user) {
        setUser(serverResponse.user);
        console.log('Updated user in context:', JSON.stringify(serverResponse.user));
      } else {
        console.warn('Server response missing user data:', JSON.stringify(serverResponse));
      }
      
      dispatch(resetUpdateStatus());
      navigation.goBack();
    } else if (updateStatus === 'failed' && updateError) {
      console.log('Update failed with error:', updateError);
      
      // Show more detailed error message
      Alert.alert(
        'Lỗi', 
        `Không thể cập nhật thông tin: ${updateError}\n\nVui lòng thử lại sau.`,
        [{ text: 'OK', onPress: () => dispatch(resetUpdateStatus()) }]
      );
    }
  }, [updateStatus, updateError, serverResponse, dispatch, navigation]);

  // Mở cài đặt ứng dụng
  const openAppSettings = () => {
    Alert.alert(
      'Cần cấp quyền',
      'Để sử dụng tính năng này, bạn cần cấp quyền truy cập Bộ nhớ và Camera trong phần cài đặt ứng dụng.\n\nTrên Android 12, quyền truy cập bộ nhớ có thể được gọi là "Lưu trữ" hoặc "Tệp và phương tiện".',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Mở cài đặt', 
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }
        }
      ]
    );
  };

  // Function to pick image from gallery
  const pickImage = async () => {
    console.log('Pick image called, checking permissions...');
    
    // Kiểm tra quyền camera
    if (!hasCameraPermission) {
      const cameraGranted = await requestCameraPermission();
      if (!cameraGranted) {
        console.log('Camera permission denied');
        openAppSettings();
        return;
      }
    }
    
    // Kiểm tra quyền bộ nhớ
    if (!hasImagePermission) {
      const storageGranted = await requestStoragePermission();
      if (!storageGranted) {
        console.log('Storage permission denied');
        openAppSettings();
        return;
      }
    }
    
    console.log('Permissions OK, showing image source options');
    
    // Hiển thị tùy chọn chọn ảnh
    Alert.alert(
      'Chọn ảnh đại diện',
      'Bạn muốn chọn ảnh từ đâu?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Thư viện ảnh',
          onPress: () => selectFromGallery()
        },
        {
          text: 'Chụp ảnh mới',
          onPress: () => takePhoto()
        }
      ]
    );
  };

  // Chọn ảnh từ thư viện
  const selectFromGallery = async () => {
    console.log('Selecting from gallery...');
    
    // Kiểm tra lại quyền bộ nhớ
    if (!hasImagePermission) {
      const granted = await requestStoragePermission();
      if (!granted) {
        console.log('Storage permission denied when trying to select from gallery');
        openAppSettings();
        return;
      }
    }
    
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 500,
      maxWidth: 500,
      quality: 0.7,
    };

    try {
      console.log('Launching image library with options:', options);
      const result = await launchImageLibrary(options);
      
      console.log('Image picker result:', result.didCancel ? 'Canceled' : 'Image selected');
      
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        // Tạo URI dạng base64 để gửi lên server
        const base64Uri = `data:image/jpeg;base64,${selectedAsset.base64}`;
        setAvatar(base64Uri);
        console.log('Image selected, size:', selectedAsset.fileSize);
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh từ thư viện. Vui lòng thử lại.');
    }
  };

  // Chụp ảnh mới
  const takePhoto = async () => {
    console.log('Taking photo...');
    
    // Kiểm tra lại quyền camera
    if (!hasCameraPermission) {
      const granted = await requestCameraPermission();
      if (!granted) {
        console.log('Camera permission denied when trying to take photo');
        openAppSettings();
        return;
      }
    }
    
    const options = {
      mediaType: 'photo',
      includeBase64: true,
      maxHeight: 500,
      maxWidth: 500,
      quality: 0.7,
      saveToPhotos: true,
    };

    try {
      console.log('Launching camera with options:', options);
      const result = await launchCamera(options);
      
      console.log('Camera result:', result.didCancel ? 'Canceled' : 'Photo taken');
      
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        console.log('Captured photo details:', {
          width: selectedAsset.width,
          height: selectedAsset.height,
          fileSize: selectedAsset.fileSize,
          type: selectedAsset.type,
          fileName: selectedAsset.fileName,
          uri: selectedAsset.uri ? selectedAsset.uri.substring(0, 30) + '...' : null,
          base64Present: selectedAsset.base64 ? true : false,
          base64Length: selectedAsset.base64 ? selectedAsset.base64.length : 0
        });
        
        // Tạo URI dạng base64 để gửi lên server
        const base64Uri = `data:image/jpeg;base64,${selectedAsset.base64}`;
        console.log('Created base64Uri, length:', base64Uri.length);
        console.log('Base64Uri starts with:', base64Uri.substring(0, 30) + '...');
        
        setAvatar(base64Uri);
        console.log('Avatar state updated with base64Uri');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
    }
  };

  // Function to handle email change
  const handleEmailChange = (text) => {
    setEmail(text);
    setIsChangingEmail(text !== user?.email && text !== ''); // Set to true if email field is changed and not empty
  };

  // Function to handle password change
  const handlePasswordChange = (text) => {
    setNewPassword(text);
    setIsChangingPassword(text !== ''); // Set to true if new password field is not empty
  };

  // Function to toggle password visibility
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // Function to toggle old password visibility
  const toggleOldPasswordSecureEntry = () => {
    setOldPasswordSecureEntry(!oldPasswordSecureEntry);
  };

  // Function to check API before saving
  const checkApiAndSave = () => {
    // Kiểm tra API trước khi lưu
    dispatch(checkApiStatus())
      .unwrap()
      .then(() => {
        // API online, tiến hành lưu
        saveChanges();
      })
      .catch(() => {
        // API offline, hiển thị thông báo
        Alert.alert(
          'Lỗi kết nối',
          'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại sau.',
          [{ text: 'OK' }]
        );
      });
  };

  // Function to save profile changes
  const saveChanges = () => {
    try {
      // Check if user exists
      if (!user || !user._id) {
        console.error('User or user ID is missing:', user);
        Alert.alert('Lỗi', 'Không thể xác định người dùng. Vui lòng đăng nhập lại.');
        return;
      }
      
      // Check if any changes have been made
      const isNameChanged = name !== user?.name && name !== '';
      const isEmailChanged = email !== user?.email && email !== '';
      const isPasswordChanged = newPassword !== '';
      const isAvatarChanged = avatar !== user?.avatar && avatar !== null;
      
      console.log('Current user data:', JSON.stringify({
        ...user,
        avatar: user?.avatar ? 'CURRENT_AVATAR_DATA_PRESENT' : null
      }));
      console.log('Form values:', { 
        name, 
        email, 
        newPassword: newPassword ? '[REDACTED]' : '', 
        oldPassword: oldPassword ? '[REDACTED]' : '',
        avatarChanged: isAvatarChanged,
        avatarPresent: avatar ? true : false,
        avatarLength: avatar ? avatar.length : 0
      });
      console.log('Changes detected:', { isNameChanged, isEmailChanged, isPasswordChanged, isAvatarChanged });
      
      // If nothing has changed, show a message
      if (!isNameChanged && !isEmailChanged && !isPasswordChanged && !isAvatarChanged) {
        Alert.alert('Thông báo', 'Không có thông tin nào được thay đổi.');
        return;
      }

      // Validate old password if changing email or password
      if ((isChangingEmail || isChangingPassword) && !oldPassword) {
        Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu cũ để xác nhận thay đổi.');
        return;
      }

      // Prepare data for API call
      const userData = {};
      
      if (isNameChanged) userData.name = name;
      if (isEmailChanged) userData.email = email;
      if (isPasswordChanged) userData.password = newPassword;
      if (isAvatarChanged) {
        console.log('Avatar changed, including in update data');
        console.log('Avatar data type:', typeof avatar);
        console.log('Avatar data length:', avatar ? avatar.length : 0);
        if (avatar) {
          console.log('Avatar data starts with:', avatar.substring(0, 30) + '...');
          userData.avatar = avatar;
        } else {
          console.log('Avatar is null, not including in update');
        }
      }
      
      // Add old password if changing email or password
      if (isChangingEmail || isChangingPassword) {
        userData.oldPassword = oldPassword;
      }

      console.log('Sending update data:', { 
        ...userData, 
        password: userData.password ? '[REDACTED]' : undefined, 
        oldPassword: userData.oldPassword ? '[REDACTED]' : undefined,
        avatar: userData.avatar ? 'BASE64_IMAGE_DATA_PRESENT' : undefined
      });
      console.log('User ID for update:', user._id);
      
      // Dispatch update action
      dispatch(updateUser({ id: user._id, userData }));
    } catch (error) {
      console.error('Error in saveChanges function:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi lưu thông tin: ' + error.message);
    }
  };

  // Function to cancel and go back
  const handleCancel = () => {
    navigation.goBack();
  };

  // Render avatar image or default
  const renderAvatar = () => {
    if (avatar) {
      return <Image source={{ uri: avatar }} style={styles.profileImage} />;
    }
    return <Image source={require('../Assets/Images/mask.png')} style={styles.profileImage} />;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={require('../Assets/Images/back.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* API Status Warning - Chỉ hiển thị khi API offline */}
        {apiStatus === 'offline' && (
          <View style={styles.apiWarning}>
            <Text style={styles.apiWarningText}>
              Không thể kết nối đến máy chủ. Các thay đổi có thể không được lưu.
            </Text>
          </View>
        )}
        
        {/* Profile Image */}
        <View style={styles.profileContainer}>
          {renderAvatar()}
          <TouchableOpacity style={styles.cameraIconContainer} onPress={pickImage}>
            <Image source={require('../Assets/Images/camera24.png')} style={styles.cameraIcon} />
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tên"
            placeholderTextColor="#999"
            value={name}
            onChangeText={(text) => setName(text)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Mật khẩu mới"
              placeholderTextColor="#999"
              value={newPassword}
              onChangeText={handlePasswordChange}
              secureTextEntry={secureTextEntry}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={toggleSecureEntry} style={styles.eyeIcon}>
              <Text>{secureTextEntry ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Old Password Verification */}
          {(isChangingEmail || isChangingPassword) && (
            <View style={styles.verificationContainer}>
              <Text style={styles.verificationText}>
                Vui lòng nhập mật khẩu cũ để xác nhận thay đổi
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Mật khẩu cũ"
                  placeholderTextColor="#999"
                  value={oldPassword}
                  onChangeText={(text) => setOldPassword(text)}
                  secureTextEntry={oldPasswordSecureEntry}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={toggleOldPasswordSecureEntry} style={styles.eyeIcon}>
                  <Text>{oldPasswordSecureEntry ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.editButton, updateStatus === 'loading' && styles.disabledButton]} 
              onPress={checkApiAndSave}
              disabled={updateStatus === 'loading'}
            >
              {updateStatus === 'loading' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.editButtonText}>Lưu</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 10,
  },
  backIcon: {
    width: 19,
    height: 14,
    tintColor: '#333',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 30,
  },
  apiWarning: {
    padding: 10,
    backgroundColor: '#fff3cd',
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffeeba',
  },
  apiWarningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  profileContainer: {
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#f0f0f0', // Thêm màu nền để tránh hiển thị lỗi khi ảnh chưa tải xong
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cameraIcon: {
    width: 18,
    height: 18,
    tintColor: '#333',
  },
  formContainer: {
    marginTop: 40,
    alignItems: 'center',
    width: '100%',
  },
  input: {
    width: '90%',
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingHorizontal: 10,
    marginBottom: 25,
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    width: '90%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 25,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 10,
  },
  verificationContainer: {
    width: '90%',
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
  },
  verificationText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    textAlign: 'center',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#333',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '80%',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'red',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  cancelButtonText: {
    color: 'red',
    fontSize: 18,
    fontWeight: '600',
  },
});
