import { StyleSheet,FlatList, Image, Dimensions, Text, View ,Animated,TouchableOpacity,alert } from 'react-native'
import React, { useRef, useState } from 'react'


const { width} = Dimensions.get("window");


const slides = [
    {
        image: require("../Assets/Images/intro1.png"),
        description: "Start your journey to a magical wedding experience",
        buttonText: "Begin now",
        onPress: () => alert("Bạn đã nhấn nút 1"),
    },
    {
        image: require("../Assets/Images/intro2.png"),
        description: "Discover the beauty that awaits on your special day.",
        buttonText: "Explore Styles",
        onPress: () => alert("Bạn đã nhấn nút 2"),
    },
    {
        image: require("../Assets/Images/intro3.png"),
        description: "Let us help you design the perfect wedding atmosphere.",
        buttonText: "Join Us Today",
        onPress: () => alert("Bạn đã nhấn nút 3"),
    },
];

const Intro = () => {

     

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
  return (
    <View style={styles.container}>
            {/* FlatList hiển thị ảnh */}
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
                            <TouchableOpacity style={styles.button} onPress={item.onPress}>
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