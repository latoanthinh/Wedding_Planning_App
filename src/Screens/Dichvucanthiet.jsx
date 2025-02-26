// import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
// import React, { useState } from 'react'

// const Dichvucanthiet = (props) => {
//     const {navigation} = props;
//     const [selectedValue, setSelectedValue] = useState('Nhạc sống'); // Lưu giá trị chọn
//     const [selectedValue1, setSelectedValue1] = useState('Có'); // Lưu giá trị chọn

//     const options = ['Nhạc sống', 'Chụp Hình', 'Trang Trí', 'Thực Đơn', 'Khác']; // Các lựa chọn
//     const options1 = ['Có', 'Không']; // Các lựa chọn
//     return (
//         <View style={styles.container}>
//             <Text style={styles.Dichvucanthiet}>Dịch Vụ Cần Thiết</Text>

//             <View style={styles.box}>
//                 <Text style={styles.text}>Bạn đã lên kế hoạch cho những dịch vụ nào chưa? (Chọn tất cả những gì áp dụng)
//                 </Text>
//             </View>
//             <View style={{ marginTop: 10 }} >

//                 {options.map((option) => (
//                     <TouchableOpacity
//                         key={option}
//                         style={styles.option}
//                         onPress={() => setSelectedValue(option)} // Cập nhật giá trị khi chọn
//                     >
//                         <View
//                             style={[
//                                 styles.radioButton,
//                                 selectedValue === option && styles.selectedRadioButton, // Đổi màu khi chọn
//                             ]}
//                         />
//                         <Text
//                             style={[
//                                 styles.text,
//                                 selectedValue === option && styles.selectedText, // Đổi màu chữ khi chọn
//                             ]}
//                         >
//                             {option}
//                         </Text>
//                     </TouchableOpacity>
//                 ))}
//             </View>
//             <View style={styles.box}>
//                 <Text style={styles.text}>Bạn có cần tư vấn về dịch vụ nào không?
//                 </Text>
//             </View>
//             <View style={styles.selectyes} >

//                 {options1.map((option) => (
//                     <TouchableOpacity
//                         key={option}
//                         style={styles.option}
//                         onPress={() => setSelectedValue1(option)} // Cập nhật giá trị khi chọn
//                     >
//                         <View
//                             style={[
//                                 styles.radioButton,
//                                 selectedValue1 === option && styles.selectedRadioButton, // Đổi màu khi chọn
//                             ]}
//                         />
//                         <Text
//                             style={[
//                                 styles.text,
//                                 selectedValue1 === option && styles.selectedText, // Đổi màu chữ khi chọn
//                             ]}
//                         >
//                             {option}
//                         </Text>
//                     </TouchableOpacity>
//                 ))}
//             </View>

//             <View style={styles.Tou}>

//                 <TouchableOpacity style={styles.touGui}>
//                     <Text style={{ color: "white" }}>Gửi</Text>
//                 </TouchableOpacity>

//                 <TouchableOpacity style={styles.touTiep} onPress={() => navigation.navigate('Sothichvauutien')}>
//                     <Text style={{ color: "white" }}>Tiếp Theo</Text>
//                 </TouchableOpacity>

//             </View>


//         </View>
//     )
// }

// export default Dichvucanthiet

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
//     selectyes: {
//         marginTop: 10,
//         flexDirection: 'row',
//         justifyContent: 'space-evenly', // Căn giữa và phân phối đều các lựa chọn
//         alignItems: 'center',
//         flexWrap: 'wrap', // Đảm bảo các phần tử không bị tràn ra ngoài màn hình
        

//     },

//     option: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 10,
//         width: 320,

//     },
//     radioButton: {
//         width: 20,
//         height: 20,
//         borderRadius: 10,
//         borderWidth: 0.1,
//         borderColor: '#000',
//         marginRight: 10,
//         shadowColor: '#000', // Màu bóng đổ
//         shadowOffset: { width: 2, height: 2 }, // Khoảng cách bóng
//         shadowOpacity: 0.1, // Độ mờ của bóng
//         shadowRadius: 0.1, // Độ lan tỏa của bóng
//         elevation: 15, // Android: độ cao bóng
        

//     },
//     selectedRadioButton: {
//         backgroundColor: '#000',
        
//     },
//     text: {
//         fontSize: 16,
//         color: '#000',
//     },
//     selectedText: {
//         color: '#000', // Hoặc màu nào bạn muốn khi được chọn
//     },

//     box: {
//         width: 320,
//         height: 130,
//         borderWidth: 2,
//         borderColor: 'black',
//         padding: 16,
//         borderRadius: 8, // Tùy chọn để góc bo tròn
//         marginTop: 30,
//         justifyContent: "center",
//         alignItems: 'center',

//     },
//     text: {
//         fontSize: 15,
//         color: 'black',
//         fontWeight: 600
//     },
//     Dichvucanthiet: {
//         fontSize: 20,
//         fontWeight: "bold"


//     },
//     container: {
//         alignItems: "center",
//         padding: 20,
//         backgroundColor: "#FAFAFA",
//         flex:1

//     }
// })