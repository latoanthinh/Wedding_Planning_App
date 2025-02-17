import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'



const Thongtinvedamcuoi = (props) => {

    const { navigation } = props;
    const [selectedValue, setSelectedValue] = useState('Truyền thống'); // Lưu giá trị chọn
    const [selectedValue1, setSelectedValue1] = useState('Dưới 50'); // Lưu giá trị chọn
    const [selectedValue2, setSelectedValue2] = useState('Dưới 50 Triệu'); // Lưu giá trị chọn

    const options = ['Truyền thống', 'Hiện đại', 'Ngoài trời', 'Khác']; // Các lựa chọn
    const options1 = ['Dưới 50', '50-100', '100-200', 'Trên 200']; // Các lựa chọn
    const options2 = ['Dưới 50 Triệu', '50-100 Triệu', '100-200 Triệu', 'Trên 200 Triệu']; // Các lựa chọn


    return (

        <ScrollView>
            <View style={styles.container}>
                <Text style={styles.thongtinvedamcuoi}>Thông Tin Về Đám Cưới</Text>

                <View style={styles.box}>
                    <Text style={styles.text}>Loại hình đám cưới bạn dự định tổ chức?
                    </Text>
                </View>

                <View style={{ marginTop: 10 }} >

                    {options.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={styles.option}
                            onPress={() => setSelectedValue(option)} // Cập nhật giá trị khi chọn
                        >
                            <View
                                style={[
                                    styles.radioButton,
                                    selectedValue === option && styles.selectedRadioButton, // Đổi màu khi chọn
                                ]}
                            />
                            <Text
                                style={[
                                    styles.text,
                                    selectedValue === option && styles.selectedText, // Đổi màu chữ khi chọn
                                ]}
                            >
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.box}>
                    <Text style={styles.text}>Số lượng khách mời dự kiến?
                    </Text>
                </View>

                <View style={{ marginTop: 10 }} >

                    {options1.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={styles.option}
                            onPress={() => setSelectedValue1(option)} // Cập nhật giá trị khi chọn
                        >
                            <View
                                style={[
                                    styles.radioButton,
                                    selectedValue1 === option && styles.selectedRadioButton, // Đổi màu khi chọn
                                ]}
                            />
                            <Text
                                style={[
                                    styles.text,
                                    selectedValue1 === option && styles.selectedText, // Đổi màu chữ khi chọn
                                ]}
                            >
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.box}>
                    <Text style={styles.text}>Ngân sách dự kiến cho đám cưới?
                    </Text>
                </View>
                <View style={{ marginTop: 10 }} >

                    {options2.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={styles.option}
                            onPress={() => setSelectedValue2(option)} // Cập nhật giá trị khi chọn
                        >
                            <View
                                style={[
                                    styles.radioButton,
                                    selectedValue2 === option && styles.selectedRadioButton, // Đổi màu khi chọn
                                ]}
                            />
                            <Text
                                style={[
                                    styles.text,
                                    selectedValue2 === option && styles.selectedText, // Đổi màu chữ khi chọn
                                ]}
                            >
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.Tou}>

                    <TouchableOpacity style={styles.touGui}>
                        <Text style={{ color: "white" }}>Gửi</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.touTiep} onPress={() => navigation.navigate('Dichvucanthiet')}>
                        <Text style={{ color: "white" }}>Tiếp Theo</Text>
                    </TouchableOpacity>

                </View>




            </View>
        </ScrollView>
    )
}

export default Thongtinvedamcuoi

const styles = StyleSheet.create({
    touTiep: {
        width: 100,
        height: 40,
        backgroundColor: "#000000",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center"
    },
    touGui: {
        width: 100,
        height: 40,
        backgroundColor: "#CECBCB",
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center"
    },

    Tou: {
        width: 320,
        height: 50,
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "space-between"



    },

    option: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        width: 320,

    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#000',
        marginRight: 10,

    },
    selectedRadioButton: {
        backgroundColor: '#000',
    },
    text: {
        fontSize: 16,
        color: '#000',
    },
    selectedText: {
        color: '#000', // Hoặc màu nào bạn muốn khi được chọn
    },


    box: {
        width: 320,
        height: 130,
        borderWidth: 2,
        borderColor: 'black',
        padding: 16,
        borderRadius: 8, // Tùy chọn để góc bo tròn
        marginTop: 30,
        justifyContent: "center",
        alignItems: 'center',

    },
    text: {
        fontSize: 15,
        color: 'black',
        fontWeight: 600
    },

    thongtinvedamcuoi: {
        fontSize: 20,
        fontWeight: "bold"


    },
    container: {
        alignItems: "center",
        padding: 20,
        backgroundColor: "#FAFAFA",
        flex:1

    }
})