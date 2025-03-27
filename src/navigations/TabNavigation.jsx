import { StyleSheet, View, Text } from 'react-native';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Animated } from 'react-native';
import { useSelector } from 'react-redux';

import Favorites from '../tabscreens/Favorites';
import Settings from '../tabscreens/Settings';
import Home from '../tabscreens/Home';
import Message from '../tabscreens/Message';

const Tab = createBottomTabNavigator();

// Thành phần hiển thị số lượng tin nhắn chưa đọc
const ChatBadge = ({ unreadCount }) => {
  if (unreadCount <= 0) return null;
  
  return (
    <View style={styles.badgeContainer}>
      <Text style={styles.badgeText}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </Text>
    </View>
  );
};

const TabNavigation = () => {
  const tabBarColor = new Animated.Value(0);
  // Lấy số lượng tin nhắn chưa đọc từ Redux store
  const { unreadCount } = useSelector((state) => state.chat);

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
      <Tab.Screen 
        name="Message" 
        component={Message} 
        options={{ 
          headerShown: false, 
          tabBarLabel: 'Tin nhắn',
          tabBarBadge: unreadCount > 0 ? unreadCount : null,
          tabBarBadgeStyle: {
            backgroundColor: '#FF3B30',
            color: '#FFFFFF',
            fontFamily: 'Playfair_me',
          }
        }} 
      />
      <Tab.Screen name="Favorites" component={Favorites} options={{ headerShown: false, tabBarLabel: 'Yêu thích' }} />
      <Tab.Screen name="Setting" component={Settings} options={{ headerShown: false, tabBarLabel: 'Cài đặt' }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Playfair_me',
  },
});

export default TabNavigation;

