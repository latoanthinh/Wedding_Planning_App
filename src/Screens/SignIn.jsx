import React from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import SignInPageStyles from "../Styles/SignInPageStyles";

function SignIn_Page() {
    return (
        <View style={SignInPageStyles.container}>
            <Text style={SignInPageStyles.welcomeText}>Welcome back!</Text>
            <Text style={SignInPageStyles.instructionText}>Please, sign in to continue.</Text>

            <TextInput
                style={SignInPageStyles.input}
                placeholder="Username"
                placeholderTextColor="#aaa"
            />
            <TextInput
                style={SignInPageStyles.input}
                placeholder="Password"
                placeholderTextColor="#aaa"
                secureTextEntry
            />

            <View style={SignInPageStyles.rememberMeContainer}>
                <View style={{ flexDirection: "row", }}>
                    <TouchableOpacity>
                        <Image source={require('../Assets/Images/checkbox.png')} style={SignInPageStyles.checkbox} />
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
            <Text style={SignInPageStyles.signUpPrompt}>
                Don't have an account? <Text style={SignInPageStyles.signUpText}>Sign up</Text>
            </Text>
        </View>
    );
}

export default SignIn_Page; //nigga