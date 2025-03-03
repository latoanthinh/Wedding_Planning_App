import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ToastAndroid, Alert } from "react-native";
import SignInPageStyles from "../Styles/SignInPageStyles";
import { useNavigation } from '@react-navigation/native';

import { useDispatch, useSelector } from 'react-redux';
import { DangKyTaiKhoan } from '../redux/RegisterSlice';

const SignUp = () => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const navigation = useNavigation();


    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const [nameError, setNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [policyError, setPolicyError] = useState('');

    const validateInputs = () => {
        let valid = true;

        // Kiểm tra tên
        if (!name.trim()) {
            setNameError("Họ và tên không được để trống");
            valid = false;
        } else {
            setNameError('');
        }

        // Kiểm tra email
        if (!email.trim()) {
            setEmailError("Email không được để trống");
            valid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            setEmailError("Email không hợp lệ");
            valid = false;
        } else {
            setEmailError('');
        }

        // Kiểm tra mật khẩu
        if (!password.trim()) {
            setPasswordError("Mật khẩu không được để trống");
            valid = false;
        } else if (password.length < 6) {
            setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
            valid = false;
        } else {
            setPasswordError('');
        }

        // Kiểm tra xác nhận mật khẩu
        if (!confirmPassword.trim()) {
            setConfirmPasswordError("Vui lòng nhập lại mật khẩu");
            valid = false;
        } else if (confirmPassword !== password) {
            setConfirmPasswordError("Mật khẩu xác nhận không khớp");
            valid = false;
        } else {
            setConfirmPasswordError('');
        }

        // Kiểm tra checkbox chính sách
        if (!isChecked) {
            setPolicyError("Bạn phải đồng ý với chính sách bảo mật");
            valid = false;
        } else {
            setPolicyError('');
        }

        return valid;
    };



    const dispatch = useDispatch();
    const { registerData, registerStatus } = useSelector((state) => state.register);

    useEffect(() => {
        if (registerStatus === "succeeded") {
            // Dùng thông báo từ API khi đăng ký thành công
            ToastAndroid.show(registerData.message, ToastAndroid.SHORT);
            navigation.goBack(); // Có thể điều hướng về màn hình đăng nhập
        } else if (registerStatus === "failed") {
            // Dùng thông báo lỗi từ API khi đăng ký thất bại
            Alert.alert("Đăng ký thất bại", registerData.message || "Có lỗi xảy ra, vui lòng thử lại!");
        }
    }, [registerStatus, registerData]);


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

    const handleSignUpPress = () => {
        navigation.navigate('SignIn');
    };
    return (
        <View style={SignInPageStyles.container}>
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
            <TouchableOpacity style={SignInPageStyles.signInButton} onPress={dangky}>
                <Text style={SignInPageStyles.signInButtonText}>Đăng ký</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 15 }} >
                <Text style={SignInPageStyles.signUpPrompt}>
                    Bạn đã có tài khoản? </Text>
                <TouchableOpacity onPress={handleSignUpPress} style={{ marginLeft: 10, fontFamily: 'Playfair_me' }}>
                    <Text style={{ color: 'gray', fontFamily:'Playfair_me' }}>Đăng nhập ngay</Text>
                </TouchableOpacity>
            </View>
        </View >
    )
}

export default SignUp;

