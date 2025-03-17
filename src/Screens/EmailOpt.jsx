import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ToastAndroid, ActivityIndicator, SafeAreaView, ScrollView, Dimensions } from "react-native";
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const EmailOtp = () => {
    const navigation = useNavigation();
    const [currentStep, setCurrentStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    
    // Refs for OTP inputs
    const otpInputRefs = useRef([]);
    
    // Initialize refs array
    useEffect(() => {
        otpInputRefs.current = Array(4).fill().map((_, i) => otpInputRefs.current[i] || React.createRef());
    }, []);
    
    // Input validation states
    const [emailError, setEmailError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    // Timer for OTP resend
    useEffect(() => {
        let interval;
        if (currentStep === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        
        return () => clearInterval(interval);
    }, [currentStep, timer]);

    // Validate email
    const validateEmail = () => {
        if (!email.trim()) {
            setEmailError("Email không được để trống");
            return false;
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            setEmailError("Email không hợp lệ");
            return false;
        } else {
            setEmailError("");
            return true;
        }
    };

    // Validate OTP
    const validateOtp = () => {
        const fullOtp = otp.join('');
        if (fullOtp.length !== 4) {
            setOtpError("Vui lòng nhập đủ 4 chữ số OTP");
            return false;
        } else {
            setOtpError("");
            return true;
        }
    };

    // Validate password
    const validatePassword = () => {
        if (!password.trim()) {
            setPasswordError("Mật khẩu không được để trống");
            return false;
        } else if (password.length < 6) {
            setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
            return false;
        } else {
            setPasswordError("");
            return true;
        }
    };

    // Validate confirm password
    const validateConfirmPassword = () => {
        if (password !== confirmPassword) {
            setConfirmPasswordError("Mật khẩu xác nhận không khớp");
            return false;
        } else {
            setConfirmPasswordError("");
            return true;
        }
    };

    // Handle OTP input
    const handleOtpChange = (text, index) => {
        // Only allow digits
        const digitText = text.replace(/[^0-9]/g, '');
        
        // Update OTP array
        const newOtp = [...otp];
        newOtp[index] = digitText;
        setOtp(newOtp);
        
        // Auto-focus to next input if a digit was entered
        if (digitText && index < 3) {
            otpInputRefs.current[index + 1].focus();
        }
        
        // If user pastes a 4-digit code, distribute it across inputs
        if (text.length > 1) {
            const digits = text.replace(/[^0-9]/g, '').split('').slice(0, 4);
            const newOtp = [...otp];
            
            digits.forEach((digit, idx) => {
                if (idx < 4) {
                    newOtp[idx] = digit;
                }
            });
            
            setOtp(newOtp);
            
            // Focus on the appropriate input based on how many digits were pasted
            if (digits.length < 4 && index + digits.length < 4) {
                otpInputRefs.current[index + digits.length].focus();
            }
        }
    };
    
    // Handle backspace in OTP input
    const handleOtpKeyPress = (e, index) => {
        // Check if backspace was pressed and current input is empty
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            // Focus on previous input
            otpInputRefs.current[index - 1].focus();
        }
    };

    // Handle step 1 submission
    const handleStep1Submit = () => {
        if (!validateEmail()) return;
        
        setLoading(true);
        // Simulate API call to send OTP
        setTimeout(() => {
            setLoading(false);
            setCurrentStep(2);
            ToastAndroid.show(`Mã OTP đã được gửi đến ${email}`, ToastAndroid.SHORT);
            
            // Focus on first OTP input after a short delay
            setTimeout(() => {
                if (otpInputRefs.current[0]) {
                    otpInputRefs.current[0].focus();
                }
            }, 100);
        }, 1500);
    };

    // Handle step 2 submission
    const handleStep2Submit = () => {
        if (!validateOtp()) return;
        
        setLoading(true);
        // Simulate API call to verify OTP
        setTimeout(() => {
            setLoading(false);
            setCurrentStep(3);
            ToastAndroid.show("Mã OTP hợp lệ", ToastAndroid.SHORT);
        }, 1500);
    };

    // Handle step 3 submission
    const handleStep3Submit = () => {
        if (!validatePassword() || !validateConfirmPassword()) return;
        
        setLoading(true);
        // Simulate API call to reset password
        setTimeout(() => {
            setLoading(false);
            setCurrentStep(4);
            ToastAndroid.show("Đặt lại mật khẩu thành công", ToastAndroid.SHORT);
        }, 1500);
    };

    // Handle resend OTP
    const handleResendOtp = () => {
        if (!canResend) return;
        
        setLoading(true);
        // Simulate API call to resend OTP
        setTimeout(() => {
            setLoading(false);
            setTimer(60);
            setCanResend(false);
            ToastAndroid.show(`Mã OTP mới đã được gửi đến ${email}`, ToastAndroid.SHORT);
            
            // Clear OTP fields
            setOtp(['', '', '', '']);
            
            // Focus on first OTP input after a short delay
            setTimeout(() => {
                if (otpInputRefs.current[0]) {
                    otpInputRefs.current[0].focus();
                }
            }, 100);
        }, 1500);
    };

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    // Toggle confirm password visibility
    const toggleConfirmPasswordVisibility = () => {
        setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
    };

    // Return to login screen
    const handleReturnToLogin = () => {
        navigation.navigate('SignIn');
    };

    // Render step 1: Email input
    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Quên mật khẩu</Text>
            <Text style={styles.stepDescription}>
                Vui lòng nhập email của bạn để nhận mã OTP
            </Text>
            
            <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                    <Image source={require('../Assets/Images/mail.png')} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, emailError && styles.inputError]}
                        placeholder="Nhập email của bạn"
                        placeholderTextColor="#aaa"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={text => setEmail(text)}
                        autoCapitalize="none"
                    />
                </View>
                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={handleStep1Submit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.submitButtonText}>Tiếp tục</Text>
                    )}
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.backButton} onPress={handleReturnToLogin}>
                    <Text style={styles.backButtonText}>Quay lại đăng nhập</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // Render step 2: OTP input
    const renderStep2 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Nhập mã OTP</Text>
            <Text style={styles.stepDescription}>
                Vui lòng nhập mã OTP đã được gửi đến {email}
            </Text>
            
            <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={el => otpInputRefs.current[index] = el}
                        style={styles.otpInput}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onChangeText={(text) => handleOtpChange(text, index)}
                        onKeyPress={(e) => handleOtpKeyPress(e, index)}
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
                    disabled={!canResend || loading}
                >
                    <Text style={[styles.resendButton, !canResend && styles.disabledText]}>
                        Gửi lại
                    </Text>
                </TouchableOpacity>
            </View>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={handleStep2Submit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.submitButtonText}>Xác nhận</Text>
                    )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => setCurrentStep(1)}
                >
                    <Text style={styles.backButtonText}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // Render step 3: New password input
    const renderStep3 = () => (
        <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Đặt lại mật khẩu</Text>
            <Text style={styles.stepDescription}>
                Vui lòng nhập mật khẩu mới của bạn
            </Text>
            
            <View style={styles.inputWrapper}>
                <View style={styles.inputContainer}>
                    <Image source={require('../Assets/Images/lock.png')} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, passwordError && styles.inputError]}
                        placeholder="Mật khẩu mới"
                        placeholderTextColor="#aaa"
                        secureTextEntry={!isPasswordVisible}
                        value={password}
                        onChangeText={text => setPassword(text)}
                    />
                    <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                        <Image
                            source={isPasswordVisible ? require('../Assets/Images/eye-open.png') : require('../Assets/Images/eye-close.png')}
                            style={{ width: 20, height: 20 }}
                        />
                    </TouchableOpacity>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                
                <View style={styles.inputContainer}>
                    <Image source={require('../Assets/Images/lock.png')} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, confirmPasswordError && styles.inputError]}
                        placeholder="Xác nhận mật khẩu mới"
                        placeholderTextColor="#aaa"
                        secureTextEntry={!isConfirmPasswordVisible}
                        value={confirmPassword}
                        onChangeText={text => setConfirmPassword(text)}
                    />
                    <TouchableOpacity onPress={toggleConfirmPasswordVisibility} style={styles.eyeIcon}>
                        <Image
                            source={isConfirmPasswordVisible ? require('../Assets/Images/eye-open.png') : require('../Assets/Images/eye-close.png')}
                            style={{ width: 20, height: 20 }}
                        />
                    </TouchableOpacity>
                </View>
                {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
            </View>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={styles.submitButton} 
                    onPress={handleStep3Submit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.submitButtonText}>Xác nhận</Text>
                    )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => setCurrentStep(2)}
                >
                    <Text style={styles.backButtonText}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // Render step 4: Success confirmation
    const renderStep4 = () => (
        <View style={styles.successContainer}>
            <Image 
                source={require('../Assets/Images/success.gif')} 
                style={styles.successIcon}
            />
            <Text style={styles.stepTitle}>Thành công!</Text>
            <Text style={styles.stepDescription}>
                Mật khẩu của bạn đã được đặt lại thành công
            </Text>
            
            <TouchableOpacity 
                style={[styles.submitButton, styles.successButton]} 
                onPress={handleReturnToLogin}
            >
                <Text style={styles.submitButtonText}>Đăng nhập</Text>
            </TouchableOpacity>
        </View>
    );

    // Render current step
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return renderStep1();
            case 2:
                return renderStep2();
            case 3:
                return renderStep3();
            case 4:
                return renderStep4();
            default:
                return renderStep1();
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView 
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    {/* Progress indicator */}
                    <View style={styles.progressContainer}>
                        {[1, 2, 3, 4].map((step) => (
                            <View key={step} style={styles.progressStepWrapper}>
                                <View 
                                    style={[
                                        styles.progressStep, 
                                        currentStep >= step && styles.activeProgressStep
                                    ]}
                                >
                                    {currentStep > step ? (
                                        <Image 
                                            source={require('../Assets/Images/checked.png')} 
                                            style={styles.checkIcon}
                                        />
                                    ) : (
                                        <Text 
                                            style={[
                                                styles.progressStepText, 
                                                currentStep >= step && styles.activeProgressStepText
                                            ]}
                                        >
                                            {step}
                                        </Text>
                                    )}
                                </View>
                                {step < 4 && (
                                    <View 
                                        style={[
                                            styles.progressLine, 
                                            currentStep > step && styles.activeProgressLine
                                        ]}
                                    />
                                )}
                            </View>
                        ))}
                    </View>
                    
                    {renderCurrentStep()}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 30,
        width: '100%',
    },
    progressStepWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressStep: {
        width: 35,
        height: 35,
        borderRadius: 18,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    activeProgressStep: {
        backgroundColor: '#000',
        borderColor: '#000',
    },
    progressStepText: {
        color: '#666',
        fontSize: 16,
        fontFamily: 'Playfair_me',
        fontWeight: '500',
    },
    activeProgressStepText: {
        color: '#fff',
    },
    progressLine: {
        width: width * 0.12,
        height: 2,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 5,
    },
    activeProgressLine: {
        backgroundColor: '#000',
    },
    checkIcon: {
        width: 18,
        height: 18,
        tintColor: '#fff',
    },
    stepContainer: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 20,
    },
    successContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 15,
        paddingTop: 20,
        flex: 1,
    },
    stepTitle: {
        fontSize: 28,
        textAlign: 'center',
        marginBottom: 10,
        color: '#333',
        fontFamily: 'PlayfairDisplay2',
    },
    stepDescription: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
        color: '#666',
        fontFamily: 'Playfair_me',
        paddingHorizontal: 20,
    },
    inputWrapper: {
        width: '90%',
        marginBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    inputIcon: {
        width: 20,
        height: 20,
        marginLeft: 15,
        tintColor: '#666',
    },
    input: {
        flex: 1,
        height: 55,
        paddingHorizontal: 15,
        fontFamily: 'Playfair_me',
        fontSize: 15,
    },
    inputError: {
        borderColor: 'red',
    },
    eyeIcon: {
        padding: 15,
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 10,
        fontFamily: 'Playfair_me',
        alignSelf: 'flex-start',
        marginLeft: 5,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        width: '80%',
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
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
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
    buttonContainer: {
        width: '90%',
        marginTop: 10,
    },
    submitButton: {
        backgroundColor: '#000',
        paddingVertical: 15,
        borderRadius: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    successButton: {
        width: '90%',
        marginTop: 20,
    },
    submitButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        fontFamily: 'Playfair_me',
        fontWeight: '500',
    },
    backButton: {
        paddingVertical: 15,
    },
    backButtonText: {
        color: '#666',
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'Playfair_me',
    },
    successIcon: {
        width: 120,
        height: 120,
        alignSelf: 'center',
        marginBottom: 20,
    },
});

export default EmailOtp;
