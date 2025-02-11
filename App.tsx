import React from 'react';
import { SafeAreaView, StyleSheet, Text } from 'react-native';
import Welcome from './src/Screens/Welcome'


function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Welcome/>
    </SafeAreaView>
    //haha
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