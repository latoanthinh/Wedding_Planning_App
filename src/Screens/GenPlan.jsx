import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchPlanById } from "../redux/CreatePlanSlice";

const GenPlan = ({ route }) => {
  const { planId } = route.params;
  const dispatch = useDispatch();
  const { plan, loading, error } = useSelector((state) => state.createplan);

  useEffect(() => {
    dispatch(fetchPlanById(planId));
  }, [dispatch, planId]);

  if (loading) return <ActivityIndicator size="large" color="#A52A2A" />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!plan) return <Text style={styles.error}>Không tìm thấy kế hoạch.</Text>;

  // Đảm bảo dữ liệu không bị undefined
  const {
    name = "Kế hoạch cưới",
    plandateevent,
    plansoluongkhach = 0,
    planlocation = "Chưa xác định",
    totalPrice = 0,
    invitationId = {},
    lobbyId = {},
    cateringId = {},
    flowerId = {},
    clothes = []
  } = plan || {};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{name}</Text>

      {/* Thông tin chung */}
      <View style={styles.infoBox}>
        <Text style={styles.detail}>📅 Ngày cưới: {plandateevent ? new Date(plandateevent).toLocaleDateString() : "--/--/----"}</Text>
        <Text style={styles.detail}>👥 Số khách: {plansoluongkhach}</Text>
        <Text style={styles.detail}>📍 Địa điểm: {planlocation}</Text>
        <Text style={styles.totalPrice}>💰 Tổng chi phí: {(totalPrice ?? 0).toLocaleString()} VND</Text>
      </View>

      {/* Hiển thị từng hạng mục */}
      {[
        { title: "Thiệp mời", data: invitationId },
        { title: "Sảnh cưới", data: lobbyId, extra: `👥 Số khách: ${lobbyId?.SoLuongKhach || 0}` },
        { title: "Dịch vụ ăn uống", data: cateringId },
        { title: "Hoa trang trí", data: flowerId, extra: flowerId?.description || "Không có mô tả" },
      ].map((item, index) => (
        item.data && Object.keys(item.data).length > 0 ? (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <View style={styles.card}>
              <Image
                source={{ uri: item.data.imageUrl || "https://via.placeholder.com/80" }}
                style={styles.image}
              />
              <View style={styles.info}>
                <Text style={styles.name}>{item.data.name || "Chưa chọn"}</Text>
                {item.extra && <Text style={styles.extra}>{item.extra}</Text>}
                <Text style={styles.price}>{(item.data?.price ?? 0).toLocaleString()} VND</Text>
              </View>
            </View>
          </View>
        ) : null
      ))}

      {/* Trang phục cưới */}
      {clothes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trang phục cưới</Text>
          {clothes.map((item, index) => (
            <View key={index} style={styles.card}>
              <Image
                source={{ uri: item.imageUrl?.[0] || "https://via.placeholder.com/80" }}
                style={styles.image}
              />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name || "Chưa chọn"}</Text>
                <Text style={styles.price}>{(item.price ?? 0).toLocaleString()} VND</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
  },
  headerContainer: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 1,
    marginTop: 10,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  itemContainer: {

    title: {
      fontSize: 30,
      fontWeight: "bold",
      textAlign: "center",
      color: "#5D4037",
      marginBottom: 15,
      fontFamily: "Fairplay Display1",
    },
    infoBox: {
      backgroundColor: "#FFF5EE",
      borderRadius: 15,
      padding: 20,

      marginBottom: 20,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 3 },
      elevation: 5,
    },
    detail: {
      fontSize: 18,
      color: "#4A342E",
      marginBottom: 8,
      fontFamily: "Fairplay Me",
    },
    totalPrice: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#654321",
      marginTop: 10,
      fontFamily: "Fairplay Display2",
    },
    section: {
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#5D4037",
      marginBottom: 15,
      fontFamily: "Fairplay Re",
    },
    card: {
      flexDirection: "row",
      backgroundColor: "#FFFFFF",
      borderRadius: 15,
      padding: 15,
      marginBottom: 10,
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 3 },
      elevation: 5,
    },
    image: {
      width: 90,
      height: 90,
      borderRadius: 15,
      marginRight: 20,
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#3E2723",
      marginBottom: 6,
      fontFamily: "Fairplay Display1",
    },
    extra: {
      fontSize: 16,
      color: "#8D6E63",
      marginBottom: 6,
      fontFamily: "Fairplay Me",
    },
    price: {
      fontSize: 20,
      fontWeight: "bold",
      color: "#654321",
      fontFamily: "Fairplay Display2",
    },
    error: {
      fontSize: 20,
      color: "red",
      textAlign: "center",
      marginTop: 25,
    },
    backIcon: {
      width: 24,
      height: 24,
      tintColor: '#000',
    }
  }
});
export default GenPlan;

