import { StyleSheet,FlatList, Image, Dimensions, Text, View ,Animated,TouchableOpacity } from 'react-native'
import React, { useRef, useState } from 'react'
import { useNavigation } from '@react-navigation/native'


const { width} = Dimensions.get("window");


const slides = [
    {
        image: require("../Assets/Images/intro1.png"),
        description: "Bắt đầu hành trình đến trải nghiệm đám cưới kỳ diệu",
        buttonText: "Tiếp theo",
    },
    {
        image: require("../Assets/Images/intro2.png"),
        description: "Khám phá vẻ đẹp đang chờ đón bạn trong ngày đặc biệt.",
        buttonText: "Tiếp theo",
    },
    {
        image: require("../Assets/Images/intro3.png"),
        description: "Hãy để chúng tôi giúp bạn thiết kế không gian đám cưới hoàn hảo.",
        buttonText: "Đến đăng nhập",
    },
];

const Intro = () => {
    const navigation = useNavigation();
    const flatListRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: false }
    );

    const updateIndex = (event) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    const handleButtonPress = () => {
        if (currentIndex < slides.length - 1) {
            // Go to next slide
            flatListRef.current.scrollToIndex({ index: currentIndex + 1, animated: true });
        } else {
            // Go to login screen on last slide
            navigation.navigate('SignIn');
        }
    };

  return (
    <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={slides}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                onMomentumScrollEnd={updateIndex}
                renderItem={({ item }) => (
                    <View style={styles.slide}>
                        <Image source={item.image} style={styles.image} />
                        {/* Nội dung nằm trên ảnh */}
                        <View style={styles.overlay}>
                            <Text style={styles.description}>{item.description}</Text>
                            <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
                                <Text style={styles.buttonText}>{item.buttonText}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            {/* Dots Indicator */}
            <View style={styles.indicatorContainer}>
                {slides.map((_, index) => (
                    <TouchableOpacity key={index} onPress={() => flatListRef.current.scrollToIndex({ index, animated: true })}>
                        <View style={[styles.dot, currentIndex === index && styles.activeDot]} />
                    </TouchableOpacity>
                ))}
            </View>
            
        </View>
  )
}

export default Intro

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    slide: {
        width: width,
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: width ,
        height: "100%",
        resizeMode: "cover",
    },
    overlay: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        alignItems: "center",
        // backgroundColor: "rgba(0,0,0,0.5)", // Nền mờ để chữ dễ đọc
        padding: 15,
        borderRadius: 10,
        
    },
    description: {
        fontSize: 32,
        color: "white",
        textAlign: "center",
        marginBottom: 10,
    },
    button: {
        backgroundColor:"rgba(0,0,0,0.5)",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        width:288,
        height:56,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 26,
        fontWeight: "400",
        fontFamily:"PlayfairDisplay2"
    },
    indicatorContainer: {
        position: "absolute",
        bottom: 10,
        flexDirection: "row",
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#bbb",
        marginHorizontal: 5,
    },
    activeDot: {
        backgroundColor: "#3498db",
    },
})