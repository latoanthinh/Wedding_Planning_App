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
  StatusBar,
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
    <View style={styles.planCard}>
      <View style={styles.planContent}>
        <Text style={styles.planName}>{item.name || "Sảnh không xác định"}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.planPrice}>{formatPrice(item.totalPrice)}</Text>
        </View>
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
          onPress={() => navigation.navigate("DetailPlan", { planData: item })}
        >
          <Text style={styles.detailButton}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate("TabNavigation")} style={styles.iconButton}>
            <Image source={require("../Assets/Images/back.png")} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gợi ý kế hoạch</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("TabNavigation")}
            style={styles.iconButton}
          >
            <Image source={require("../Assets/Images/home48.png")} style={styles.homeIcon} />
          </TouchableOpacity>
        </View>

        <View style={styles.surveyInfo}>
          <View style={styles.surveyInfoItem}>
            <Image source={require('../Assets/Images/calendar.png')} style={styles.infoIcon} />
            <Text style={styles.surveyText}>
              Ngày tổ chức: {params?.eventDate ? new Date(params.eventDate).toLocaleDateString("vi-VN") : "Chưa chọn"}
            </Text>
          </View>
          <View style={styles.surveyInfoItem}>
            <Image source={require('../Assets/Images/Users.png')} style={styles.infoIcon} />
            <Text style={styles.surveyText}>Số lượng khách: {params?.guestCount || "Chưa nhập"}</Text>
          </View>
          <View style={styles.surveyInfoItem}>
            <Image source={require('../Assets/Images/wallet.png')} style={styles.infoIcon} />
            <Text style={styles.surveyText}>
              Ngân sách: {params?.budget ? formatPrice(params.budget) : "Chưa nhập"}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionTitleContainer}>
            <Image source={require('../Assets/Images/list.png')} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Danh sách Combo gợi ý</Text>
          </View>
          
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
              <Image source={require('../Assets/Images/error.png')} style={styles.emptyIcon} />
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
      </View>
    </SafeAreaView>
  );
};

export default GenPlan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mainContainer: {
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
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    elevation: 3,
  },
  headerTitle: {
    fontSize: normalize(22),
    fontFamily: "Playfair_me",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  iconButton: {
    padding: 8,
  },
  backIcon: {
    width: 22,
    height: 22,
    tintColor: "#000",
  },
  homeIcon: {
    width: 22,
    height: 22,
    tintColor: "#000",
  },
  surveyInfo: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: "#F8F8F8",
    borderRadius: 15,
    margin: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

  },
  surveyInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: "#333",
  },
  surveyText: {
    fontSize: normalize(16),
    color: "#333",
    fontWeight: "500",
    fontFamily: "Playfair_me",
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  sectionIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
    tintColor: "#000",
  },
  sectionTitle: {
    fontSize: normalize(20),
    color: "#333",
    fontFamily: "Playfair_me",
  },
  planList: {
    paddingHorizontal: 16,
  },
  planCard: {
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  planContent: {
    padding: 20,
  },
  planName: {
    fontSize: normalize(22),
    color: "#333",
    marginBottom: 10,
    fontFamily: "Playfair_me",
  },
  priceContainer: {
    backgroundColor: "#F8F8F8",
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#E53935",
  },
  planPrice: {
    fontSize: normalize(22),
    color: "#E53935",
    fontWeight: "700",
    fontFamily: "Playfair_me",
  },
  planText: {
    fontSize: normalize(16),
    color: "#555",
    marginBottom: 10,
    fontWeight: "500",
    fontFamily: "Playfair_me",
  },
  planServices: {
    marginBottom: 20,
    backgroundColor: "#F8F8F8",
    padding: 12,
    borderRadius: 10,
  },
  planServiceText: {
    fontSize: normalize(16),
    color: "#555",
    lineHeight: 22,
    fontFamily: "Playfair_me",
  },
  detailButtonContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  detailButton: {
    color: "#FFFFFF",
    fontSize: normalize(16),
    textAlign: "center",
    fontFamily: "Playfair_me",
  },
  noPlansContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#F8F8F8",
    borderRadius: 20,
    margin: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 20,
    tintColor: "#333",
  },
  noPlansText: {
    fontSize: normalize(18),
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Playfair_me",
  },
  retryButton: {
    borderRadius: 25,
    backgroundColor: "#E53935",
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: normalize(16),
    textAlign: "center",
    fontFamily: "Playfair_me",
  },
});