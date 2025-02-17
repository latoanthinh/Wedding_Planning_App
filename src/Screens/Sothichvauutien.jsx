import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

const Sothichvauutien = (props) => {

    const { navigation } = props;
    const [selectedValue, setSelectedValue] = useState('Cổ Điển'); // Lưu giá trị chọn
    const [selectedValue1, setSelectedValue1] = useState('Địa điểm'); // Lưu giá trị chọn


    const options = ['Cổ Điển', 'Hiện đại', 'Vintage', 'Tự Nhiên']; // Các lựa chọn
    const options1 = ['Địa điểm', 'Thực đơn', 'Âm Nhạc', 'Không khí', 'Trang phục']; // Các lựa chọn
    return (
        <View style={styles.container}>
            <Text style={styles.Sothichvauutien}>Sở thích và ưu tiên</Text>

            <View style={styles.box}>
                <Text style={styles.text}>Bạn thích phong cách trang trí nào?
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
                <Text style={styles.text}>Bạn thích phong cách trang trí nào?
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

            <View style={styles.Tou}>

                <TouchableOpacity style={styles.touGui}>
                    <Text style={{ color: "white" }}>Gửi</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.touTiep} onPress={() => navigation.navigate('Ghichuvaykien')}>
                    <Text style={{ color: "white" }}>Tiếp Theo</Text>
                </TouchableOpacity>

            </View>
        </View>
    )
}

export default Sothichvauutien

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
    Sothichvauutien: {
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