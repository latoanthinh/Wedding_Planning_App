import React from 'react'

import Intro from '../Screens/Intro'
import SignIn from '../Screens/SignIn'
import SignUp from '../Screens/SignUp'
import Welcome from '../Screens/Welcome'
import EditProfile from '../Screens/EditProfile'



import { createNativeStackNavigator } from '@react-navigation/native-stack';
// START: dành cho user chưa đăng nhập
const GuestStack = createNativeStackNavigator();
const GuestStackNavigation = () => {
  return (
    <GuestStack.Navigator screenOptions={{ headerShown: false}}>
        
        <GuestStack.Screen name="SignIn" component={SignIn} />
        <GuestStack.Screen name="SignUp" component={SignUp} />
    </GuestStack.Navigator>
  )
}
// END: dành cho user chưa đăng nhập


// START: Stack dành cho user đã đăng nhập
import TabNavigation from './TabNavigation'
const Stack = createNativeStackNavigator();
const StackNavigation = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            
            <Stack.Screen name="TabNavigation" component={TabNavigation} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
           
        </Stack.Navigator>
    )
}
// END: Stack dành cho user đã đăng nhập

export { StackNavigation, GuestStackNavigation }