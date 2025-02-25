import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, FlatList, ImageBackground } from 'react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChitietFlowers } from '../redux/ChitietFlowersSlice';

const DetailFlowers = ({ navigation, route }) => {

    const { productIdFlo } = route?.params;
    const dispatch = useDispatch();
    const { ChitietFlowersData, ChitietFlowersStatus, error } = useSelector(state => state.chitietflowers);



    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.canGoBack() && navigation.goBack()}>
                    <Image source={require('../Assets/Images/back.png')} style={styles.icon} />
                </TouchableOpacity>
                <Text style={styles.title}>Detail Flowers</Text>
                <TouchableOpacity onPress={() => navigation.navigate('TabNavigation')}>
                    <Image source={require('../Assets/Images/home48.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default DetailFlowers

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingTop: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
    icon: { width: 24, height: 24 },
    container: { backgroundColor: '#FFFFFF', flex: 1, alignItems: 'center', paddingHorizontal: 20 },

})