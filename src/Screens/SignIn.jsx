import React, { useState, useContext, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ToastAndroid } from "react-native";
import SignInPageStyles from "../Styles/SignInPageStyles";
import { AppContext } from '../AppContext';
import { useDispatch, useSelector } from 'react-redux';
import { DangNhapTaiKhoan } from '../redux/LoginSlice';

const SignIn = (props) => {

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const { navigation } = props;

    const [email, setEmail] = useState('lmao2@gmail.com');
    const [password, setPassword] = useState('112233');
    const { user, setUser } = useContext(AppContext);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validateInputs = () => {
        let valid = true;

        // Kiểm tra email
        if (!email.trim()) {
            setEmailError("Email không được để trống");
            valid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            setEmailError("Email không hợp lệ");
            valid = false;
        } else {
            setEmailError("");
        }

        // Kiểm tra mật khẩu
        if (!password.trim()) {
            setPasswordError("Mật khẩu không được để trống");
            valid = false;
        } else if (password.length < 6) {
            setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
            valid = false;
        } else {
            setPasswordError("");
        }

        return valid;
    };




    const dispatch = useDispatch();
    const { loginData, loginStatus } = useSelector((state) => state.login);



    useEffect(() => {
        if (loginStatus == "succeeded") {
            setUser(loginData.user);
            ToastAndroid.show(loginData.message, ToastAndroid.SHORT);
        }
        else if (loginStatus === 'failed') {
            ToastAndroid.show('Đăng nhập thất bại!', ToastAndroid.SHORT);
        }
    }, [loginStatus, loginData, setUser])

    const dangnhap = () => {
        if (validateInputs()) {
            dispatch(DangNhapTaiKhoan({ email, password, setUser }));
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
        navigation.navigate('SignUp');
    };

    return (
        <View style={SignInPageStyles.container}>
            <Text style={SignInPageStyles.welcomeText}>Chào mừng bạn!</Text>
            <Text style={SignInPageStyles.instructionText}>Vui lòng đăng nhập để tiếp tục.</Text>
            <View>
                <TextInput
                    style={[SignInPageStyles.input, emailError ? { borderColor: 'red', borderWidth: 1 } : {}]}
                    placeholder="Email"
                    placeholderTextColor="#aaa"
                    value={email}
                    onChangeText={text => setEmail(text)}
                />
                {emailError ? <Text style={{ color: 'red', fontSize: 12 }}>{emailError}</Text> : null}
                <Image source={require('../Assets/Images/user.png')} style={{ width: 20, height: 20, position: 'absolute', top: 15, left: 8 }} />
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
                <Image source={require('../Assets/Images/lock.png')} style={{ width: 20, height: 20, position: 'absolute', top: 15, left: 8 }} />
                <TouchableOpacity onPress={togglePasswordVisibility} style={{ position: 'absolute', top: 15, right: 18 }}>
                    <Image
                        source={isPasswordVisible ? require('../Assets/Images/eye-open.png') : require('../Assets/Images/eye-close.png')}
                        style={{ width: 20, height: 20 }}
                    />
                </TouchableOpacity>
            </View>

            <View style={SignInPageStyles.rememberMeContainer}>
                <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity onPress={toggleCheckbox}>
                        <Image
                            source={isChecked
                                ? require('../Assets/Images/check-box-50.png')
                                : require('../Assets/Images/checked.png')}
                            style={SignInPageStyles.checkbox}
                        />
                    </TouchableOpacity>
                    <Text style={SignInPageStyles.rememberMeText}>Ghi nhớ</Text>
                </View>
                <Text style={SignInPageStyles.forgotPasswordText}>Quên mật khẩu?</Text>
            </View>

            <TouchableOpacity style={SignInPageStyles.signInButton} onPress={dangnhap}>
                <Text style={SignInPageStyles.signInButtonText}>Đăng nhập</Text>
            </TouchableOpacity>

            <Text style={SignInPageStyles.orText}>Hoặc</Text>
            <View style={SignInPageStyles.socialButtonsContainer}>
                <TouchableOpacity style={SignInPageStyles.socialButton}>
                    <Image source={require('../Assets/Images/gg_btn.png')} style={SignInPageStyles.socialIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={SignInPageStyles.socialButton}>
                    <Image source={require('../Assets/Images/apple_btn.png')} style={SignInPageStyles.socialIcon} />
                </TouchableOpacity>
                <TouchableOpacity style={SignInPageStyles.socialButton}>
                    <Image source={require('../Assets/Images/fb_btn.png')} style={SignInPageStyles.socialIcon} />
                </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} >
                <Text style={SignInPageStyles.signUpPrompt}>
                    Bạn không có tài khoản? </Text>
                <TouchableOpacity onPress={handleSignUpPress} style={{ marginLeft: 10, fontFamily: 'Playfair_me' }}>
                    <Text style={{ color: 'gray', fontFamily:'Playfair_me' }}>Đăng ký</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default SignIn;
