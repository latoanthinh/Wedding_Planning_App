import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import SignInPageStyles from "../Styles/SignInPageStyles";
import { useNavigation } from '@react-navigation/native';

const SignUp = () => {
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
        navigation.navigate('SignIn'); // Navigate to the SignUp screen
    };
    return (
        <View style={SignInPageStyles.container}>
            <Text style={SignInPageStyles.welcomeText}>Welcome back!</Text>
            <Text style={SignInPageStyles.instructionText}>Please, sign in to continue.</Text>

            <TextInput
                style={SignInPageStyles.input}
                placeholder="Full Name"
                placeholderTextColor="#aaa"
            />
            <TextInput
                style={SignInPageStyles.input}
                placeholder="Email"
                placeholderTextColor="#aaa"
            />
            <View>
                <TextInput
                    style={SignInPageStyles.input}
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    secureTextEntry={!isPasswordVisible}
                />

                <TouchableOpacity onPress={togglePasswordVisibility} style={{ position: 'absolute', top: 15, right: 18 }}>
                    <Image
                        source={isPasswordVisible ? require('../Assets/Images/eye-open.png') : require('../Assets/Images/eye-close.png')}
                        style={{ width: 20, height: 20 }}
                    />
                </TouchableOpacity>
            </View>
            <View>
                <TextInput
                    style={SignInPageStyles.input}
                    placeholder="ConirmPassword"
                    placeholderTextColor="#aaa"
                    secureTextEntry={!isPasswordVisible}
                />

                <TouchableOpacity onPress={togglePasswordVisibility} style={{ position: 'absolute', top: 15, right: 18 }}>
                    <Image
                        source={isPasswordVisible ? require('../Assets/Images/eye-open.png') : require('../Assets/Images/eye-close.png')}
                        style={{ width: 20, height: 20 }}
                    />
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row",alignItems:'center', justifyContent:'center'}}>
                <TouchableOpacity onPress={toggleCheckbox}>
                    <Image
                        source={isChecked
                            ? require('../Assets/Images/check-box-50.png') // Checked checkbox image
                            : require('../Assets/Images/checked.png')}  // Unchecked checkbox image
                        style={SignInPageStyles.checkbox}
                    />
                </TouchableOpacity>
                <Text style={{fontSize:17, fontWeight:'black'}}>I Agree with privacy and policy</Text>
            </View>
            <TouchableOpacity style={SignInPageStyles.signInButton}>
                <Text style={SignInPageStyles.signInButtonText}>Sign up</Text>
            </TouchableOpacity>
            <View style={{flexDirection:'row',alignItems:'center', justifyContent:'center', marginTop:15}} > 
                <Text style={SignInPageStyles.signUpPrompt}>
                    Don't have an account? </Text>
                <TouchableOpacity onPress={handleSignUpPress} style={{marginLeft:20}}>
                    <Text style={{ color: 'gray' }}>Sign in</Text>
                </TouchableOpacity>
            </View>
        </View >
    )
}

export default SignUp;

