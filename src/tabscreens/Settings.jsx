import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { useState,useContext } from 'react'
import { AppContext } from '../AppContext';

const Settings = (props) => {
  const {navigation } = props;

  const handle = (screenName) =>{
    navigation.navigate(screenName)
  }
  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
        <Image source={require('../Assets/Images/Sort.png')} />
        <Text style={{ fontSize: 24 }}>Profile</Text>
        <View style={{ flexDirection: 'row' }}>
          <Image source={require('../Assets/Images/home48.png')} style={{ width: 24, height: 24 }} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 30 }}>
        <Image source={require('../Assets/Images/mask.png')} style={{ borderRadius: 55 }} />
        <View style={{ marginStart: 30 }}>
          <Text style={{ fontSize: 24, marginTop: 10 }}>Your Name</Text>
          <Text style={{ fontSize: 14, marginTop: 5, color: 'gray' }}>Your Mail</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handle('EditProfile')} style={styles.signInButton}>
        <Text style={styles.signInButtonText}>Edit Profile</Text>
      </TouchableOpacity>
      <View style={{ borderBottomWidth: 2, borderColor: 'gray', width: '100%' }}></View>

      <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('../Assets/Images/Users.png')} style={{ marginRight: 20, width: 25, height: 25 }} />
          <Text style={{ fontSize: 18 }}>Account type</Text>
        </View>
        <Image source={require('../Assets/Images/Next.png')} style={{ width: 25, height: 25 }} />
      </View>

      <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('../Assets/Images/addfolder.png')} style={{ marginRight: 20, width: 25, height: 25 }} />
          <Text style={{ fontSize: 18 }}>Add budget limit</Text>
        </View>
        <Image source={require('../Assets/Images/Next.png')} style={{ width: 25, height: 25 }} />
      </View>

      <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('../Assets/Images/setting.png')} style={{ marginRight: 20, width: 25, height: 25 }} />
          <Text style={{ fontSize: 18 }}>Setting</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('../Assets/Images/question.png')} style={{ marginRight: 20, width: 25, height: 25 }} />
          <Text style={{ fontSize: 18 }}>Help & Feedback</Text>
        </View>
      </View>
    </View>
  )
}

export default Settings

const styles = StyleSheet.create({
  signInButton: {
    backgroundColor: '#deeefe',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 20
  },
  signInButtonText: {
    color: '#001cff',
    textAlign: 'center',
    fontSize: 16,
  },
})