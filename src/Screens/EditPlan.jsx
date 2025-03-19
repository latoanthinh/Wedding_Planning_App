import React, { useRef, useEffect, useState, useContext } from 'react';
import {
  StyleSheet,View,Text,Animated,Image,TouchableOpacity,ScrollView,StatusBar,
  Dimensions,TextInput,ToastAndroid,Modal,FlatList,ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DatePicker from 'react-native-date-picker';
import { useDispatch, useSelector } from 'react-redux';
import { updatePlan } from '../redux/ChitietPlanSlice';
import { fetchCaterings, resetCaterings } from '../redux/GetAllCateringSlice';
import { fetchDecorates, resetDecorates } from '../redux/GetAllDecoratesSlice'; // Import actions từ decorateSlice
import { AppContext } from '../AppContext';

const { width } = Dimensions.get('window');

const EditPlan = ({ navigation, route }) => {
  const { planId, planData } = route?.params || {};
  console.log('planData trong EditPlan:', JSON.stringify(planData, null, 2));

  const dispatch = useDispatch();
  const { user } = useContext(AppContext);
  const userId = user?._id;

  // Lấy dữ liệu từ Redux store
  const { caterings, cateringStatus, error: cateringError } = useSelector((state) => state.getallcatering);
  const { decorates, decorateStatus, error: decorateError } = useSelector((state) => state.getalldecorates);

  // State cho các trường cơ bản
  const [name, setName] = useState(planData?.name || '');
  const [plandateevent, setPlandateevent] = useState(
    planData?.plandateevent && !isNaN(new Date(planData.plandateevent).getTime())
      ? new Date(planData.plandateevent)
      : new Date()
  );
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [plansoluongkhach, setPlansoluongkhach] = useState(
    planData?.plansoluongkhach ? String(planData.plansoluongkhach) : ''
  );
  const [planprice, setPlanprice] = useState(
    planData?.planprice ? String(planData.planprice) : ''
  );
  const [totalPrice, setTotalPrice] = useState(
    planData?.totalPrice ? String(planData.totalPrice) : ''
  );
  const [sanhId, setSanhId] = useState(planData?.SanhId?._id || '');
  const [cateringsList, setCateringsList] = useState(planData?.caterings || []);
  const [decoratesList, setDecoratesList] = useState(planData?.decorates || []); // Danh sách decorates đã chọn
  const [presents, setPresents] = useState(planData?.presents || []);

  // State cho modal
  const [modalVisible, setModalVisible] = useState(false);
  const [currentType, setCurrentType] = useState('');
  const [availableItems, setAvailableItems] = useState([]);
  const [actionType, setActionType] = useState('add');
  const [replaceIndex, setReplaceIndex] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Dữ liệu giả lập cho presents (thay bằng API nếu có)
  const mockData = {
    presents: [
      { _id: '6', name: 'Bút bi', price: 50000, imageUrl: 'https://example.com/but.jpg' },
      { _id: '7', name: 'Khăn tay', price: 100000, imageUrl: 'https://example.com/khan.jpg' },
    ],
  };

  // Hàm mở modal và lấy dữ liệu
  const openChangeModal = (type, action = 'add', index = null) => {
    setCurrentType(type);
    setActionType(action);
    setReplaceIndex(index);
    setModalVisible(true);

    if (type === 'caterings') {
      dispatch(fetchCaterings());
    } else if (type === 'decorates') {
      dispatch(fetchDecorates()); // Gọi API decorates qua Redux
    } else if (type === 'presents') {
      setAvailableItems(mockData.presents);
    }
  };

  // Cập nhật availableItems khi dữ liệu từ Redux thay đổi
  useEffect(() => {
    if (currentType === 'caterings' && cateringStatus === 'succeeded') {
      setAvailableItems(caterings);
    } else if (currentType === 'decorates' && decorateStatus === 'succeeded') {
      setAvailableItems(decorates);
    }
  }, [caterings, cateringStatus, decorates, decorateStatus, currentType]);

  // Hiển thị lỗi nếu có
  useEffect(() => {
    if (currentType === 'caterings' && cateringStatus === 'failed' && cateringError) {
      ToastAndroid.show(`Lỗi khi lấy danh sách món ăn: ${cateringError}`, ToastAndroid.SHORT);
    } else if (currentType === 'decorates' && decorateStatus === 'failed' && decorateError) {
      ToastAndroid.show(`Lỗi khi lấy danh sách trang trí: ${decorateError}`, ToastAndroid.SHORT);
    }
  }, [cateringStatus, cateringError, decorateStatus, decorateError, currentType]);

  // Reset dữ liệu khi component unmount
  useEffect(() => {
    return () => {
      dispatch(resetCaterings());
      dispatch(resetDecorates());
    };
  }, [dispatch]);

  // Hàm chọn item từ modal
  const handleSelectItem = (item) => {
    if (currentType === 'caterings') {
      if (actionType === 'add') {
        setCateringsList([...cateringsList, item]);
      } else if (actionType === 'replace' && replaceIndex !== null) {
        const newCaterings = [...cateringsList];
        newCaterings[replaceIndex] = item;
        setCateringsList(newCaterings);
      }
    } else if (currentType === 'decorates') {
      if (actionType === 'add') {
        setDecoratesList([...decoratesList, item]);
      } else if (actionType === 'replace' && replaceIndex !== null) {
        const newDecorates = [...decoratesList];
        newDecorates[replaceIndex] = item;
        setDecoratesList(newDecorates);
      }
    } else if (currentType === 'presents') {
      if (actionType === 'add') {
        setPresents([...presents, item]);
      } else if (actionType === 'replace' && replaceIndex !== null) {
        const newPresents = [...presents];
        newPresents[replaceIndex] = item;
        setPresents(newPresents);
      }
    }
    setModalVisible(false);
    setReplaceIndex(null);
    setActionType('add');
  };

  // Hàm xóa item
  const handleRemoveItem = (type, index) => {
    if (type === 'caterings') {
      setCateringsList(cateringsList.filter((_, i) => i !== index));
    } else if (type === 'decorates') {
      setDecoratesList(decoratesList.filter((_, i) => i !== index));
    } else if (type === 'presents') {
      setPresents(presents.filter((_, i) => i !== index));
    }
  };

  const handleChangeSanh = () => {
    ToastAndroid.show('Chuyển đến màn hình chọn sảnh (chưa triển khai)', ToastAndroid.SHORT);
  };

  const handleSave = () => {
    if (!userId) {
      ToastAndroid.show('Không tìm thấy thông tin người dùng!', ToastAndroid.SHORT);
      return;
    }
    if (!planId) {
      ToastAndroid.show('Không tìm thấy ID kế hoạch!', ToastAndroid.SHORT);
      return;
    }

    if (plansoluongkhach && isNaN(parseInt(plansoluongkhach, 10))) {
      ToastAndroid.show('Số lượng khách không hợp lệ!', ToastAndroid.SHORT);
      return;
    }
    if (planprice && isNaN(parseFloat(planprice))) {
      ToastAndroid.show('Ngân sách không hợp lệ!', ToastAndroid.SHORT);
      return;
    }
    if (totalPrice && isNaN(parseFloat(totalPrice))) {
      ToastAndroid.show('Tổng giá không hợp lệ!', ToastAndroid.SHORT);
      return;
    }

    const updateData = {
      UserId: userId,
      name,
      plandateevent: plandateevent instanceof Date && !isNaN(plandateevent.getTime())
        ? plandateevent.toISOString()
        : undefined,
      plansoluongkhach: plansoluongkhach ? parseInt(plansoluongkhach, 10) : undefined,
      planprice: planprice ? parseFloat(planprice) : undefined,
      totalPrice: totalPrice ? parseFloat(totalPrice) : undefined,
      SanhId: sanhId || undefined,
      caterings: cateringsList.map(item => item._id),
      decorates: decoratesList.map(item => item._id),
      presents: presents.map(item => item._id),
    };

    console.log('Dữ liệu gửi đi:', JSON.stringify(updateData, null, 2));

    dispatch(updatePlan({ planId, updateData }))
      .unwrap()
      .then((updatedPlan) => {
        console.log('Cập nhật thành công, updatedPlan:', JSON.stringify(updatedPlan, null, 2));
        ToastAndroid.show('Cập nhật kế hoạch thành công!', ToastAndroid.SHORT);
        const combinedPlanData = {
          ...updatedPlan,
          UserId: updatedPlan.UserId || userId,
          SanhId: planData?.SanhId || updatedPlan.SanhId,
          caterings: cateringsList,
          decorates: decoratesList,
          presents: presents,
          plansoluongkhach: updateData.plansoluongkhach || updatedPlan.plansoluongkhach,
          planprice: updateData.planprice || updatedPlan.planprice,
          totalPrice: updateData.totalPrice || updatedPlan.totalPrice,
          plandateevent: updateData.plandateevent || updatedPlan.plandateevent,
          name: updateData.name || updatedPlan.name,
        };
        navigation.navigate('DetailPlan', {
          planId: planId,
          planData: combinedPlanData,
        });
        console.log('Đã điều hướng về DetailPlan với planData:', JSON.stringify(combinedPlanData, null, 2));
      })
      .catch((err) => {
        console.error('Lỗi khi cập nhật:', JSON.stringify(err, null, 2));
        ToastAndroid.show(`Lỗi cập nhật kế hoạch: ${err.message || err}`, ToastAndroid.SHORT);
      });
  };

  // Hàm hiển thị danh sách item
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
              <Text style={styles.itemPrice}>{item.price?.toLocaleString('vi-VN')} VNĐ</Text>
              {item.description && (
                <Text style={styles.itemDescription}>{item.description}</Text>
              )}
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity
                style={styles.replaceButton}
                onPress={() => openChangeModal(type, 'replace', index)}
              >
                <Text style={styles.buttonText}>Thay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveItem(type, index)}
              >
                <Text style={styles.buttonText}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noDataText}>
          Chưa có {type === 'caterings' ? 'món ăn' : type === 'decorates' ? 'trang trí' : 'quà tặng'}
        </Text>
      )}
      <TouchableOpacity
        style={styles.changeButton}
        onPress={() => openChangeModal(type, 'add')}
      >
        <Text style={styles.buttonText}>
          Thêm {type === 'caterings' ? 'món ăn' : type === 'decorates' ? 'trang trí' : 'quà tặng'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Hàm render item trong modal
  const renderModalItem = ({ item }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleSelectItem(item)}
    >
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.modalItemImage} />
      )}
      <View style={styles.modalItemContent}>
        <Text style={styles.modalItemText}>{item.name}</Text>
        <Text style={styles.modalItemPrice}>{item.price?.toLocaleString('vi-VN')} VNĐ</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6F61" />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
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
              <TouchableOpacity onPress={() => setOpenDatePicker(true)}>
                <Text style={styles.input}>
                  {plandateevent.toISOString().split('T')[0]}
                </Text>
              </TouchableOpacity>
              <DatePicker
                modal
                open={openDatePicker}
                date={plandateevent}
                mode="date"
                minimumDate={new Date()}
                maximumDate={new Date(2100, 11, 31)}
                onConfirm={(date) => {
                  setOpenDatePicker(false);
                  setPlandateevent(date);
                }}
                onCancel={() => setOpenDatePicker(false)}
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Số lượng khách:</Text>
              <TextInput
                style={styles.input}
                value={plansoluongkhach}
                onChangeText={(text) => setPlansoluongkhach(text.replace(/[^0-9]/g, ''))}
                placeholder="Nhập số lượng khách"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Ngân sách:</Text>
              <TextInput
                style={styles.input}
                value={planprice}
                onChangeText={(text) => setPlanprice(text.replace(/[^0-9]/g, ''))}
                placeholder="Nhập ngân sách (VNĐ)"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Tổng giá:</Text>
              <TextInput
                style={styles.input}
                value={totalPrice}
                onChangeText={(text) => setTotalPrice(text.replace(/[^0-9]/g, ''))}
                placeholder="Nhập tổng giá (VNĐ)"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Sảnh:</Text>
              <View style={styles.itemCard}>
                {planData?.SanhId?.imageUrl && (
                  <Image source={{ uri: planData.SanhId.imageUrl }} style={styles.itemImage} />
                )}
                <View style={styles.itemContent}>
                  <Text style={styles.itemText}>{planData?.SanhId?.name || 'Chưa chọn sảnh'}</Text>
                  <Text style={styles.itemPrice}>
                    {planData?.SanhId?.price?.toLocaleString('vi-VN')} VNĐ
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.changeButton} onPress={handleChangeSanh}>
                <Text style={styles.buttonText}>Thay đổi sảnh</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Dịch vụ ăn uống:</Text>
              {renderItemList(cateringsList, 'caterings')}
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Trang trí:</Text>
              {renderItemList(decoratesList, 'decorates')}
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Quà tặng:</Text>
              {renderItemList(presents, 'presents')}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Icon name="content-save" size={20} color="#FFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Lưu thay đổi</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Modal hiển thị danh sách chọn item */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {actionType === 'add' ? 'Thêm' : 'Thay đổi'} {currentType === 'caterings' ? 'món ăn' : currentType === 'decorates' ? 'trang trí' : 'quà tặng'}
            </Text>
            {(currentType === 'caterings' && cateringStatus === 'loading') ||
            (currentType === 'decorates' && decorateStatus === 'loading') ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6F61" />
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
              </View>
            ) : availableItems.length > 0 ? (
              <FlatList
                data={availableItems}
                renderItem={renderModalItem}
                keyExtractor={(item) => item._id}
                style={styles.modalList}
              />
            ) : (
              <Text style={styles.noDataText}>Không có dữ liệu để hiển thị</Text>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  itemActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  replaceButton: {
    backgroundColor: '#FFB300',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginRight: 5,
  },
  removeButton: {
    backgroundColor: '#FF4444',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  noDataText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalList: {
    flexGrow: 0,
  },
  modalItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    alignItems: 'center',
  },
  modalItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  modalItemContent: {
    flex: 1,
  },
  modalItemText: {
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
  },
  modalItemPrice: {
    fontSize: 14,
    color: '#FF6F61',
    marginTop: 5,
  },
  closeButton: {
    backgroundColor: '#FF6F61',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default EditPlan;