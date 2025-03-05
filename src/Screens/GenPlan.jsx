import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions
} from "react-native";

const { width } = Dimensions.get('window');

const GenPlan = ({ navigation }) => {
  // Dữ liệu mẫu (fake data) cho danh sách combo
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
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Tiêu đề trang */}
      <Text style={styles.pageTitle}>WEDDING COMBOS</Text>

      {/* Danh sách Combo */}
      <View style={styles.comboList}>
        {combos.map((item) => (
          <TouchableOpacity 
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
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default GenPlan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 20,
    color: "#333",
    backgroundColor: "#fff",
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
    height: 200,
  },
  comboContent: {
    padding: 16,
  },
  comboName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  comboPrice: {
    fontSize: 18,
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
    fontSize: 16,
  },
  descriptionText: {
    fontSize: 15,
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
    fontSize: 14,
    fontWeight: "600",
  },
});