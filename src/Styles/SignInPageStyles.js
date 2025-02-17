import { StyleSheet } from "react-native";

const SignInPageStyles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'start',
        marginBottom: 10,
        color: '#333',
        fontFamily: 'Playfair_me',
    },
    instructionText: {
        fontSize: 16,
        textAlign: 'start',
        marginBottom: 30,
        color: '#666',
        fontFamily: 'Playfair_Me', 
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
        paddingStart: 40
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    checkbox: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    rememberMeText: {
        color: '#000',
        fontSize: 14,
    },
    forgotPasswordText: {
        color: '#000',
        fontSize: 14,
    },
    signInButton: {
        backgroundColor: '#000',
        paddingVertical: 15,
        borderRadius: 15,
        marginBottom: 20,
        marginTop: 20
    },
    signInButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: 'Playfair_me',
    },
    orText: {
        textAlign: 'center',
        marginVertical: 10,
        color: '#000000',
        fontSize: 17,
    },
    socialButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    socialButton: {
        width: 58,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    socialIcon: {
        width: '100%',
        height: '100%',
    },
    guestText: {
        textAlign: 'start',
        color: '#BABABA',
        marginBottom: 10,
        textDecorationLine: 'underline',
        fontSize: 17,
        justifyContent:'center',
        alignItems:'center'
    },
    signUpPrompt: {
        textAlign: 'start',
        color: '#000000',
        fontSize: 17,
    },
    signUpText: {
        color: '#BABABA',
        fontSize: 17,
        fontFamily: 'Playfair_me',
    },
});

export default SignInPageStyles;