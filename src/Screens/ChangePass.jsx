import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { AppContext } from '../AppContext';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser, resetUpdateStatus, checkApiStatus } from '../redux/UserSlice';

const ChangePass = (props) => {
  const { navigation } = props;
  const { user } = useContext(AppContext);
  const dispatch = useDispatch();
  
  // Get update status from Redux store
  const updateStatus = useSelector((state) => state.user.updateStatus);
  const updateError = useSelector((state) => state.user.updateError);
  const apiStatus = useSelector((state) => state.user.apiStatus);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  const [oldPasswordSecureEntry, setOldPasswordSecureEntry] = useState(true);

  // Kiểm tra trạng thái API khi component mount
  useEffect(() => {
    dispatch(checkApiStatus());
  }, [dispatch]);

  // Handle update status changes
  useEffect(() => {
    console.log('Update status changed:', updateStatus);
    
    if (updateStatus === 'succeeded') {
      console.log('Password update successful');
      
      Alert.alert('Thành công', 'Mật khẩu đã được cập nhật thành công.');
      
      dispatch(resetUpdateStatus());
      navigation.goBack();
    } else if (updateStatus === 'failed' && updateError) {
      console.log('Update failed with error:', updateError);
      
      Alert.alert(
        'Lỗi', 
        `Không thể cập nhật mật khẩu: ${updateError}\n\nVui lòng thử lại sau.`,
        [{ text: 'OK', onPress: () => dispatch(resetUpdateStatus()) }]
      );
    }
  }, [updateStatus, updateError, dispatch, navigation]);

  // Function to toggle password visibility
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // Function to toggle confirm password visibility
  const toggleConfirmSecureEntry = () => {
    setConfirmSecureTextEntry(!confirmSecureTextEntry);
  };

  // Function to toggle old password visibility
  const toggleOldPasswordSecureEntry = () => {
    setOldPasswordSecureEntry(!oldPasswordSecureEntry);
  };

  // Navigate to forgot password screen
  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword', { email: user?.email });
  };

  // Function to check API before saving
  const checkApiAndSave = () => {
    dispatch(checkApiStatus())
      .unwrap()
      .then(() => {
        saveChanges();
      })
      .catch(() => {
        Alert.alert(
          'Lỗi kết nối',
          'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại sau.',
          [{ text: 'OK' }]
        );
      });
  };

  // Function to save password changes
  const saveChanges = () => {
    try {
      // Check if user exists
      if (!user || !user._id) {
        console.error('User or user ID is missing:', user);
        Alert.alert('Lỗi', 'Không thể xác định người dùng. Vui lòng đăng nhập lại.');
        return;
      }
      
      // Validate inputs
      if (!newPassword || !confirmPassword || !oldPassword) {
        Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
        return;
      }
      
      // Check if passwords match
      if (newPassword !== confirmPassword) {
        Alert.alert('Lỗi', 'Mật khẩu mới và xác nhận mật khẩu không khớp.');
        return;
      }
      
      // Check password strength (optional)
      if (newPassword.length < 6) {
        Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
        return;
      }
      
      // Prepare data for API call
      const userData = {
        password: newPassword,
        oldPassword: oldPassword
      };
      
      console.log('Sending password update data', { 
        password: '[REDACTED]', 
        oldPassword: '[REDACTED]'
      });
      
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={require('../Assets/Images/back.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* API Status Warning */}
        {apiStatus === 'offline' && (
          <View style={styles.apiWarning}>
            <Text style={styles.apiWarningText}>
              Không thể kết nối đến máy chủ. Các thay đổi có thể không được lưu.
            </Text>
          </View>
        )}
        
        {/* Password Form */}
        <View style={styles.formContainer}>
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
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Mật khẩu mới"
              placeholderTextColor="#999"
              value={newPassword}
              onChangeText={(text) => setNewPassword(text)}
              secureTextEntry={secureTextEntry}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={toggleSecureEntry} style={styles.eyeIcon}>
              <Text>{secureTextEntry ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Xác nhận mật khẩu mới"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)}
              secureTextEntry={confirmSecureTextEntry}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={toggleConfirmSecureEntry} style={styles.eyeIcon}>
              <Text>{confirmSecureTextEntry ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
          
          {/* Forgot Password Button */}
          <TouchableOpacity 
            style={styles.forgotPasswordButton}
            onPress={navigateToForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, updateStatus === 'loading' && styles.disabledButton]} 
              onPress={checkApiAndSave}
              disabled={updateStatus === 'loading'}
            >
              {updateStatus === 'loading' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Lưu</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ChangePass;

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
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#ffeeba',
  },
  apiWarningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  formContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginRight: '5%',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#4a6da7',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '80%',
    justifyContent: 'space-between',
    marginTop: 10,
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
  saveButton: {
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
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 