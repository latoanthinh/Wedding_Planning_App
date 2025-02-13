import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

const EditProfile = (props) => {
  const {navigation} = props;
  const [text, setText] = useState('');

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image source={require('../Assets/Images/back.png')} />
        </TouchableOpacity>
        <Text style={{ fontSize: 24 }}>Edit Profile</Text>
        <View style={{ flexDirection: 'row' }}>
          <Image source={require('../Assets/Images/home48.png')} style={{ width: 0, height: 0 }} />
        </View>
      </View>
      <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
        <Image source={require('../Assets/Images/mask.png')} style={{ borderRadius: 55 }} />
        <View style={{ width: 28, height: 26, backgroundColor: '#0b0b0b', justifyContent: 'center', alignItems: 'center', borderRadius: 4, position: 'absolute', top: 85 }}>
          <Image source={require('../Assets/Images/camera24.png')} style={{ width: 18, height: 18 }} />
        </View>
      </View>
      <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
        <TextInput
          style={{
            width: '90%',
            height: 50,
            borderColor: 'gray',
            borderBottomWidth: 1,
            paddingLeft: 10,
            marginBottom: 20,
          }}
          placeholder='Name'
          value={text}
          onChangeText={(newText) => setText(newText)} />

        <TextInput
          style={{
            width: '90%',
            height: 50,
            borderColor: 'gray',
            borderBottomWidth: 1,
            paddingLeft: 10,
            marginBottom: 20,
          }}
          placeholder='Note'
          value={text}
          onChangeText={(newText) => setText(newText)} />

        <TextInput
          style={{
            width: '90%',
            height: 50,
            borderColor: 'gray',
            borderBottomWidth: 1,
            paddingLeft: 10,
            marginBottom: 20,
          }}
          placeholder='Address'
          value={text}
          onChangeText={(newText) => setText(newText)} />

        <TouchableOpacity style={styles.signInButton}>
          <Text style={styles.signInButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>



    </View>
  )
}

export default EditProfile

const styles = StyleSheet.create({
  signInButton: {
    width: '80%',
    backgroundColor: '#000000',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 170,
    justifyContent: 'center',
    alignItems: 'center'
  },
  signInButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 25,
  },
})