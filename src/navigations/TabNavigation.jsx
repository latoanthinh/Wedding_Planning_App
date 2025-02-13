
import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';




import Shopping from '../tabscreens/Shopping';
import Favorites from '../tabscreens/Favorites';
import Settings from '../tabscreens/Settings';
import ScreenHom from '../tabscreens/ScreenHom';


const Tab = createBottomTabNavigator();

const TabNavigation = () => {
  return (
   
    <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused
            ? 'home'
            : 'home';
        } else if (route.name === 'Shopping') {
          iconName = focused ? 'mail-outline' : 'mail-outline';
        } else if (route.name === 'Favorites') {
          iconName = focused ? 'heart-outline' : 'heart-outline';
        } else if (route.name === 'Setting') {
          iconName = focused ? 'person-outline' : 'person-outline';

          
        }


        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: 'tomato',
      tabBarInactiveTintColor: 'black',
      tabBarInactiveTintColor: 'gray', // Màu của icon khi không được chọn
      tabBarStyle: {
        backgroundColor: 'white', // Màu nền của Tab Navigation
      },
      tabBarShowLabel: false,
      
    })} >
      <Tab.Screen name="Home" component={ScreenHom} options={{
        headerShown: false,
      }} />
      <Tab.Screen name="Shopping" component={Shopping} options={{
        headerShown: false,
      }} />
      <Tab.Screen name="Favorites" component={Favorites} options={{
        headerShown: false,
      }} />
      <Tab.Screen name="Setting" component={Settings} options={{
        headerShown: false,
      }} />
    </Tab.Navigator>
   
  )
}

export default TabNavigation;

const styles = StyleSheet.create({
  container: {
    flex: 1,

  }
})