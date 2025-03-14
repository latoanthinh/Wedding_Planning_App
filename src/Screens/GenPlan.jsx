import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Pressable
} from "react-native";

const { height, width } = Dimensions.get('window');
const scale = width / 375;

const normalize = (size) => {
  return Math.round(scale * size);
};

const GenPlan = ({ navigation }) => {
  const combos = [
    {
      id: 1,
      name: "COMBO CLASSIC",
      imageUrl: require("../Assets/Images/combo.png"),
      price: 14999999,
      description: [
        "Trang trí tiệc cưới sang trọng",
        "Thực đơn đa dạng",
        "Dịch vụ quay phim chuyên nghiệp"
      ],
    },
    {
      id: 2,
      name: "COMBO PREMIUM",
      imageUrl: require("../Assets/Images/combo.png"),
      price: 19999999,
      description: [
        "Dịch vụ cao cấp toàn diện",
        "Trang trí theo chủ đề riêng",
        "Album ảnh nghệ thuật"
      ],
    },
    {
      id: 3,
      name: "COMBO DELUXE",
      imageUrl: require("../Assets/Images/combo.png"),
      price: 24999999,
      description: [
        "Trải nghiệm đẳng cấp",
        "Hoa nhập khẩu",
        "Quay phim 4K chuyên nghiệp"
      ],
    }
  ];

  const formatPrice = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " VNĐ";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Image source={require("../Assets/Images/back.png")} style={styles.backIcon} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Gen Plan</Text>

        <TouchableOpacity onPress={() => navigation.navigate("TabNavigation")} style={styles.iconButton}>
          <Image source={require("../Assets/Images/home48.png")} style={styles.homeIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>

        {/* Danh sách Combo */}
        <View style={styles.comboList}>
          {combos.map((item) => (
            <Pressable 
              key={item.id} 
              style={styles.comboCard}
              onPress={() => navigation.navigate("ComboDetail", { comboData: item })}
            >
              {/* Hình ảnh */}
              <Image 
                source={item.imageUrl} 
                style={styles.comboImage} 
                resizeMode="cover"
              />

              {/* Nội dung combo */}
              <View style={styles.comboContent}>
                <Text style={styles.comboName}>{item.name}</Text>
                <Text style={styles.comboPrice}>{formatPrice(item.price)}</Text>
                
                {/* Các mục dịch vụ */}
                <View style={styles.comboDescriptionContainer}>
                  {item.description.map((desc, index) => (
                    <View key={index} style={styles.descriptionItem}>
                      <Text style={styles.descriptionDot}>•</Text>
                      <Text style={styles.descriptionText}>{desc}</Text>
                    </View>
                  ))}
                </View>

                {/* Nút chi tiết */}
                <View style={styles.detailButtonContainer}>
                  <Text style={styles.detailButton}>Chi tiết</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default GenPlan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff", 
    paddingVertical: 8, 
    paddingHorizontal: 16,
    marginTop: 15
  },
  headerTitle: {
    fontSize: normalize(20),
    fontFamily:"Playfair_me",
    color: "#000", 
    flex: 1,
    textAlign: "center",
  },
  iconButton: {
    padding: 8,
  },
  homeIcon: {
    width: 22,
    height: 22,
  },
  pageSubtitle: {
    fontSize: normalize(16),
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  comboList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  comboCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },
  comboImage: {
    width: '100%',
    height: normalize(200),
  },
  comboContent: {
    padding: 16,
  },
  comboName: {
    fontSize: normalize(20),
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  comboPrice: {
    fontSize: normalize(18),
    color: "#E53935",
    fontWeight: "600",
    marginBottom: 12,
  },
  comboDescriptionContainer: {
    marginBottom: 16,
  },
  descriptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  descriptionDot: {
    color: "#E53935",
    marginRight: 8,
    fontSize: normalize(16),
  },
  descriptionText: {
    fontSize: normalize(15),
    color: "#666",
  },
  detailButtonContainer: {
    alignSelf: 'flex-start',
    backgroundColor: "#E53935",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  detailButton: {
    color: "#FFFFFF",
    fontSize: normalize(14),
    fontWeight: "600",
  },
});