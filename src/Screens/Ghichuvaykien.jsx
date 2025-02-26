// import { StyleSheet, Text, View,TextInput, TouchableOpacity } from 'react-native'
// import React from 'react'

// const Ghichuvaykien = (props) => {
//     const {navigation} = props;
//   return (
//     <View style={styles.container}>
//       <Text style={styles.Ghichuvaykien}>Ghi chú & ý kiến</Text>

//       <View style={styles.box}>
//               <Text style={styles.text}>Bạn có ý tưởng nào đặc biệt cho đám cưới không?
//               </Text>
//             </View>
//             <TextInput
//                     style={styles.input}
//                     placeholder="Ghi chú ở đây...." // Hint xuất hiện trong ô TextInput
//                     placeholderTextColor="#888" // Màu của hint
//                   />
//                   <View style={styles.box}>
//               <Text style={styles.text}>Bạn có bất kỳ câu hỏi hoặc mối quan tâm nào không?
//               </Text>
//             </View>
//             <TextInput
//                     style={styles.input}
//                     placeholder="Ghi chú ở đây...." // Hint xuất hiện trong ô TextInput
//                     placeholderTextColor="#888" // Màu của hint
//                   />
//                   <View style={styles.box}>
//               <Text style={styles.text}>Email hoặc số điện thoại để nhận thông tin thêm?
//               </Text>
//             </View>
//             <TextInput
//                     style={styles.input}
//                     placeholder="Nhập ở đây...." // Hint xuất hiện trong ô TextInput
//                     placeholderTextColor="#888" // Màu của hint
//                   />

//                   <View style={styles.Tou}>
                  
//                         <TouchableOpacity style={styles.touGui}>
//                           <Text style={{color:"white"}}>Gửi</Text>
//                         </TouchableOpacity>
                        
//                         <TouchableOpacity style={styles.touTiep}  onPress={() => navigation.navigate('TabNavigation')}>
//                           <Text style={{color:"white"}}>Tiếp Theo</Text>
//                         </TouchableOpacity>
                  
//                         </View>
//     </View>
//   )
// }

// export default Ghichuvaykien

// const styles = StyleSheet.create({
//     touTiep:{
//         width:100,
//         height:40,
//         backgroundColor:"#000000",
//         borderRadius: 8,
//         justifyContent:"center",
//         alignItems:"center"
//     },
//     touGui:{
//         width:100,
//         height:40,
//         backgroundColor:"#CECBCB",
//         borderRadius: 8,
//         justifyContent:"center",
//         alignItems:"center"
//     },

//     Tou:{
//         width:320,
//         height:50,
//         marginTop:20,
//         flexDirection:"row",
//         justifyContent:"space-between"
        
        

//     },
//     input: {
//         width: 320,
//         height: 50,
//         borderRadius: 8,
//         paddingHorizontal: 10,
//         fontSize: 16,
//         backgroundColor: '#FFFFFF',
//         marginTop:20
//       },
//     box: {
//         width:320,
//         height:130,
//         borderWidth: 2,
//         borderColor: 'black',
//         padding: 16,
//         borderRadius: 8, // Tùy chọn để góc bo tròn
//         marginTop:30,
//         justifyContent:"center",
//         alignItems: 'center',

//       },
//       text: {
//         fontSize: 15,
//         color: 'black',
//         fontWeight:600
//       },
//     Ghichuvaykien:{
//         fontSize: 20,
//         fontWeight:"bold"


//     },
//     container:{
//         alignItems:"center",
//         padding:20,
//         backgroundColor:"#FAFAFA",
//         flex:1

//     }
// })