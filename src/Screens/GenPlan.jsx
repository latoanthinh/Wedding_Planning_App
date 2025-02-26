import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";

const ReplaceButton = ({ onPress, children }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    Animated.timing(scale, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };
  const handlePressOut = () => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.replaceButton}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const GenPlan = ({ route }) => {
  // Lấy dữ liệu 'plan' và 'budget' được truyền từ Thongtincoban
  const { plan, budget } = route.params;
  const [currentPlan, setCurrentPlan] = useState(plan);

  // Fake data cho mỗi hạng mục
  const productsData = {
    dress: [
      {
        id: "dress1",
        name: "Simple Dress",
        price: 2000,
        rating: 4.5,
        discount: null,
        image: require("../Assets/Images/dresses1.png"),
      },
      {
        id: "dress2",
        name: "Elegant Dress",
        price: 4000,
        rating: 4.8,
        discount: "10% OFF",
        image: require("../Assets/Images/dresses1.png"),
      },
      {
        id: "dress3",
        name: "Premium Dress",
        price: 6000,
        rating: 4.9,
        discount: "15% OFF",
        image: require("../Assets/Images/dresses1.png"),
      },
    ],
    hall: [
      {
        id: "hall1",
        name: "Small Hall",
        price: 3000,
        rating: 4.6,
        discount: null,
        image: require("../Assets/Images/house.png"),
      },
      {
        id: "hall2",
        name: "Luxury Hall",
        price: 7000,
        rating: 4.9,
        discount: "5% OFF",
        image: require("../Assets/Images/house.png"),
      },
      {
        id: "hall3",
        name: "Classic Hall",
        price: 5000,
        rating: 4.7,
        discount: "10% OFF",
        image: require("../Assets/Images/house.png"),
      },
    ],
    flowers: [
      {
        id: "flowers1",
        name: "Basic Flowers",
        price: 500,
        rating: 4.4,
        discount: null,
        image: require("../Assets/Images/dresse.png"),
      },
      {
        id: "flowers2",
        name: "Premium Flowers",
        price: 1500,
        rating: 4.8,
        discount: null,
        image: require("../Assets/Images/dresse.png"),
      },
      {
        id: "flowers3",
        name: "Deluxe Flowers",
        price: 2500,
        rating: 4.9,
        discount: "20% OFF",
        image: require("../Assets/Images/dresse.png"),
      },
    ],
    food: [
      {
        id: "food1",
        name: "Standard Buffet",
        price: 2000,
        rating: 4.7,
        discount: null,
        image: require("../Assets/Images/fb_btn.png"),
      },
      {
        id: "food2",
        name: "Deluxe Buffet",
        price: 5000,
        rating: 4.9,
        discount: "15% OFF",
        image: require("../Assets/Images/fb_btn.png"),
      },
      {
        id: "food3",
        name: "Ultimate Buffet",
        price: 8000,
        rating: 5.0,
        discount: "20% OFF",
        image: require("../Assets/Images/fb_btn.png"),
      },
    ],
  };

  // Tính tổng chi phí hiện tại
  const totalCost = currentPlan.reduce(
    (sum, item) => sum + (item.price || 0),
    0
  );
  const leftover = budget - totalCost;

  // Hàm thay đổi sản phẩm cho hạng mục được chọn lại
  const handleReplace = (index) => {
    const currentItem = currentPlan[index];
    const categoryKey =
      currentItem.categoryKey || currentItem.category.toLowerCase();
    // Tính tổng chi phí của các hạng mục khác
    const sumOthers = currentPlan.reduce(
      (sum, item, idx) => (idx === index ? sum : sum + (item.price || 0)),
      0
    );
    // Lọc danh sách sản phẩm hợp lệ sao cho tổng không vượt budget
    let validCandidates = productsData[categoryKey].filter((candidate) => {
      if (candidate.id === currentItem.id) return false;
      return candidate.price + sumOthers <= budget;
    });
    if (validCandidates.length === 0) {
      // Fallback: chọn sản phẩm đầu tiên khác
      validCandidates = productsData[categoryKey].filter(
        (candidate) => candidate.id !== currentItem.id
      );
    }
    // Chọn sản phẩm có rating cao nhất trong các candidate
    const newProduct = validCandidates.sort((a, b) => b.rating - a.rating)[0];
    // Cập nhật lại currentPlan
    const newPlan = [...currentPlan];
    newPlan[index] = {
      ...newProduct,
      category: currentItem.category,
      categoryKey: categoryKey,
    };
    setCurrentPlan(newPlan);
  };

  return (
    <View style={styles.screenContainer}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>YOUR PLAN</Text>
      </View>

      {/* Danh sách các hạng mục */}
      <ScrollView style={styles.scrollContainer}>
        {currentPlan.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryText}>{item.category}</Text>
              {/* Nút "Chọn lại" bên phải với màu đen có hiệu ứng mượt */}
              <ReplaceButton onPress={() => handleReplace(index)}>
                <Text style={styles.replaceButtonText}>Chọn lại</Text>
              </ReplaceButton>
            </View>
            <View style={styles.card}>
              {item.image && (
                <Image source={item.image} style={styles.cardImage} />
              )}
              <View style={styles.infoContainer}>
                <Text style={styles.nameText}>{item.name}</Text>
                {item.rating && (
                  <Text style={styles.ratingText}>Rating: {item.rating}</Text>
                )}
                {item.discount && (
                  <Text style={styles.discountText}>{item.discount}</Text>
                )}
                <Text style={styles.priceText}>{item.price} $</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Phần so sánh giá tiền và nút Đặt cọc */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryDetails}>
          <View style={styles.summaryTextContainer}>
            <Text style={styles.summaryText}>
              Số tiền của bạn:{" "}
              <Text style={styles.budgetValue}>{budget} $</Text>
            </Text>
            <Text style={styles.summaryText}>
              Tổng chi phí:{" "}
              <Text
                style={[
                  styles.totalCostValue,
                  totalCost > budget ? styles.overBudget : styles.withinBudget,
                ]}
              >
                {totalCost} $
              </Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.depositButton}>
            <Text style={styles.depositButtonText}>Đặt cọc</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default GenPlan;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  headerContainer: {
    paddingVertical: 10, // Giảm padding để header nhỏ hơn
    backgroundColor: "#3E3E3E",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#3E3E3E",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 16, // Giảm font size cho header
    fontWeight: "bold",
    color: "#FFF",
    letterSpacing: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  itemContainer: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3E3E3E",
  },
  replaceButton: {
    backgroundColor: "#000",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  replaceButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    alignItems: "center",
  },
  cardImage: {
    width: 100,
    height: 100,
    resizeMode: "cover",
    borderRadius: 12,
  },
  infoContainer: {
    flex: 1,
    paddingLeft: 16,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 14,
    color: "#606060",
    marginBottom: 6,
  },
  discountText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FF396F",
    marginBottom: 6,
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  summaryContainer: {
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#EAEAEA",
    paddingHorizontal: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -4 },
  },
  summaryDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginVertical: 4,
  },
  budgetValue: {
    color: "#00BFA6",
    fontWeight: "bold",
  },
  totalCostValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  withinBudget: {
    color: "#00BFA6",
  },
  overBudget: {
    color: "#FF396F",
  },
  depositButton: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  depositButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
