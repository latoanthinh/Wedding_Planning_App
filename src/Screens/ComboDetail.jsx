import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  Easing,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DetailCombo = ({ route, navigation }) => {
  // Get current screen dimensions
  const { width, height } = useWindowDimensions();
  const { comboData } = route.params || {};

  const defaultData = {
    name: "COMBO CLASSIC",
    price: 14999999,
    imageUrl: require("../Assets/Images/combo.png"),
    description: [
      "Trang trí tiệc cưới sang trọng",
      "Thực đơn đa dạng",
      "Dịch vụ quay phim chuyên nghiệp",
    ],
  };

  const [data, setData] = useState(comboData || defaultData);
  const [modalVisible, setModalVisible] = useState(false);
  const [guestCount, setGuestCount] = useState(100);
  const [tableCount, setTableCount] = useState(10);
  const [themeColor, setThemeColor] = useState("White & Gold");
  const [flowerStyle, setFlowerStyle] = useState("Roses & Lilies");

  // Animation value for modal
  const [animation] = useState(new Animated.Value(0));

  const formatPrice = (num) => {
    return num
      ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " VND"
      : "0đ";
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  // Modal translation based on animation value
  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const saveCustomization = () => {
    setData({
      ...data,
      description: [
        `Số khách: ${guestCount}`,
        `Số bàn: ${tableCount}`,
        `Màu chủ đề: ${themeColor}`,
        `Kiểu hoa: ${flowerStyle}`,
      ],
    });
    closeModal();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Image source={require("../Assets/Images/back.png")} style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết Combo</Text>
        <TouchableOpacity onPress={openModal} style={styles.iconButton}>
          <Image source={require("../Assets/Images/lightedit.png")} style={styles.homeIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        {/* Image container with responsive sizing */}
        <View style={[styles.imageContainer, { width: width, height: height * 0.35 }]}>
          <Image source={data.imageUrl} style={styles.image} />
          <View style={styles.imageOverlay} />
        </View>

        {/* Content details */}
        <View style={styles.contentContainer}>
          <Text style={styles.comboName}>{data.name}</Text>
          <Text style={styles.price}>{formatPrice(data.price)}</Text>
          <Text style={styles.sectionTitle}>Package Includes:</Text>
          {data.description?.map((desc, index) => (
            <View key={index} style={styles.descriptionItemContainer}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.descriptionItem}>{desc}</Text>
            </View>
          ))}

          {/* Contact button */}
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => navigation.navigate("Message", { comboName: data.name })}
          >
            <Text style={styles.buttonText}>Contact for Booking</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Customization modal */}
      <Modal visible={modalVisible} animationType="none" transparent>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContainer, { transform: [{ translateY }] }]}>
            <Text style={styles.modalTitle}>Customize Your Combo</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Number of Guests"
              keyboardType="numeric"
              placeholderTextColor="#999"
              value={String(guestCount)}
              onChangeText={(text) => setGuestCount(Number(text.replace(/[^0-9]/g, "")))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Number of Tables"
              keyboardType="numeric"
              placeholderTextColor="#999"
              value={String(tableCount)}
              onChangeText={(text) => setTableCount(Number(text.replace(/[^0-9]/g, "")))}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Theme Color"
              placeholderTextColor="#999"
              value={themeColor}
              onChangeText={setThemeColor}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Flower Style"
              placeholderTextColor="#999"
              value={flowerStyle}
              onChangeText={setFlowerStyle}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={closeModal}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonSave} onPress={saveCustomization}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DetailCombo;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Playfair_me",
    color: "#000",
    flex: 1,
    textAlign: "center",
  },
  iconButton: {
    padding: 6,
  },
  homeIcon: {
    width: 22,
    height: 22,
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  contentContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingHorizontal: 16,
    elevation: 5,
  },
  comboName: {
    fontSize: 32,
    fontFamily: "Playfair_me",
    color: "#333",
    marginBottom: 8,
    fontWeight: "bold",
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E53935",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    marginTop: 8,
  },
  descriptionItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkIcon: {
    marginRight: 10,
    color: "#4CAF50",
    fontSize: 20,
    fontWeight: "bold",
  },
  descriptionItem: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  contactButton: {
    marginTop: 140,
    marginBottom: 32,
    backgroundColor: "#E53935",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignSelf: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Playfair_me",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Playfair_me",
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
  },
  modalInput: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 8,
    marginBottom: 20,
    fontSize: 16,
    color: "#333",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButtonSave: {
    marginRight: 10,
    flex: 1,
    backgroundColor: "#E53935",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonCancel: {
    marginRight: 10,
    flex: 1,
    backgroundColor: "#aaa",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});