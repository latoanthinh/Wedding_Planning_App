import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { requestOTP, verifyOTP, resetPassword, setStep, resetForgotPassword } from '../redux/ForgotPasswordSlice';
import { checkApiStatus } from '../redux/UserSlice';

const ForgotPassword = (props) => {
  const { navigation, route } = props;
  const dispatch = useDispatch();
  
  // Get API status and user info from Redux store
  const apiStatus = useSelector((state) => state.user.apiStatus);
  const { status, message, error, step } = useSelector((state) => state.forgotPassword);
  const user = useSelector((state) => state.user.user);
  
  // Get email from route params or user state
  const initialEmail = route?.params?.email || user?.email || '';
  
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(60);
  
  // Reset forgotPassword state when component mounts
  useEffect(() => {
    dispatch(resetForgotPassword());
    dispatch(checkApiStatus());
    
    // If user is logged in, automatically start with step 2
    if (user?.email) {
      dispatch(setStep(2));
      dispatch(requestOTP(user.email));
    }
  }, [dispatch, user]);

  // Timer for OTP resend
  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Handle status changes
  useEffect(() => {
    if (status === 'succeeded') {
      console.log('Action successful:', message);
      
      switch(step) {
        case 2:
          Alert.alert('Thành công', `Mã OTP đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư của bạn.`);
          break;
        case 3:
          Alert.alert('Thành công', 'Mã OTP hợp lệ.');
          break;
        case 4:
          Alert.alert(
            'Thành công', 
            'Mật khẩu đã được đặt lại thành công.', 
            [{ text: 'OK', onPress: () => navigation.navigate('TabNavigation') }]
          );
          break;
      }
    } else if (status === 'failed' && error) {
      console.log('Action failed with error:', error);
      Alert.alert('Lỗi', error || 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
    }
  }, [status, error, message, step, navigation, email]);

  // Function to toggle password visibility
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // Function to toggle confirm password visibility
  const toggleConfirmSecureEntry = () => {
    setConfirmSecureTextEntry(!confirmSecureTextEntry);
  };

  // Function to send OTP
  const sendOTP = () => {
    // Validate email
    if (!email || !email.includes('@')) {
      Alert.alert('Lỗi', 'Vui lòng nhập email hợp lệ.');
      return;
    }
    
    console.log('Requesting OTP for email:', email);
    dispatch(requestOTP(email));
    setTimer(60);
    setCanResend(false);
  };

  // Function to verify OTP
  const verifyOTPCode = () => {
    // Validate OTP
    if (!otp || otp.length < 4) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP hợp lệ.');
      return;
    }
    
    console.log('Verifying OTP:', otp, 'for email:', email);
    dispatch(verifyOTP({ email, otp }));
  };

  // Function to reset password
  const resetPasswordAction = () => {
    // Validate inputs
    if (!newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }
    
    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    
    console.log('Resetting password for email:', email);
    dispatch(resetPassword({ email, newPassword }));
  };

  // Handle resending OTP
  const handleResendOtp = () => {
    if (!canResend) return;
    
    console.log('Resending OTP for email:', email);
    dispatch(requestOTP(email));
    setTimer(60);
    setCanResend(false);
    setOtp('');
  };

  // Function to render the current step based on state
  const renderStep = () => {
    switch(step) {
      case 1:
        // Step 1: Enter email to receive OTP (only for non-logged in users)
        return (
          <View style={styles.formContainer}>
            <Text style={styles.instructionText}>
              Vui lòng nhập email của bạn để nhận mã OTP khôi phục mật khẩu.
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!user?.email} // Disable if user is logged in
            />
            
            <TouchableOpacity 
              style={[styles.actionButton, status === 'loading' && styles.disabledButton]} 
              onPress={sendOTP}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.actionButtonText}>Gửi mã OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        );
      case 2:
        // Step 2: Enter OTP
        return (
          <View style={styles.formContainer}>
            <Text style={styles.instructionText}>
              Mã OTP đã được gửi đến {email}. Vui lòng kiểm tra hộp thư và nhập mã OTP.
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nhập mã OTP"
              placeholderTextColor="#999"
              value={otp}
              onChangeText={(text) => setOtp(text)}
              keyboardType="number-pad"
            />
            
            {/* Resend OTP Button */}
            <View style={styles.resendContainer}>
              <TouchableOpacity 
                style={[styles.resendButton, !canResend && styles.disabledResendButton]}
                onPress={handleResendOtp}
                disabled={!canResend}
              >
                <Text style={styles.resendButtonText}>
                  {canResend ? 'Gửi lại mã OTP' : `Gửi lại sau (${timer}s)`}
                </Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.actionButton, status === 'loading' && styles.disabledButton]} 
              onPress={verifyOTPCode}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.actionButtonText}>Xác minh OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        );
      case 3:
        // Step 3: Reset password
        return (
          <View style={styles.formContainer}>
            <Text style={styles.instructionText}>
              Vui lòng nhập mật khẩu mới của bạn.
            </Text>
            
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
            
            <TouchableOpacity 
              style={[styles.actionButton, status === 'loading' && styles.disabledButton]} 
              onPress={resetPasswordAction}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.actionButtonText}>Đặt lại mật khẩu</Text>
              )}
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={require('../Assets/Images/back.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quên mật khẩu</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* API Status Warning */}
        {apiStatus === 'offline' && (
          <View style={styles.apiWarning}>
            <Text style={styles.apiWarningText}>
              Không thể kết nối đến máy chủ. Vui lòng thử lại sau.
            </Text>
          </View>
        )}
        
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressCircle, styles.activeCircle]}>
            <Text style={styles.progressText}>1</Text>
          </View>
          <View style={[styles.progressLine, step > 1 ? styles.activeLine : {}]} />
          <View style={[styles.progressCircle, step > 1 ? styles.activeCircle : {}]}>
            <Text style={styles.progressText}>2</Text>
          </View>
          <View style={[styles.progressLine, step > 2 ? styles.activeLine : {}]} />
          <View style={[styles.progressCircle, step > 2 ? styles.activeCircle : {}]}>
            <Text style={styles.progressText}>3</Text>
          </View>
        </View>
        
        {/* Current Step Form */}
        {renderStep()}
      </ScrollView>
    </View>
  );
};

export default ForgotPassword;

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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  progressCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCircle: {
    backgroundColor: '#333',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressLine: {
    height: 2,
    width: 60,
    backgroundColor: '#e0e0e0',
  },
  activeLine: {
    backgroundColor: '#333',
  },
  formContainer: {
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
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
  actionButton: {
    width: '80%',
    backgroundColor: '#333',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  resendContainer: {
    width: '90%',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  resendButton: {
    padding: 5,
  },
  disabledResendButton: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#4a6da7',
    fontSize: 14,
    fontWeight: '500',
  },
}); 