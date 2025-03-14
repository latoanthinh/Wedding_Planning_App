import React from 'react'

import SignIn from '../Screens/SignIn'
import SignUp from '../Screens/SignUp'
import EditProfile from '../Screens/EditProfile'
import Thongtincoban from '../Screens/Thongtincoban'
import DetailClothes from '../Screens/DetailClothes'
import Dress from '../Screens/Dress'
import FlowersScreen from '../Screens/FlowersScreen'
import DetailFlowers from '../Screens/DetailFlowers'
import GenPlan from '../Screens/GenPlan'
import HallWeddings from '../Screens/HallWeddings'
import AllPlan from '../Screens/AllPlan'
import Gift_Screen from '../Screens/Gift_Screen'
import ComboDetail from '../Screens/ComboDetail'
import AllLobyy from '../Screens/AllLobyy'
import DiaDiem_Screen from '../Screens/DiaDiem_Screen'
import TransitionLoading from '../transitions/Loading'
import FoodDetail from '../Screens/FoodDetail'

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
      <Stack.Screen name="Gift_Screen" component={Gift_Screen} />
      <Stack.Screen name="ComboDetail" component={ComboDetail} />
      <Stack.Screen name="AllLobyy" component={AllLobyy} />
      <Stack.Screen name="DiaDiem_Screen" component={DiaDiem_Screen} />
      <Stack.Screen name="TransitionLoading" component={TransitionLoading} />
      <Stack.Screen name="FoodDetail" component={FoodDetail} />

    </Stack.Navigator>
    
  )
}
// END: Stack dành cho user đã đăng nhập

export { StackNavigation, GuestStackNavigation }