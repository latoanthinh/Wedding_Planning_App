import React, { useState, useEffect } from "react";
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    Image, 
    Animated,
    Dimensions,
    StyleSheet,
    ScrollView,
} from "react-native";
import SignInPageStyles from "../Styles/SignInPageStyles";
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { 
    DangKyTaiKhoan, 
    requestRegisterOTP, 
    verifyRegisterOTP, 
    resetOtpStatus,
    resetRegisterStatus
} from '../redux/RegisterSlice';
import ButtonLoading from '../components/ButtonLoading';

const { width } = Dimensions.get('window');

const SignUp = ({ route }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const navigation = useNavigation();
    
    const shouldResetForm = route?.params?.resetForm || false;
    
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [otpError, setOtpError] = useState('');
    const [otpInputRefs] = useState(Array(4).fill().map(() => React.createRef()));

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [policyError, setPolicyError] = useState('');

    const [statusMessage, setStatusMessage] = useState('');
    const [statusType, setStatusType] = useState('');

    const slideAnim = React.useRef(new Animated.Value(0)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const notificationAnim = React.useRef(new Animated.Value(0)).current;
    const shakeAnimation = React.useRef(new Animated.Value(0)).current;

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
        if (shouldResetForm) {
            resetForm();
        }
        dispatch(resetOtpStatus());
        dispatch(resetRegisterStatus());
        return () => {
            dispatch(resetOtpStatus());
            dispatch(resetRegisterStatus());
        };
    }, [shouldResetForm]);

    const resetForm = () => {
        slideAnim.setValue(0);
        fadeAnim.setValue(0);
        notificationAnim.setValue(0);
        setShowOtpInput(false);
        setOtp(['', '', '', '']);
        setTimer(60);
        setCanResend(false);
        setOtpError('');
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
        setNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
        setPolicyError('');
        setIsChecked(false);
        setStatusMessage('');
        setStatusType('');
        dispatch(resetOtpStatus());
        dispatch(resetRegisterStatus());
    };

    const showNotification = (message, type) => {
        setStatusMessage(message);
        setStatusType(type);
        Animated.sequence([
            Animated.timing(notificationAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(4000),
            Animated.timing(notificationAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => {
            setStatusMessage('');
        });
    };

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            resetForm();
            dispatch(resetRegisterStatus());
        });
        return unsubscribe;
    }, [navigation]);

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
            showNotification(otpData?.message || 'Mã OTP đã được gửi đến email của bạn', 'success');
        } else if (otpRequestStatus === 'failed') {
            showNotification(error || 'Lỗi khi gửi mã OTP', 'error');
            setShowOtpInput(false);
        }
    }, [otpRequestStatus, otpData, error]);

    useEffect(() => {
        if (otpVerifyStatus === 'succeeded') {
            showNotification(otpData?.message || 'Xác thực OTP thành công', 'success');
            setTimeout(() => {
                slideAnim.setValue(0);
                fadeAnim.setValue(0);
                resetForm();
                navigation.navigate('SignIn');
            }, 1500);
        } else if (otpVerifyStatus === 'failed') {
            showNotification(error || 'Mã OTP không hợp lệ', 'error');
            setOtp(['', '', '', '']);
            otpInputRefs[0]?.current?.focus();
            shakeOtpInputs();
        }
    }, [otpVerifyStatus, otpData, error]);

    useEffect(() => {
        if (registerStatus === 'succeeded') {
            showNotification(registerData?.message || 'Đăng ký tài khoản thành công! Vui lòng nhập mã OTP để kích hoạt tài khoản.', 'success');
            setShowOtpInput(true);
            setTimer(60);
            setCanResend(false);
        } else if (registerStatus === 'failed') {
            showNotification(error || "Có lỗi xảy ra, vui lòng thử lại!", 'error');
        }
    }, [registerStatus, registerData, error]);

    const validateInputs = () => {
        let valid = true;
        let errorMessage = '';
        setNameError('');
        setEmailError('');
        setPasswordError('');
        setConfirmPasswordError('');
        setPolicyError('');

        if (!name.trim()) {
            setNameError("Họ và tên không được để trống");
            errorMessage = "Họ và tên không được để trống";
            valid = false;
            return { valid, errorMessage };
        }

        if (!email.trim()) {
            setEmailError("Email không được để trống");
            errorMessage = "Email không được để trống";
            valid = false;
            return { valid, errorMessage };
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            setEmailError("Email không hợp lệ");
            errorMessage = "Email không hợp lệ";
            valid = false;
            return { valid, errorMessage };
        }

        if (!password.trim()) {
            setPasswordError("Mật khẩu không được để trống");
            errorMessage = "Mật khẩu không được để trống";
            valid = false;
            return { valid, errorMessage };
        } else if (password.length < 6) {
            setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
            errorMessage = "Mật khẩu phải có ít nhất 6 ký tự";
            valid = false;
            return { valid, errorMessage };
        }

        if (!confirmPassword.trim()) {
            setConfirmPasswordError("Vui lòng nhập lại mật khẩu");
            errorMessage = "Vui lòng nhập lại mật khẩu";
            valid = false;
            return { valid, errorMessage };
        } else if (confirmPassword !== password) {
            setConfirmPasswordError("Mật khẩu xác nhận không khớp");
            errorMessage = "Mật khẩu xác nhận không khớp";
            valid = false;
            return { valid, errorMessage };
        }

        if (!isChecked) {
            setPolicyError("Bạn phải đồng ý với chính sách bảo mật");
            errorMessage = "Bạn phải đồng ý với chính sách bảo mật";
            valid = false;
            return { valid, errorMessage };
        }

        return { valid, errorMessage };
    };

    const handleVerifyOtp = () => {
        const fullOtp = otp.join('');
        if (fullOtp.length !== 4) {
            setOtpError('Vui lòng nhập đủ 4 chữ số OTP');
            showNotification('Vui lòng nhập đủ 4 chữ số OTP', 'error');
            return;
        }
        setOtpError('');
        dispatch(verifyRegisterOTP({ email, otp: fullOtp }))
            .unwrap()
            .then(() => {})
            .catch(() => {});
    };

    const handleOtpChange = (text, index) => {
        const digitText = text.replace(/[^0-9]/g, '');
        const newOtp = [...otp];
        newOtp[index] = digitText;
        setOtp(newOtp);
        if (otpError) setOtpError('');
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
        const { valid, errorMessage } = validateInputs();
        if (valid) {
            dispatch(DangKyTaiKhoan({ email, password, name }));
        } else if (errorMessage) {
            showNotification(errorMessage, 'error');
        }
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const toggleCheckbox = () => {
        setIsChecked(!isChecked);
    };

    const handleSignInPress = () => {
        slideAnim.setValue(0);
        fadeAnim.setValue(0);
        resetForm();
        dispatch(resetRegisterStatus());
        navigation.navigate('SignIn');
    };

    const shakeOtpInputs = () => {
        Animated.sequence([
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
        ]).start();
    };

    const handleBackToRegistration = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowOtpInput(false);
            setOtp(['', '', '', '']);
            setOtpError('');
        });
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={SignInPageStyles.container}>
                {statusMessage ? (
                    <Animated.View style={[
                        styles.notification, 
                        statusType === 'success' ? styles.successNotification : 
                        statusType === 'error' ? styles.errorNotification : styles.infoNotification,
                        {
                            opacity: notificationAnim,
                            transform: [{
                                translateY: notificationAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-50, 0]
                                })
                            }]
                        }
                    ]}>
                        <Text style={styles.notificationText}>{statusMessage}</Text>
                    </Animated.View>
                ) : null}

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
                            style={SignInPageStyles.input}
                            placeholder="Họ và tên"
                            placeholderTextColor="#aaa"
                            value={name}
                            onChangeText={text => {
                                setName(text);
                                if (nameError) setNameError('');
                            }}
                        />
                    </View>
                    
                    <View>
                        <TextInput
                            style={SignInPageStyles.input}
                            placeholder="Email"
                            placeholderTextColor="#aaa"
                            value={email}
                            onChangeText={text => {
                                setEmail(text);
                                if (emailError) setEmailError('');
                            }}
                            keyboardType="email-address"
                        />
                    </View>
                    
                    <View>
                        <TextInput
                            style={[SignInPageStyles.input, { paddingRight: 40 }]}
                            placeholder="Mật khẩu"
                            placeholderTextColor="#aaa"
                            secureTextEntry={!isPasswordVisible}
                            value={password}
                            onChangeText={text => {
                                setPassword(text);
                                if (passwordError) setPasswordError('');
                            }}
                        />
                        <TouchableOpacity 
                            onPress={togglePasswordVisibility} 
                            style={styles.eyeIconContainer}
                        >
                            <Image
                                source={isPasswordVisible 
                                    ? require('../Assets/Images/eye-close.png') 
                                    : require('../Assets/Images/eye-open.png')}
                                style={styles.eyeIcon}
                            />
                        </TouchableOpacity>
                    </View>
                    
                    <View>
                        <TextInput
                            style={[SignInPageStyles.input, { paddingRight: 40 }]}
                            placeholder="Nhập lại mật khẩu"
                            placeholderTextColor="#aaa"
                            secureTextEntry={!isPasswordVisible}
                            value={confirmPassword}
                            onChangeText={text => {
                                setConfirmPassword(text);
                                if (confirmPasswordError) setConfirmPasswordError('');
                            }}
                        />
                        <TouchableOpacity 
                            onPress={togglePasswordVisibility} 
                            style={styles.eyeIconContainer}
                        >
                            <Image
                                source={isPasswordVisible 
                                    ? require('../Assets/Images/eye-close.png') 
                                    : require('../Assets/Images/eye-open.png')}
                                style={styles.eyeIcon}
                            />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={{ flexDirection: "row", alignItems: 'center', justifyContent: 'center' }}>
                        <TouchableOpacity onPress={() => {
                            toggleCheckbox();
                            if (policyError) setPolicyError('');
                        }}>
                            <Image
                                source={isChecked
                                    ? require('../Assets/Images/check-box-50.png')
                                    : require('../Assets/Images/checked.png')}
                                style={SignInPageStyles.checkbox}
                            />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 17, fontFamily: 'Playfair_me' }}>Tôi đồng ý với chính sách bảo mật</Text>
                    </View>
                    
                    <ButtonLoading
                        text="Đăng ký"
                        loading={otpRequestStatus === 'loading' && !showOtpInput}
                        disabled={otpRequestStatus === 'loading'}
                        onPress={dangky}
                        style={SignInPageStyles.signInButton}
                        textStyle={SignInPageStyles.signInButtonText}
                    />
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 15 }}>
                        <Text style={SignInPageStyles.signUpPrompt}>Bạn đã có tài khoản? </Text>
                        <TouchableOpacity onPress={handleSignInPress} style={{ marginLeft: 10 }}>
                            <Text style={{ color: 'gray', fontFamily: 'Playfair_me' }}>Đăng nhập ngay</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

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

                        {otpError ? <Text style={styles.errorTextCenter}>{otpError}</Text> : null}
                        <View style={styles.otpInputContainer}>
                            {otp.map((digit, index) => (
                                <Animated.View
                                    key={`container-${index}`}
                                    style={{
                                        transform: [{ translateX: shakeAnimation }]
                                    }}
                                >
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
                                </Animated.View>
                            ))}
                        </View>
                        
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

                        <ButtonLoading
                            text="Xác nhận"
                            loading={otpVerifyStatus === 'loading' || registerStatus === 'loading'}
                            disabled={otpVerifyStatus === 'loading' || registerStatus === 'loading'}
                            onPress={handleVerifyOtp}
                            style={styles.verifyButton}
                            textStyle={styles.verifyButtonText}
                        />
                        
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={handleBackToRegistration}>
                            <Text style={styles.backButtonText}>Quay lại đăng ký</Text>
                        </TouchableOpacity>
                        
                        {otpVerifyStatus === 'failed' && (
                            <View style={styles.otpErrorContainer}>
                                <Image 
                                    source={require('../Assets/Images/error.png')} 
                                    style={styles.errorIcon}
                                />
                                <Text style={styles.otpErrorText}>{error || 'Mã OTP không đúng. Vui lòng kiểm tra lại.'}</Text>
                            </View>
                        )}
                    </View>
                </Animated.View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    notification: {
        position: 'absolute',
        top: 10,
        left: 20,
        right: 20,
        padding: 15,
        borderRadius: 8,
        zIndex: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    successNotification: {
        backgroundColor: '#E7F3EB',
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    errorNotification: {
        backgroundColor: '#FDEDED',
        borderLeftWidth: 4,
        borderLeftColor: '#F44336',
    },
    infoNotification: {
        backgroundColor: '#E6F4FF',
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    notificationText: {
        fontFamily: 'Playfair_me',
        fontSize: 14,
        color: '#444444',
    },
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
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    otpInputError: {
        borderColor: 'red',
    },
    errorTextCenter: {
        color: 'red',
        fontSize: 13,
        marginBottom: 10,
        fontFamily: 'Playfair_me',
        textAlign: 'center',
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Playfair_me',
        fontWeight: '500',
    },
    backButton: {
        backgroundColor: 'transparent',
        paddingVertical: 15,
        borderRadius: 30,
        width: '90%',
        alignItems: 'center',
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    backButtonText: {
        color: '#666',
        fontSize: 16,
        fontFamily: 'Playfair_me',
        fontWeight: '500',
    },
    otpErrorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        backgroundColor: '#FFEBEE',
        padding: 10,
        borderRadius: 8,
        width: '90%',
    },
    errorIcon: {
        width: 18,
        height: 18,
        marginRight: 10,
        tintColor: '#F44336',
    },
    otpErrorText: {
        color: '#D32F2F',
        fontSize: 14,
        fontFamily: 'Playfair_me',
        flex: 1,
    },
    eyeIconContainer: {
        position: 'absolute',
        right: 10,
        top: 12,
    },
    eyeIcon: {
        width: 20,
        height: 20,
    },
});

export default SignUp;