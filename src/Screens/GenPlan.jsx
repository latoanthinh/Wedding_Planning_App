import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity
} from "react-native";

const GenPlan = ({ navigation }) => {
  // Dữ liệu mẫu (fake data) cho danh sách combo
  const combos = [
    {
      id: 1,
      name: "COMBO NAME 1",
      imageUrl: "https://via.placeholder.com/300x200",
      price: 14999999,
      description: [
        "Bao gồm trang trí tiệc cưới, đa dạng hoa, phông trang điểm...",
        "Âm thực: đa dạng món ăn truyền thống lẫn quốc tế...",
        "Dịch vụ quay phim, chụp ảnh phóng sự...",
      ],
    },
    {
      id: 2,
      name: "COMBO NAME 2",
      imageUrl: "https://via.placeholder.com/300x200",
      price: 9999999,
      description: [
        "Dịch vụ trọn gói với giá rẻ, phù hợp ngân sách nhỏ...",
        "Trang trí tối giản nhưng sang trọng...",
        "Có sẵn bánh cưới và đồ uống...",
      ],
    },
    {
      id: 3,
      name: "COMBO NAME 3",
      imageUrl: "https://via.placeholder.com/300x200",
      price: 19999999,
      description: [
        "Dịch vụ cao cấp với thực đơn đặc biệt...",
        "Quay phim, chụp ảnh chuyên nghiệp...",
        "Hoa tươi nhập khẩu, trang trí theo chủ đề...",
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Tiêu đề trang */}
      <Text style={styles.pageTitle}>COMBO</Text>

      {/* Section 1 */}
      <Text style={styles.sectionTitle}>Ready to choose</Text>
      {combos.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("ComboDetail", { comboData: item })}>
              <Text style={styles.cardLink}>Xem thêm &gt;</Text>
            </TouchableOpacity>
          </View>
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        </View>
      ))}

      {/* Section 2 */}
      <Text style={styles.sectionTitle}>Ready to choose</Text>
      {combos.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("ComboDetail", { comboData: item })}>
              <Text style={styles.cardLink}>Xem thêm &gt;</Text>
            </TouchableOpacity>
          </View>
          <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        </View>
      ))}
    </ScrollView>
  );
};

export default GenPlan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardLink: {
    fontSize: 14,
    color: "#007BFF",
  },
  cardImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginLeft: 10,
  },
});
