import React, { useRef, useEffect, useState, useContext } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Animated, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar,
  Dimensions,
  ActivityIndicator,
  ToastAndroid 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { ChitietPlan, resetChitietPlan } from '../redux/ChitietPlanSlice';



const DetailPlan = (props) => {

  const { navigation, route } = props;
  const { DetailPlanId } = route?.params || {};
  const dispatch = useDispatch();
  const { ChitietPlanData, ChitietPlanStatus, error } = useSelector(state => state.chitietplan);


  

  return (
    <SafeAreaView>
      <Text>DetailPlan</Text>
    </SafeAreaView>
  )
}

export default DetailPlan

const styles = StyleSheet.create({})