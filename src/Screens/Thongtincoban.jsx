import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList} from 'react-native'
import React,{useState} from 'react'

const Thongtincoban = (props) => {
    const {navigation} = props;

    




   
    
  return (
    <View style={styles.container}>
      <Text style={styles.thongtincoban}>Thông Tin Cơ Bản</Text>

      <View style={styles.box}>
        <Text style={styles.text}>Bạn Tên Gì?
        </Text>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Tên của bạn" // Hint xuất hiện trong ô TextInput
        placeholderTextColor="#888" // Màu của hint
      />

        <View style={styles.box}>
        <Text style={styles.text}>Ngày dự định tổ chức đám cưới?
        </Text>
      </View>

      <View style={styles.Tou}>

      <TouchableOpacity style={styles.touGui}>
        <Text style={{color:"white"}}>Gửi</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.touTiep}  onPress={() => navigation.navigate('Thongtinvedamcuoi')}>
        <Text style={{color:"white"}}>Tiếp Theo</Text>
      </TouchableOpacity>

      </View>

      
    </View>
  )
}

export default Thongtincoban

const styles = StyleSheet.create({
   
    touTiep:{
        width:100,
        height:40,
        backgroundColor:"#000000",
        borderRadius: 8,
        justifyContent:"center",
        alignItems:"center"
    },
    touGui:{
        width:100,
        height:40,
        backgroundColor:"#CECBCB",
        borderRadius: 8,
        justifyContent:"center",
        alignItems:"center"
    },

    Tou:{
        width:320,
        height:50,
        marginTop:20,
        flexDirection:"row",
        justifyContent:"space-between"
        
        

    },
    input: {
        width: 320,
        height: 50,
        borderRadius: 8,
        paddingHorizontal: 10,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
        marginTop:50
      },
    box: {
        width:320,
        height:130,
        borderWidth: 2,
        borderColor: 'black',
        padding: 16,
        borderRadius: 8, // Tùy chọn để góc bo tròn
        marginTop:30,
        justifyContent:"center",
        alignItems: 'center',

      },
      text: {
        fontSize: 15,
        color: 'black',
        fontWeight:600
      },

    thongtincoban:{
        fontSize: 20,
        fontWeight:"bold"


    },
    container:{
        alignItems:"center",
        padding:20,
        backgroundColor:"#FAFAFA",
        flex:1

    }



})