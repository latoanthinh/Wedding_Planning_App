import React from 'react'

import Intro from '../Screens/Intro'
import SignIn from '../Screens/SignIn'
import SignUp from '../Screens/SignUp'
import Welcome from '../Screens/Welcome'
import EditProfile from '../Screens/EditProfile'
import Thongtincoban from '../Screens/Thongtincoban'
import Thongtinvedamcuoi from '../Screens/Thongtinvedamcuoi'
import Dichvucanthiet from '../Screens/Dichvucanthiet'
import Sothichvauutien from '../Screens/Sothichvauutien'
import Ghichuvaykien from '../Screens/Ghichuvaykien'
import DetailClothes from '../Screens/DetailClothes'
import Dress from '../Screens/Dress'



import { createNativeStackNavigator } from '@react-navigation/native-stack';
// START: dành cho user chưa đăng nhập
const GuestStack = createNativeStackNavigator();
const GuestStackNavigation = () => {
  return (
    <GuestStack.Navigator screenOptions={{ headerShown: false }}>

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
      <Stack.Screen name="Dress" component={Dress} />
      <Stack.Screen name="DetailClothes" component={DetailClothes} />
      <Stack.Screen name="Thongtincoban" component={Thongtincoban} />
      <Stack.Screen name="Thongtinvedamcuoi" component={Thongtinvedamcuoi} />
      <Stack.Screen name="Dichvucanthiet" component={Dichvucanthiet} />
      <Stack.Screen name="Sothichvauutien" component={Sothichvauutien} />
      <Stack.Screen name="Ghichuvaykien" component={Ghichuvaykien} />
      <Stack.Screen name="EditProfile" component={EditProfile} />


    </Stack.Navigator>
    
  )
}
// END: Stack dành cho user đã đăng nhập

export { StackNavigation, GuestStackNavigation }