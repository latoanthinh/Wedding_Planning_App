import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native';

const EditProfile = (props) => {
  const { navigation } = props;
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [address, setAddress] = useState('');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image source={require('../Assets/Images/back.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        {/* View để cân bằng layout */}
        <View style={styles.headerRight} />
      </View>

      {/* Profile Image */}
      <View style={styles.profileContainer}>
        <Image source={require('../Assets/Images/mask.png')} style={styles.profileImage} />
        <View style={styles.cameraIconContainer}>
          <Image source={require('../Assets/Images/camera24.png')} style={styles.cameraIcon} />
        </View>
      </View>

      {/* Form Inputs */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={(text) => setName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Note"
          value={note}
          onChangeText={(text) => setNote(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address}
          onChangeText={(text) => setAddress(text)}
        />

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 24, // Chỗ trống để cân bằng header
  },
  profileContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 28,
    height: 28,
    backgroundColor: '#0b0b0b',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    width: 18,
    height: 18,
    tintColor: '#fff',
  },
  formContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  input: {
    width: '90%',
    height: 50,
    borderBottomWidth: 1,
    borderColor: 'gray',
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  editButton: {
    width: '80%',
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
