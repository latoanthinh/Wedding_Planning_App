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
          placeholder="Tên"
          placeholderTextColor="#999"
          value={name}
          onChangeText={(text) => setName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Ghi chú"
          placeholderTextColor="#999"
          value={note}
          onChangeText={(text) => setNote(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Địa chỉ"
          placeholderTextColor="#999"
          value={address}
          onChangeText={(text) => setAddress(text)}
        />

        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Lưu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 10,
  },
  backIcon: {
    width: 19,
    height: 14,
    tintColor: '#333',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 30,
  },
  profileContainer: {
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cameraIcon: {
    width: 18,
    height: 18,
    tintColor: '#333',
  },
  formContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  input: {
    width: '90%',
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingHorizontal: 10,
    marginBottom: 25,
    fontSize: 16,
    color: '#333',
  },
  editButton: {
    width: '80%',
    backgroundColor: '#333',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
