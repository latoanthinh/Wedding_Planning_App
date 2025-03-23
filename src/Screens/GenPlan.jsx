import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Pressable,
  FlatList,
} from "react-native";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";

const { height, width } = Dimensions.get("window");
const scale = width / 375;

const normalize = (size) => Math.round(scale * size);

const GenPlan = ({ navigation, route }) => {
  const { params } = route;
  const { plans } = useSelector((state) => state.khaosat);

  console.log("Params in GenPlan:", params);
  console.log("Plans in GenPlan:", plans);

  const formatPrice = (num) =>
    num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " VNĐ" || "0 VNĐ";

  const renderPlan = ({ item }) => (
    <Pressable
      style={styles.planCard}
      onPress={() => navigation.navigate("PlanDetail", { planData: item })}
    >
      <View style={styles.planContent}>
        <Text style={styles.planName}>{item.name || "Sảnh không xác định"}</Text>
        <Text style={styles.planPrice}>{formatPrice(item.totalPrice)}</Text>
        <Text style={styles.planText}>
          Số lượng khách: {item.SanhId?.SoLuongKhach || "Không xác định"}
        </Text>
        <View style={styles.planServices}>
          <Text style={styles.planServiceText}>
            Dịch vụ: {item.caterings?.length > 0 ? item.caterings.map((c) => c.name).join(", ") : "Không có"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.detailButtonContainer}
          onPress={() => navigation.navigate("DetailPlan", { planId: item._id })}
        >
          <Text style={styles.detailButton}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Image source={require("../Assets/Images/back.png")} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gen Plan</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("TabNavigation")}
          style={styles.iconButton}
        >
          <Image source={require("../Assets/Images/home48.png")} style={styles.homeIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.surveyInfo}>
        <Text style={styles.surveyText}>
          Ngày tổ chức: {params?.eventDate ? new Date(params.eventDate).toLocaleDateString("vi-VN") : "Chưa chọn"}
        </Text>
        <Text style={styles.surveyText}>Số lượng khách: {params?.guestCount || "Chưa nhập"}</Text>
        <Text style={styles.surveyText}>
          Ngân sách: {params?.budget ? formatPrice(params.budget) : "Chưa nhập"}
        </Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>Danh sách Combo gợi ý</Text>
        {plans.length > 0 ? (
          <FlatList
            data={plans}
            renderItem={renderPlan}
            keyExtractor={(item) => item._id.toString()}
            style={styles.planList}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.noPlansContainer}>
            <Text style={styles.noPlansText}>Không có kế hoạch phù hợp với yêu cầu của bạn</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => navigation.navigate("Thongtincoban")}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default GenPlan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: normalize(20),
    fontFamily: "Playfair_me",
    color: "#000",
    flex: 1,
    textAlign: "center",
  },
  iconButton: {
    padding: 8,
  },
  backIcon: {
    width: 22,
    height: 22,
  },
  homeIcon: {
    width: 22,
    height: 22,
  },
  surveyInfo: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F9F9F9",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  surveyText: {
    fontSize: normalize(16),
    color: "#333",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: normalize(18),
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  planList: {
    paddingHorizontal: 16,
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    overflow: "hidden",
  },
  planContent: {
    padding: 16,
  },
  planName: {
    fontSize: normalize(20),
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  planPrice: {
    fontSize: normalize(18),
    color: "#E53935",
    fontWeight: "600",
    marginBottom: 12,
  },
  planText: {
    fontSize: normalize(16),
    color: "#666",
    marginBottom: 8,
  },
  planServices: {
    marginBottom: 16,
  },
  planServiceText: {
    fontSize: normalize(15),
    color: "#666",
  },
  noPlansContainer: {
    alignItems: "center",
    padding: 20,
  },
  noPlansText: {
    fontSize: normalize(16),
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#E53935",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: normalize(16),
    fontWeight: "600",
  },
  detailButtonContainer: {
    alignSelf: "flex-start",
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