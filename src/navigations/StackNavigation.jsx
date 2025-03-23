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
import GiftDetail from '../Screens/GiftDetail'
import DetailPlan from '../Screens/DetailPlan'
import DecorDetail from '../Screens/DecorDetail'
import EmailOpt from '../Screens/EmailOpt'
import EditPlan from '../Screens/EditPlan'
import PanoramaView from '../Screens/PanoramaView'
import Welcome from '../Screens/Welcome'
import Intro from '../Screens/Intro'
import ChangePass from '../Screens/ChangePass'
import ForgotPassword from '../Screens/ForgotPassword'
import Blog from '../Screens/Blog'
import BlogDetail from '../Screens/BlogDetail'


import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';

// START: dành cho user chưa đăng nhập
const GuestStack = createNativeStackNavigator();
const GuestStackNavigation = () => {
  return (
    <GuestStack.Navigator screenOptions={{ headerShown: false }}>
      
      <GuestStack.Screen name="SignIn" component={SignIn} />
      <GuestStack.Screen name="EmailOpt" component={EmailOpt} />
      <GuestStack.Screen name="SignUp" component={SignUp} />
      {/* <GuestStack.Screen name="ForgotPassword" component={ForgotPassword} /> */}
      {/* <GuestStack.Screen name="Welcome" component={Welcome} />
      <GuestStack.Screen name="Intro" component={Intro} /> */}
    </GuestStack.Navigator> 
  )
}
// END: dành cho user chưa đăng nhập

// START: Stack dành cho user đã đăng nhập
import TabNavigation from './TabNavigation'

const Stack = createNativeStackNavigator();
const SharedElementStack = createSharedElementStackNavigator();

// Stack riêng cho blog với shared element transitions - tạo hiệu ứng chuyển cảnh mượt mà
const BlogStack = () => {
  return (
    <SharedElementStack.Navigator screenOptions={{ headerShown: false }}>
      <SharedElementStack.Screen name="BlogScreen" component={Blog} />
      <SharedElementStack.Screen 
        name="BlogDetailScreen" 
        component={BlogDetail} 
        sharedElements={(route) => {
          const { slug } = route.params;
          return [`blog.${slug}.image`];
        }}
        options={{
          gestureEnabled: false,
          transitionSpec: {
            open: { animation: 'timing', config: { duration: 400 } },
            close: { animation: 'timing', config: { duration: 400 } }
          },
          cardStyleInterpolator: ({ current: { progress } }) => {
            return {
              cardStyle: {
                opacity: progress
              }
            };
          }
        }}
      />
    </SharedElementStack.Navigator>
  );
};

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
      <Stack.Screen name="ChangePass" component={ChangePass} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="AllPlan" component={AllPlan} />
      <Stack.Screen name="Gift_Screen" component={Gift_Screen} />
      <Stack.Screen name="ComboDetail" component={ComboDetail} />
      <Stack.Screen name="AllLobyy" component={AllLobyy} />
      <Stack.Screen name="DiaDiem_Screen" component={DiaDiem_Screen} />
      <Stack.Screen name="TransitionLoading" component={TransitionLoading} />
      <Stack.Screen name="FoodDetail" component={FoodDetail} />
      <Stack.Screen name="GiftDetail" component={GiftDetail} />
      <Stack.Screen name="DetailPlan" component={DetailPlan} />
      <Stack.Screen name="DecorDetail" component={DecorDetail} />
      <Stack.Screen name="EditPlan" component={EditPlan} />
      <Stack.Screen name="PanoramaView" component={PanoramaView} />
      
      {/* Blog screens with SharedElement transitions */}
      <Stack.Screen name="Blog" component={Blog} />
      <Stack.Screen 
        name="BlogDetail" 
        component={BlogDetail}
        options={{
          gestureEnabled: false,
          cardStyleInterpolator: ({ current: { progress } }) => {
            return {
              cardStyle: {
                opacity: progress
              }
            };
          }
        }}
        // Enable SharedElement transitions
        sharedElements={(route) => {
          const { slug } = route.params;
          return [`blog.${slug}.image`];
        }}
      />
    </Stack.Navigator>
  )
}
// END: Stack dành cho user đã đăng nhập

export { StackNavigation, GuestStackNavigation, BlogStack }