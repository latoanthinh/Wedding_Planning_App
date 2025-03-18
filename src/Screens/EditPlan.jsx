import React, { useRef, useEffect, useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  TextInput,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { updatePlan } from '../redux/ChitietPlanSlice';
import { AppContext } from '../AppContext';

const { width } = Dimensions.get('window');

const EditPlan = ({ navigation, route }) => {
  const { planId, planData } = route?.params || {};
  const dispatch = useDispatch();
  const { user } = useContext(AppContext);
  const userId = user._id;

  // State cho các trường cơ bản
  const [name, setName] = useState(planData?.name || '');
  const [plandateevent, setPlandateevent] = useState(
    planData?.plandateevent ? new Date(planData.plandateevent).toISOString().split('T')[0] : ''
  );
  const [plansoluongkhach, setPlansoluongkhach] = useState(planData?.plansoluongkhach?.toString() || '');
  const [planprice, setPlanprice] = useState(planData?.planprice?.toString() || '');
  const [totalPrice, setTotalPrice] = useState(planData?.totalPrice?.toString() || '');

  // State cho SanhId
  const [sanhId, setSanhId] = useState(planData?.SanhId?._id || '');

  // State cho danh sách caterings, decorates, presents
  const [caterings, setCaterings] = useState(planData?.caterings || []);
  const [decorates, setDecorates] = useState(planData?.decorates || []);
  const [presents, setPresents] = useState(planData?.presents || []);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Hàm thay đổi SanhId
  const handleChangeSanh = () => {
    ToastAndroid.show('Chuyển đến màn hình chọn sảnh (chưa triển khai)', ToastAndroid.SHORT);
  };

  // Hàm thay đổi danh sách caterings
  const handleChangeCaterings = () => {
    ToastAndroid.show('Chuyển đến màn hình chọn món ăn (chưa triển khai)', ToastAndroid.SHORT);
  };

  // Hàm thay đổi danh sách decorates
  const handleChangeDecorates = () => {
    ToastAndroid.show('Chuyển đến màn hình chọn trang trí (chưa triển khai)', ToastAndroid.SHORT);
  };

  // Hàm thay đổi danh sách presents
  const handleChangePresents = () => {
    ToastAndroid.show('Chuyển đến màn hình chọn quà tặng (chưa triển khai)', ToastAndroid.SHORT);
  };

  // Hàm lưu thay đổi
  const handleSave = () => {
    if (!userId) {
      ToastAndroid.show('Không tìm thấy thông tin người dùng!', ToastAndroid.SHORT);
      return;
    }
    if (!planId) {
      ToastAndroid.show('Không tìm thấy ID kế hoạch!', ToastAndroid.SHORT);
      return;
    }

    const updateData = {
      UserId: userId, // Thêm userId vào dữ liệu gửi đi
      name,
      plandateevent: plandateevent ? new Date(plandateevent).toISOString() : undefined,
      plansoluongkhach: plansoluongkhach ? parseInt(plansoluongkhach, 10) : undefined,
      planprice: planprice ? parseFloat(planprice) : undefined,
      totalPrice: totalPrice ? parseFloat(totalPrice) : undefined,
      SanhId: sanhId || undefined,
      caterings: caterings.map(item => item._id),
      decorates: decorates.map(item => item._id),
      presents: presents.map(item => item._id),
    };

    console.log('Dữ liệu gửi đi:', updateData); // Log để kiểm tra dữ liệu

    dispatch(updatePlan({ planId, updateData }))
      .unwrap()
      .then((updatedPlan) => {
        ToastAndroid.show('Cập nhật kế hoạch thành công!', ToastAndroid.SHORT);
        console.log('Dữ liệu trả về từ API:', updatedPlan); // Log dữ liệu trả về
        navigation.navigate('DetailPlan', { 
          planId: planId, 
          planData: updatedPlan // Dữ liệu mới từ API
        });
      })
      .catch((err) => {
        ToastAndroid.show(`Lỗi cập nhật kế hoạch: ${err.message || err}`, ToastAndroid.SHORT);
        console.error('Lỗi từ API:', err); // Log lỗi để debug
      });
  };

  // Hàm hiển thị danh sách item với hình ảnh
  const renderItemList = (items, type) => (
    <View>
      {items.length > 0 ? (
        items.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            {item.imageUrl && (
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            )}
            <View style={styles.itemContent}>
              <Text style={styles.itemText}>{item.name}</Text>
              <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')} VNĐ</Text>
              {item.description && (
                <Text style={styles.itemDescription}>{item.description}</Text>
              )}
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noDataText}>Chưa có {type === 'caterings' ? 'món ăn' : type === 'decorates' ? 'trang trí' : 'quà tặng'}</Text>
      )}
      <TouchableOpacity
        style={styles.changeButton}
        onPress={
          type === 'caterings'
            ? handleChangeCaterings
            : type === 'decorates'
            ? handleChangeDecorates
            : handleChangePresents
        }
      >
        <Text style={styles.buttonText}>Thay đổi {type === 'caterings' ? 'món ăn' : type === 'decorates' ? 'trang trí' : 'quà tặng'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6F61" />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={28} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chỉnh sửa kế hoạch</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('TabNavigation')}
              style={styles.backButton}
            >
              <Image source={require('../Assets/Images/home48.png')} style={styles.homeIcon} />
            </TouchableOpacity>
          </View>

          {/* Form chỉnh sửa */}
          <View style={styles.planInfoCard}>
            <Text style={styles.planTitle}>Thông tin kế hoạch</Text>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Tên kế hoạch:</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nhập tên kế hoạch"
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Ngày sự kiện:</Text>
              <TextInput
                style={styles.input}
                value={plandateevent}
                onChangeText={setPlandateevent}
                placeholder="YYYY-MM-DD"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Số lượng khách:</Text>
              <TextInput
                style={styles.input}
                value={plansoluongkhach}
                onChangeText={setPlansoluongkhach}
                placeholder="Nhập số lượng khách"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Ngân sách:</Text>
              <TextInput
                style={styles.input}
                value={planprice}
                onChangeText={setPlanprice}
                placeholder="Nhập ngân sách (VNĐ)"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Tổng giá:</Text>
              <TextInput
                style={styles.input}
                value={totalPrice}
                onChangeText={setTotalPrice}
                placeholder="Nhập tổng giá (VNĐ)"
                keyboardType="numeric"
              />
            </View>

            {/* Sảnh */}
            <View style={styles.inputRow}>
              <Text style={styles.label}>Sảnh:</Text>
              <View style={styles.itemCard}>
                {planData?.SanhId?.imageUrl && (
                  <Image source={{ uri: planData.SanhId.imageUrl }} style={styles.itemImage} />
                )}
                <View style={styles.itemContent}>
                  <Text style={styles.itemText}>{planData?.SanhId?.name || 'Chưa chọn sảnh'}</Text>
                  <Text style={styles.itemPrice}>{planData?.SanhId?.price.toLocaleString('vi-VN')} VNĐ</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.changeButton} onPress={handleChangeSanh}>
                <Text style={styles.buttonText}>Thay đổi sảnh</Text>
              </TouchableOpacity>
            </View>

            {/* Dịch vụ ăn uống */}
            <View style={styles.inputRow}>
              <Text style={styles.label}>Dịch vụ ăn uống:</Text>
              {renderItemList(caterings, 'caterings')}
            </View>

            {/* Trang trí */}
            <View style={styles.inputRow}>
              <Text style={styles.label}>Trang trí:</Text>
              {renderItemList(decorates, 'decorates')}
            </View>

            {/* Quà tặng */}
            <View style={styles.inputRow}>
              <Text style={styles.label}>Quà tặng:</Text>
              {renderItemList(presents, 'presents')}
            </View>

            {/* Nút lưu */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Icon name="content-save" size={20} color="#FFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Lưu thay đổi</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles giữ nguyên
const styles = StyleSheet.create({
  homeIcon: { width: 22, height: 22 },
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FF6F61',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    marginBottom: 20,
  },
  backButton: { width: 22, height: 22 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  planInfoCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F9F9F9',
    marginBottom: 10,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 12,
    color: '#FF6F61',
    marginTop: 5,
  },
  itemDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  noDataText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  changeButton: {
    backgroundColor: '#FFB300',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 3,
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditPlan;