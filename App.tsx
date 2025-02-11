import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Navigate from './src/Screens/Navigate';
import Welcome from './src/Screens/Welcome'
import SignIn from './src/Screens/SignIn'
import SignUp from './src/Screens/SignUp';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();
function App() {
  return (

   
    <NavigationContainer>
      <SafeAreaView style={styles.container}>
        <Stack.Navigator initialRouteName="SignUp">
          <Stack.Screen
            name="SignIn"
            component={SignIn}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width:'100%',
    height:'100%',
    backgroundColor:'#fff'
  }
});

export default App;
