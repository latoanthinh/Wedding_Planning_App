import { StyleSheet } from 'react-native';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Animated } from 'react-native';

import Favorites from '../tabscreens/Favorites';
import Settings from '../tabscreens/Settings';
import Home from '../tabscreens/Home';
import Message from '../tabscreens/Message';

const Tab = createBottomTabNavigator();

const TabNavigation = () => {
  const tabBarColor = new Animated.Value(0);

  const colorInterpolation = tabBarColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['white', 'tomato'],
  });

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home';
          } else if (route.name === 'Message') {
            iconName = focused ? 'mail' : 'mail-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Setting') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          left: 10,
          right: 10,
          height: 65,
          paddingVertical: 10,
          paddingHorizontal: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 0,
          fontFamily:'Playfair_me',
        },
        tabBarShowLabel: true,
      })}>
      <Tab.Screen name="Home" component={Home} options={{ headerShown: false, tabBarLabel: 'Trang chủ' }} />
      <Tab.Screen name="Message" component={Message} options={{ headerShown: false, tabBarLabel: 'Tin nhắn' }} />
      <Tab.Screen name="Favorites" component={Favorites} options={{ headerShown: false, tabBarLabel: 'Yêu thích' }} />
      <Tab.Screen name="Setting" component={Settings} options={{ headerShown: false, tabBarLabel: 'Cài đặt' }} />
    </Tab.Navigator>
  );
};

export default TabNavigation;

