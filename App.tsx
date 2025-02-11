import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import SignIn_Page from './src/Screens/SignIn';
import Intro from './src/Screens/Intro';

function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Intro/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    
  }
});

export default App; 