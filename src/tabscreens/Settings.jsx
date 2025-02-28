import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React, { useState ,useContext} from 'react';
import { languages } from '../Assets/languages';
import {AppContext} from '../AppContext';



const Settings = (props) => {
  const { navigation } = props;
  const [language, setLanguage] = useState('en');
  const {user} = useContext(AppContext);

  const handle = (screenName) => {
    navigation.navigate(screenName);
  };

  const t = (key) => languages[language][key];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../Assets/Images/Sort.png')} style={styles.headerIcon} />
        <Text style={styles.headerTitle}>{t('profile')}</Text>
        <View style={styles.headerRight}>
          <Image source={require('../Assets/Images/home48.png')} style={styles.headerIcon} />
        </View>
      </View>

      {/* Profile Info */}
      <View style={styles.profileContainer}>
        <Image source={require('../Assets/Images/mask.png')} style={styles.profileImage} />
        <View style={styles.profileTextContainer}>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>
      </View>

      {/* Edit Profile Button */}
      <TouchableOpacity onPress={() => handle('EditProfile')} style={styles.editProfileButton}>
        <Text style={styles.editProfileButtonText}>{t('editProfile')}</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Options */}
      <View style={styles.optionRow}>
        <View style={styles.optionLeft}>
          <Image source={require('../Assets/Images/Users.png')} style={styles.optionIcon} />
          <Text style={styles.optionText}>{t('accountType')}</Text>
        </View>
        <Image source={require('../Assets/Images/Next.png')} style={styles.nextIcon} />
      </View>

      <View style={styles.optionRow}>
        <View style={styles.optionLeft}>
          <Image source={require('../Assets/Images/addfolder.png')} style={styles.optionIcon} />
          <Text style={styles.optionText}>{t('addBudgetLimit')}</Text>
        </View>
        <Image source={require('../Assets/Images/Next.png')} style={styles.nextIcon} />
      </View>
      <View style={styles.optionRow}>
        <View style={styles.optionLeft}>
          <Image source={require('../Assets/Images/addfolder.png')} style={styles.optionIcon} />
          <Text style={styles.optionText}>{t('plan')}</Text>
        </View>
        <TouchableOpacity onPress={()=> navigation.navigate("AllPlan")}>
        <Image source={require('../Assets/Images/Next.png')} style={styles.nextIcon} />
        </TouchableOpacity>
       
      </View>

      <View style={styles.optionRow}>
        <View style={styles.optionLeft}>
          <Image source={require('../Assets/Images/setting.png')} style={styles.optionIcon} />
          <Text style={styles.optionText}>{t('settings')}</Text>
        </View>
      </View>

      <View style={styles.optionRow}>
        <View style={styles.optionLeft}>
          <Image source={require('../Assets/Images/question.png')} style={styles.optionIcon} />
          <Text style={styles.optionText}>{t('helpFeedback')}</Text>
        </View>
      </View>

      {/* Language Switch */}
      <TouchableOpacity onPress={() => setLanguage(language === 'en' ? 'vi' : 'en')} style={styles.languageButton}>
        <Text style={styles.languageButtonText}>
          {language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang tiếng Anh'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  headerRight: {
    flexDirection: 'row'
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40
  },
  profileTextContainer: {
    marginLeft: 30
  },
  profileName: {
    fontSize: 24,
    marginTop: 10,
    color: '#333'
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 5,
    color: 'gray'
  },
  editProfileButton: {
    backgroundColor: '#deeefe',
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 20
  },
  editProfileButtonText: {
    color: '#001cff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold'
  },
  divider: {
    borderBottomWidth: 2,
    borderColor: 'gray',
    marginVertical: 10
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  optionIcon: {
    width: 25,
    height: 25,
    marginRight: 20,
    resizeMode: 'contain'
  },
  optionText: {
    fontSize: 18,
    color: '#333'
  },
  nextIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain'
  },
  languageButton: {
    marginTop: 20,
    paddingLeft: 45
  },
  languageButtonText: {
    fontSize: 18,
    color: '#001cff'
  }
});
