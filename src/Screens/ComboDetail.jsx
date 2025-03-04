import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from "react-native";

const DetailCombo = ({ route, navigation }) => {
  // Nhận dữ liệu combo từ params (nếu được truyền khi điều hướng)
  const { comboData } = route.params || {};
  
  // Nếu không có dữ liệu từ params, dùng dữ liệu mặc định để tránh lỗi
  const data = comboData || {
    name: "COMBO NAME",
    price: 14999999,
    imageUrl: require("../Assets/Images/combo.png"),
    description: [
      "Bao gồm trang trí tiệc cưới, đa dạng hoa, phông trang điểm...",
      "Âm thực: đa dạng món ăn truyền thống lẫn quốc tế...",
      "Dịch vụ quay phim, chụp ảnh phóng sự...",
      "Bánh cưới, đồ uống, trang trí bàn Gallery..."
    ],
  };

  // Hàm format giá (thêm dấu chấm phân tách)
  const formatPrice = (num) => {
    if (!num) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const formattedPrice = formatPrice(data.price) + "đ";

  // Xử lý nút “Thêm vào giỏ hàng”
  const handleAddToCart = () => {
    alert("Đã thêm vào giỏ hàng!");
  };

  // Xử lý nút “Tùy chỉnh Combo”
  const handleCustomize = () => {
    alert("Chuyển sang màn hình tùy chỉnh combo...");
  };

  return (
    <ScrollView style={styles.container}>
      {/* Ảnh combo */}
      <Image
        source={data.imageUrl}
        style={styles.image}
      />

      {/* Tên combo */}
      <Text style={styles.comboName}>{data.name}</Text>

      {/* Giá combo */}
      <Text style={styles.price}>{formattedPrice}</Text>

      {/* Mô tả các hạng mục */}
      <Text style={styles.subTitle}>
        Các hạng mục thường có trong combo đặt nhà hàng tiệc cưới:
      </Text>
      {data.description?.map((desc, index) => (
        <Text key={index} style={styles.bulletItem}>
          • {desc}
        </Text>
      ))}

      {/* Nút “Thêm vào giỏ hàng” */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
        <Text style={styles.buttonText}>Thêm vào giỏ hàng</Text>
      </TouchableOpacity>

      {/* Nút “Tùy chỉnh Combo” */}
      <TouchableOpacity style={styles.customButton} onPress={handleCustomize}>
        <Text style={styles.buttonText}>Tùy chỉnh Combo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default DetailCombo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  comboName: {
    fontSize: 24,
    fontWeight: "bold",
    marginHorizontal: 16,
    marginTop: 16,
  },
  price: {
    fontSize: 20,
    fontWeight: "600",
    marginHorizontal: 16,
    marginTop: 8,
    color: "#E53935",
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 16,
    marginTop: 16,
  },
  bulletItem: {
    fontSize: 15,
    marginHorizontal: 24,
    marginTop: 4,
    lineHeight: 22,
  },
  addButton: {
    backgroundColor: "#E53935",
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  customButton: {
    backgroundColor: "#757575",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
