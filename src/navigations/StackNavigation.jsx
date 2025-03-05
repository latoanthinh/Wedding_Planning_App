import React from 'react'

import Intro from '../Screens/Intro'
import SignIn from '../Screens/SignIn'
import SignUp from '../Screens/SignUp'
import Welcome from '../Screens/Welcome'
import EditProfile from '../Screens/EditProfile'
import Thongtincoban from '../Screens/Thongtincoban'
import DetailClothes from '../Screens/DetailClothes'
import Dress from '../Screens/Dress'
import FlowersScreen from '../Screens/FlowersScreen'
import DetailFlowers from '../Screens/DetailFlowers'
import GenPlan from '../Screens/GenPlan'
import HallWeddings from '../Screens/HallWeddings'
import AllPlan from '../Screens/AllPlan'
import InvitationsScreen from '../Screens/InvitationsScreen'
import ComboDetail from '../Screens/ComboDetail'
import AllLobyy from '../Screens/AllLobyy'
import DiaDienCreen from '../Screens/DiaDienCreen'

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
// sk-1dbacd7358dc4f65a5ee8cb0f31afb38

// START: Stack dành cho user đã đăng nhập
import TabNavigation from './TabNavigation'

const Stack = createNativeStackNavigator();
const StackNavigation = () => {
  return (
   
    <Stack.Navigator screenOptions={{ headerShown: false}}>


      <Stack.Screen name="TabNavigation" component={TabNavigation} />
      <Stack.Screen name="Dress" component={Dress} />
      <Stack.Screen name="DetailClothes" component={DetailClothes} />
      <Stack.Screen name="FlowersScreen" component={FlowersScreen} />
      <Stack.Screen name="DetailFlowers" component={DetailFlowers} />
      <Stack.Screen name="Thongtincoban" component={Thongtincoban} />
      <Stack.Screen name="GenPlan" component={GenPlan} />
      <Stack.Screen name="HallWeddings" component={HallWeddings} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="AllPlan" component={AllPlan} />
      <Stack.Screen name="InvitationsScreen" component={InvitationsScreen} />
      <Stack.Screen name="ComboDetail" component={ComboDetail} />
      <Stack.Screen name="AllLobyy" component={AllLobyy} />
      <Stack.Screen name="DiaDienCreen" component={DiaDienCreen} />


    </Stack.Navigator>
    
  )
}
// END: Stack dành cho user đã đăng nhập

export { StackNavigation, GuestStackNavigation }