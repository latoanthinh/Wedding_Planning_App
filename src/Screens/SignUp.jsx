import React, { useState, useEffect } from "react";
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    Image, 
    ToastAndroid, 
    Alert, 
    ActivityIndicator,
    Animated,
    Dimensions,
    StyleSheet,
} from "react-native";
import SignInPageStyles from "../Styles/SignInPageStyles";
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { 
    DangKyTaiKhoan, 
    requestRegisterOTP, 
    verifyRegisterOTP, 
    resetOtpStatus 
} from '../redux/RegisterSlice';

const { width } = Dimensions.get('window');

const SignUp = () => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const navigation = useNavigation();
    
    // OTP states
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [otpInputRefs] = useState(Array(4).fill().map(() => React.createRef()));

    // User input states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Error states
    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [policyError, setPolicyError] = useState('');

    // Animation states
    const slideAnim = React.useRef(new Animated.Value(0)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    const dispatch = useDispatch();
    const { 
        registerData, 
        registerStatus, 
        otpRequestStatus, 
        otpVerifyStatus, 
        otpData,
        error 
    } = useSelector((state) => state.register);

    useEffect(() => {
        dispatch(resetOtpStatus());
        return () => {
            dispatch(resetOtpStatus());
        };
    }, []);

    useEffect(() => {
        if (showOtpInput) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [showOtpInput]);

    useEffect(() => {
        let interval;
        if (showOtpInput && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer, showOtpInput]);

    useEffect(() => {
        if (otpRequestStatus === 'succeeded') {
            ToastAndroid.show(
                otpData?.message || 'Mã OTP đã được gửi đến email của bạn',
                ToastAndroid.SHORT
            );
        } else if (otpRequestStatus === 'failed') {
            ToastAndroid.show(
                error || 'Lỗi khi gửi mã OTP',
                ToastAndroid.SHORT
            );
            setShowOtpInput(false);
        }
    }, [otpRequestStatus, otpData, error]);

    useEffect(() => {
        if (otpVerifyStatus === 'succeeded') {
            ToastAndroid.show(
                otpData?.message || 'Xác thực OTP thành công',
                ToastAndroid.SHORT
            );
          
            navigation.navigate('SignIn');
        } else if (otpVerifyStatus === 'failed') {
            ToastAndroid.show(
                error || 'Mã OTP không hợp lệ',
                ToastAndroid.SHORT
            );
        }
    }, [otpVerifyStatus, otpData, error]);

   
    useEffect(() => {
        if (registerStatus === 'succeeded') {
            ToastAndroid.show(
                registerData?.message || 'Đăng ký tài khoản thành công! Vui lòng nhập mã OTP để kích hoạt tài khoản.', 
                ToastAndroid.SHORT
            );
            
            setShowOtpInput(true);
           
            setTimer(60);
            setCanResend(false);
        } else if (registerStatus === 'failed') {
            Alert.alert(
                "Đăng ký thất bại", 
                error || "Có lỗi xảy ra, vui lòng thử lại!"
            );
        }
    }, [registerStatus, registerData, error]);

    const validateInputs = () => {
        let valid = true;

      
        if (!name.trim()) {
            setNameError("Họ và tên không được để trống");
            valid = false;
        } else {
            setNameError('');
        }

       
        if (!email.trim()) {
            setEmailError("Email không được để trống");
            valid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            setEmailError("Email không hợp lệ");
            valid = false;
        } else {
            setEmailError('');
        }

       
        if (!password.trim()) {
            setPasswordError("Mật khẩu không được để trống");
            valid = false;
        } else if (password.length < 6) {
            setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
            valid = false;
        } else {
            setPasswordError('');
        }

       
        if (!confirmPassword.trim()) {
            setConfirmPasswordError("Vui lòng nhập lại mật khẩu");
            valid = false;
        } else if (confirmPassword !== password) {
            setConfirmPasswordError("Mật khẩu xác nhận không khớp");
            valid = false;
        } else {
            setConfirmPasswordError('');
        }

     
        if (!isChecked) {
            setPolicyError("Bạn phải đồng ý với chính sách bảo mật");
            valid = false;
        } else {
            setPolicyError('');
        }

        return valid;
    };

    const handleSendOtp = () => {
     
    };

    const handleVerifyOtp = () => {
        const fullOtp = otp.join('');
        if (fullOtp.length !== 4) {
            setOtpError('Vui lòng nhập đủ 4 chữ số OTP');
            return;
        }
        setOtpError('');
        dispatch(verifyRegisterOTP({ email, otp: fullOtp }));
    };

    const handleOtpChange = (text, index) => {
        const digitText = text.replace(/[^0-9]/g, '');
        const newOtp = [...otp];
        newOtp[index] = digitText;
        setOtp(newOtp);
        
        if (digitText && index < 3) {
            otpInputRefs[index + 1]?.current?.focus();
        }
    };

    const handleOtpKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputRefs[index - 1]?.current?.focus();
        }
    };

    const handleResendOtp = () => {
        if (!canResend) return;
        setTimer(60);
        setCanResend(false);
        dispatch(requestRegisterOTP(email));
    };

    const dangky = () => {
        if (validateInputs()) {
            dispatch(DangKyTaiKhoan({ email, password, name }));
        } else {
            ToastAndroid.show("Vui lòng nhập đúng thông tin!", ToastAndroid.SHORT);
        }
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const toggleCheckbox = () => {
        setIsChecked(!isChecked);
    };

    const handleSignInPress = () => {
        navigation.navigate('SignIn');
    };

    return (
        <View style={SignInPageStyles.container}>
            {/* Sign Up Form */}
            <Animated.View style={{
                transform: [{
                    translateX: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -width]
                    })
                }],
                opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0]
                }),
                width: '100%'
            }}>
                <Text style={SignInPageStyles.welcomeText}>Tạo tài khoản!</Text>
                <Text style={SignInPageStyles.instructionText}>Vui lòng, đăng ký để tiếp tục.</Text>

                <View>
                    <TextInput
                        style={[SignInPageStyles.input, nameError ? { borderColor: 'red', borderWidth: 1 } : {}]}
                        placeholder="Họ và tên"
                        placeholderTextColor="#aaa"
                        value={name}
                        onChangeText={text => setName(text)}
                    />
                    {nameError ? <Text style={{ color: 'red', fontSize: 12 }}>{nameError}</Text> : null}
                </View>
                
                <View>
                    <TextInput
                        style={[SignInPageStyles.input, emailError ? { borderColor: 'red', borderWidth: 1 } : {}]}
                        placeholder="Email"
                        placeholderTextColor="#aaa"
                        value={email}
                        onChangeText={text => setEmail(text)}
                        keyboardType="email-address"
                    />
                    {emailError ? <Text style={{ color: 'red', fontSize: 12 }}>{emailError}</Text> : null}
                </View>
                
                <View>
                    <TextInput
                        style={[SignInPageStyles.input, passwordError ? { borderColor: 'red', borderWidth: 1 } : {}]}
                        placeholder="Mật khẩu"
                        placeholderTextColor="#aaa"
                        secureTextEntry={!isPasswordVisible}
                        value={password}
                        onChangeText={text => setPassword(text)}
                    />
                    {passwordError ? <Text style={{ color: 'red', fontSize: 12 }}>{passwordError}</Text> : null}

                    <TouchableOpacity onPress={togglePasswordVisibility} style={{ position: 'absolute', top: 15, right: 18 }}>
                        <Image
                            source={isPasswordVisible ? require('../Assets/Images/eye-open.png') : require('../Assets/Images/eye-close.png')}
                            style={{ width: 20, height: 20 }}
                        />
                    </TouchableOpacity>
                </View>
                
                <View>
                    <TextInput
                        style={[SignInPageStyles.input, confirmPasswordError ? { borderColor: 'red', borderWidth: 1 } : {}]}
                        placeholder="Nhập lại mật khẩu"
                        placeholderTextColor="#aaa"
                        secureTextEntry={!isPasswordVisible}
                        value={confirmPassword}
                        onChangeText={text => setConfirmPassword(text)}
                    />
                    {confirmPasswordError ? <Text style={{ color: 'red', fontSize: 12 }}>{confirmPasswordError}</Text> : null}

                    <TouchableOpacity onPress={togglePasswordVisibility} style={{ position: 'absolute', top: 15, right: 18 }}>
                        <Image
                            source={isPasswordVisible ? require('../Assets/Images/eye-open.png') : require('../Assets/Images/eye-close.png')}
                            style={{ width: 20, height: 20 }}
                        />
                    </TouchableOpacity>
                </View>
                
                <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={toggleCheckbox}>
                        <Image
                            source={isChecked
                                ? require('../Assets/Images/check-box-50.png')
                                : require('../Assets/Images/checked.png')}
                            style={SignInPageStyles.checkbox}
                        />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 17, fontFamily: 'Playfair_me' }}>Tôi đồng ý với chính sách bảo mật</Text>
                </View>
                {policyError ? <Text style={{ color: 'red', fontSize: 12, textAlign: 'center' }}>{policyError}</Text> : null}
                
                <TouchableOpacity 
                    style={SignInPageStyles.signInButton} 
                    onPress={dangky}
                    disabled={otpRequestStatus === 'loading'}>
                    {otpRequestStatus === 'loading' && !showOtpInput ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={SignInPageStyles.signInButtonText}>Đăng ký</Text>
                    )}
                </TouchableOpacity>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 15 }} >
                    <Text style={SignInPageStyles.signUpPrompt}>
                        Bạn đã có tài khoản? </Text>
                    <TouchableOpacity onPress={handleSignInPress} style={{ marginLeft: 10 }}>
                        <Text style={{ color: 'gray', fontFamily:'Playfair_me' }}>Đăng nhập ngay</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* OTP Verification Screen */}
            <Animated.View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#fff',
                transform: [{
                    translateX: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [width, 0]
                    })
                }],
                opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1]
                })
            }}>
                <View style={styles.otpContainer}>
                    <Text style={styles.otpTitle}>Xác thực email</Text>
                    <Text style={styles.otpDescription}>
                        Vui lòng nhập mã OTP đã được gửi đến {email}
                    </Text>

                    <View style={styles.otpInputContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={otpInputRefs[index]}
                                style={[styles.otpInput, otpError ? styles.otpInputError : null]}
                                keyboardType="number-pad"
                                maxLength={1}
                                value={digit}
                                onChangeText={text => handleOtpChange(text, index)}
                                onKeyPress={e => handleOtpKeyPress(e, index)}
                                selectTextOnFocus
                            />
                        ))}
                    </View>
                    
                    {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
                    
                    <View style={styles.resendContainer}>
                        <Text style={styles.resendText}>
                            {canResend ? 'Không nhận được mã?' : `Gửi lại sau ${timer}s`}
                        </Text>
                        <TouchableOpacity
                            onPress={handleResendOtp}
                            disabled={!canResend || otpRequestStatus === 'loading'}>
                            <Text style={[styles.resendButton, (!canResend || otpRequestStatus === 'loading') && styles.disabledText]}>
                                Gửi lại
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                        style={styles.verifyButton}
                        onPress={handleVerifyOtp}
                        disabled={otpVerifyStatus === 'loading' || registerStatus === 'loading'}>
                        {otpVerifyStatus === 'loading' || registerStatus === 'loading' ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.verifyButtonText}>Xác nhận</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    otpContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    otpTitle: {
        fontSize: 24,
        fontFamily: 'Playfair_me',
        marginBottom: 15,
        textAlign: 'center',
    },
    otpDescription: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        fontFamily: 'Playfair_me',
    },
    otpInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: 20,
    },
    otpInput: {
        width: 60,
        height: 60,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 24,
        backgroundColor: '#f9f9f9',
        fontFamily: 'Playfair_me',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    otpInputError: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginBottom: 20,
        fontFamily: 'Playfair_me',
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    resendText: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Playfair_me',
    },
    resendButton: {
        fontSize: 14,
        color: '#000',
        fontWeight: 'bold',
        marginLeft: 5,
        fontFamily: 'Playfair_me',
    },
    disabledText: {
        color: '#ccc',
    },
    verifyButton: {
        backgroundColor: '#000',
        paddingVertical: 15,
        borderRadius: 30,
        width: '90%',
        alignItems: 'center',
        marginTop: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Playfair_me',
        fontWeight: '500',
    }
});

export default SignUp;

