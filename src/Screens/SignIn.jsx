import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import SignInPageStyles from "../Styles/SignInPageStyles";
import { useNavigation } from '@react-navigation/native';

function SignIn_Page() {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isChecked, setIsChecked] = useState(false); // State to track the checkbox status
    const navigation = useNavigation(); // Hook to access navigation

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const toggleCheckbox = () => {
        setIsChecked(!isChecked); // Toggle the checkbox state
    };

    const handleSignUpPress = () => {
        navigation.navigate('SignUp'); // Navigate to the SignUp screen
    };

    return (
        <View style={SignInPageStyles.container}>
            <Text style={SignInPageStyles.welcomeText}>Welcome back!</Text>
            <Text style={SignInPageStyles.instructionText}>Please, sign in to continue.</Text>
            <View>
                <TextInput
                    style={SignInPageStyles.input}
                    placeholder="Email"
                    placeholderTextColor="#aaa"
                />
                <Image source={require('../Assets/Images/user.png')} style={{ width: 20, height: 20, position: 'absolute', top: 15, left: 8 }} />
            </View>
            

            <View>
                <TextInput
                    style={SignInPageStyles.input}
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    secureTextEntry={!isPasswordVisible}
                />
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
                                ? require('../Assets/Images/check-box-50.png') // Checked checkbox image
                                : require('../Assets/Images/checked.png')}  // Unchecked checkbox image
                            style={SignInPageStyles.checkbox}
                        />
                    </TouchableOpacity>
                    <Text style={SignInPageStyles.rememberMeText}>Remember me</Text>
                </View>
                <Text style={SignInPageStyles.forgotPasswordText}>Forgot password?</Text>
            </View>

            <TouchableOpacity style={SignInPageStyles.signInButton}>
                <Text style={SignInPageStyles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>

            <Text style={SignInPageStyles.orText}>Or sign in with</Text>
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

            <Text style={SignInPageStyles.guestText}>Continue as a Guest</Text>
            <View style={{flexDirection:'row',alignItems:'center', justifyContent:'center'}} > 
                <Text style={SignInPageStyles.signUpPrompt}>
                    Don't have an account? </Text>
                <TouchableOpacity onPress={handleSignUpPress} style={{marginLeft:20}}>
                    <Text style={{ color: 'gray' }}>Sign up</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default SignIn_Page;
