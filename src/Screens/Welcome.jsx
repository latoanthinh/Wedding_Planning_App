
import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'

const Wellcome = () => {
  return (
    <View style={styles.container}>
      <View style={styles.lineImageLeft}>
        <Image source={require('../Assets/Images/Line_wellcome2.jpg')} style={styles.lineImage} />
      </View>
      <Image source={require('../Assets/Images/LogoWedding.jpg')} style={styles.image} />
      <Text style={styles.title}>Wedding Planning</Text>
      <Text style={styles.subtitle}>"Simplify your planning experience"</Text>
      <View style={styles.lineImageRight}>
        <Image source={require('../Assets/Images/Line_wellcome.png')} style={styles.lineImage} />
      </View>
    </View>
  )
  }
  export default Wellcome

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
    },
    image: {
      width: 123,
      height: 75,
      marginBottom: 20,
    },
    title: {
      textAlign: 'center',
      fontSize: 40,
    },
    subtitle: {
      textAlign: 'center',
      fontSize: 16,
      color: 'gray',
    },
    lineImage: {
      width: 260,
      height: 260,
    },
    lineImageLeft: {
      position: 'absolute',
      bottom: 500,
      left: 100,
    },
    
    lineImageRight: {
        position: 'absolute',
        top: 500,
        right: 100,
    },
  });
