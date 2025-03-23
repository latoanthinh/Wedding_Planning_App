import React, { useRef, useEffect, useState, useContext } from 'react';
import {
  StyleSheet, View, Text, Animated, Image, TouchableOpacity, ScrollView, StatusBar,
  Dimensions, TextInput, ToastAndroid, Modal, FlatList, ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DatePicker from 'react-native-date-picker';
import { useDispatch, useSelector } from 'react-redux';
import { updatePlan } from '../redux/ChitietPlanSlice';
import { fetchCaterings, resetCaterings } from '../redux/GetAllCateringSlice';
import { fetchDecorates, resetDecorates } from '../redux/GetAllDecoratesSlice';
import { Hall, resetHall } from '../redux/HallSlice';
import { fetchPresents, resetPresent } from '../redux/GetAllPresentSlice';
import { fetchUserFavorites, resetFavorites } from '../redux/FavoriteDeanAddSlice';
import { AppContext } from '../AppContext';

const { width } = Dimensions.get('window');

const EditPlan = ({ navigation, route }) => {
  const { planId, planData } = route?.params || {};

  const dispatch = useDispatch();
  const { user } = useContext(AppContext);
  const userId = user?._id;

  console.log('Initial planData:', JSON.stringify(planData, null, 2));
  console.log('User ID:', userId);

  const { caterings, cateringStatus, error: cateringError } = useSelector((state) => state.getallcatering);
  const { decorates, decorateStatus, error: decorateError } = useSelector((state) => state.getalldecorates);
  const { HallData, HallStatus, error: hallError } = useSelector((state) => state.hall);
  const { presents, presentStatus, error: presentError } = useSelector((state) => state.getallpresent);
  const { data: favorites, status: favoriteStatus, error: favoriteError } = useSelector((state) => state.favoriteset);

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
  const [totalPrice, setTotalPrice] = useState('0');
  const [sanhId, setSanhId] = useState(planData?.SanhId?._id || '');
  const [selectedSanh, setSelectedSanh] = useState(planData?.SanhId || null);
  const [cateringsList, setCateringsList] = useState(planData?.caterings?.filter(item => item && item._id) || []);
  const [decoratesList, setDecoratesList] = useState(planData?.decorates?.filter(item => item && item._id) || []);
  const [presentsList, setPresentsList] = useState(planData?.presents?.filter(item => item && item._id) || []);

  const [modalVisible, setModalVisible] = useState(false);
  const [currentType, setCurrentType] = useState('');
  const [availableItems, setAvailableItems] = useState([]);
  const [actionType, setActionType] = useState('add');
  const [replaceIndex, setReplaceIndex] = useState(null);
  const [sanhModalVisible, setSanhModalVisible] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showSanhFavorites, setShowSanhFavorites] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState(null); // State để lưu chi tiết item được chọn

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    if (userId) dispatch(fetchUserFavorites(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    const calculateTotalPrice = () => {
      let total = 0;
      total += selectedSanh?.price ? parseFloat(selectedSanh.price) : 0;
      total += cateringsList.reduce((sum, item) => sum + (item?.price ? parseFloat(item.price) : 0), 0);
      total += decoratesList.reduce((sum, item) => sum + (item?.price ? parseFloat(item.price) : 0), 0);
      total += presentsList.reduce((sum, item) => sum + (item?.price ? parseFloat(item.price) : 0), 0);
      setTotalPrice(total.toString());
    };
    calculateTotalPrice();
  }, [cateringsList, decoratesList, presentsList, selectedSanh]);

  const openChangeModal = (type, action = 'add', index = null) => {
    setCurrentType(type);
    setActionType(action);
    setReplaceIndex(index);
    setModalVisible(true);
    setShowFavorites(false);
    setSelectedItemDetail(null); // Reset chi tiết khi mở modal

    if (type === 'caterings') dispatch(fetchCaterings());
    else if (type === 'decorates') dispatch(fetchDecorates());
    else if (type === 'presents') dispatch(fetchPresents());
  };

  const handleChangeSanh = () => {
    setSanhModalVisible(true);
    setShowSanhFavorites(false);
    setSelectedItemDetail(null); // Reset chi tiết khi mở modal
    dispatch(Hall());
    if (userId) dispatch(fetchUserFavorites(userId));
  };

  useEffect(() => {
    if (modalVisible) {
      if (showFavorites && favoriteStatus === 'succeeded') {
        const typeMap = { caterings: 'catering', decorates: 'decorate', presents: 'present' };
        const filteredFavorites = favorites.filter(item => item.type === typeMap[currentType]);
        console.log('Filtered Favorites:', filteredFavorites);
        setAvailableItems(filteredFavorites);
      } else if (currentType === 'caterings' && cateringStatus === 'succeeded') {
        setAvailableItems(caterings);
      } else if (currentType === 'decorates' && decorateStatus === 'succeeded') {
        setAvailableItems(decorates);
      } else if (currentType === 'presents' && presentStatus === 'succeeded') {
        setAvailableItems(presents);
      }
    }

    if (sanhModalVisible) {
      if (showSanhFavorites && favoriteStatus === 'succeeded') {
        const filteredSanhFavorites = favorites.filter(item => item.type === 'Sanh');
        console.log('Filtered Sanh Favorites:', filteredSanhFavorites);
        setAvailableItems(filteredSanhFavorites);
      } else if (HallStatus === 'succeeded') {
        setAvailableItems(HallData);
      }
    }
  }, [
    caterings, cateringStatus, decorates, decorateStatus, presents, presentStatus,
    favorites, favoriteStatus, currentType, showFavorites, HallStatus, HallData,
    sanhModalVisible, showSanhFavorites
  ]);

  useEffect(() => {
    const errors = [
      { status: cateringStatus, error: cateringError, type: 'caterings', label: 'món ăn' },
      { status: decorateStatus, error: decorateError, type: 'decorates', label: 'trang trí' },
      { status: presentStatus, error: presentError, type: 'presents', label: 'quà tặng' },
      { status: HallStatus, error: hallError, type: 'hall', label: 'sảnh' },
      { status: favoriteStatus, error: favoriteError, type: 'favorites', label: 'yêu thích' },
    ];
    errors.forEach(({ status, error, type, label }) => {
      if (status === 'failed' && error && (
        currentType === type || 
        (type === 'hall' && sanhModalVisible) || 
        (type === 'favorites' && (showFavorites || showSanhFavorites))
      )) {
        ToastAndroid.show(`Lỗi khi lấy danh sách ${label}: ${error}`, ToastAndroid.SHORT);
      }
    });
  }, [cateringStatus, cateringError, decorateStatus, decorateError, presentStatus, presentError, HallStatus, hallError, favoriteStatus, favoriteError, currentType, showFavorites, sanhModalVisible, showSanhFavorites]);

  useEffect(() => {
    return () => {
      dispatch(resetCaterings());
      dispatch(resetDecorates());
      dispatch(resetHall());
      dispatch(resetPresent());
      dispatch(resetFavorites());
    };
  }, [dispatch]);

  const handleSelectItem = (item) => {
    if (!item) {
      console.warn('Item không hợp lệ:', item);
      return;
    }

    const normalizedItem = {
      _id: item.itemId || item._id,
      name: item.name || 'Không có tên',
      price: item.price || 0,
      imageUrl: item.imageUrl || item.image || null,
      description: item.description || '',
    };

    console.log('Selected item from modal:', item);
    console.log('Normalized item:', normalizedItem);

    const updateList = (list, setList) => {
      if (actionType === 'add') {
        const newList = [...list, normalizedItem];
        setList(newList);
        console.log(`Updated ${currentType}List:`, newList);
      } else if (actionType === 'replace' && replaceIndex !== null) {
        const newList = [...list];
        newList[replaceIndex] = normalizedItem;
        setList(newList);
        console.log(`Updated ${currentType}List after replace:`, newList);
      }
    };

    if (currentType === 'caterings') updateList(cateringsList, setCateringsList);
    else if (currentType === 'decorates') updateList(decoratesList, setDecoratesList);
    else if (currentType === 'presents') updateList(presentsList, setPresentsList);

    setModalVisible(false);
    setReplaceIndex(null);
    setActionType('add');
  };

  const handleRemoveItem = (type, index) => {
    const updateList = (list, setList) => setList(list.filter((_, i) => i !== index));
    if (type === 'caterings') updateList(cateringsList, setCateringsList);
    else if (type === 'decorates') updateList(decoratesList, setDecoratesList);
    else if (type === 'presents') updateList(presentsList, setPresentsList);
  };

  const handleSelectSanh = (item) => {
    console.log('Selected sanh item:', JSON.stringify(item, null, 2));
    const normalizedSanh = {
      _id: item.itemId || item._id,
      name: item.name || 'Không có tên',
      price: item.price || 0,
      imageUrl: item.imageUrl || item.image || null,
      SoLuongKhach: item.SoLuongKhach || 0,
    };
    console.log('Normalized sanh:', JSON.stringify(normalizedSanh, null, 2));
    setSanhId(normalizedSanh._id);
    setSelectedSanh(normalizedSanh);
    setSanhModalVisible(false);
  };

  const handleSave = () => {
    if (!userId) return ToastAndroid.show('Không tìm thấy thông tin người dùng!', ToastAndroid.SHORT);
    if (!planId) return ToastAndroid.show('Không tìm thấy ID kế hoạch!', ToastAndroid.SHORT);
    if (!name.trim()) return ToastAndroid.show('Tên kế hoạch không được để trống!', ToastAndroid.SHORT);
    if (plansoluongkhach && isNaN(parseInt(plansoluongkhach, 10))) return ToastAndroid.show('Số lượng khách không hợp lệ!', ToastAndroid.SHORT);
    if (planprice && isNaN(parseFloat(planprice))) return ToastAndroid.show('Ngân sách không hợp lệ!', ToastAndroid.SHORT);

    const updateData = {
      UserId: userId,
      name,
      plandateevent: plandateevent.toISOString(),
      plansoluongkhach: parseInt(plansoluongkhach, 10) || undefined,
      planprice: parseFloat(planprice) || undefined,
      totalPrice: parseFloat(totalPrice) || 0,
      SanhId: sanhId || undefined,
      caterings: cateringsList.map(item => item._id).filter(Boolean),
      decorates: decoratesList.map(item => item._id).filter(Boolean),
      presents: presentsList.map(item => item._id).filter(Boolean),
    };

    console.log('Data sent to server:', JSON.stringify(updateData, null, 2));

    dispatch(updatePlan({ planId, updateData }))
      .unwrap()
      .then((updatedPlan) => {
        console.log('API Response (update):', JSON.stringify(updatedPlan, null, 2));
        ToastAndroid.show('Cập nhật kế hoạch thành công!', ToastAndroid.SHORT);

        const combinedPlanData = {
          ...updatedPlan,
          UserId: updatedPlan.UserId || userId,
          SanhId: selectedSanh || updatedPlan.SanhId || null,
          caterings: cateringsList.length > 0 ? cateringsList : updatedPlan.caterings || [],
          decorates: decoratesList.length > 0 ? decoratesList : updatedPlan.decorates || [],
          presents: presentsList.length > 0 ? presentsList : updatedPlan.presents || [],
          plansoluongkhach: updateData.plansoluongkhach || updatedPlan.plansoluongkhach || 0,
          planprice: updateData.planprice || updatedPlan.planprice || 0,
          totalPrice: updateData.totalPrice || updatedPlan.totalPrice || 0,
          plandateevent: updateData.plandateevent || updatedPlan.plandateevent,
          name: updateData.name || updatedPlan.name || 'Kế hoạch không tên',
        };

        console.log('Combined Plan Data:', JSON.stringify(combinedPlanData, null, 2));
        navigation.navigate('DetailPlan', { planId, planData: combinedPlanData });
      })
      .catch((err) => {
        console.error('Update error:', JSON.stringify(err, null, 2));
        ToastAndroid.show(`Lỗi cập nhật kế hoạch: ${err.message || 'Không xác định'}`, ToastAndroid.SHORT);
      });
  };

  const handleViewDetail = (item) => {
    const normalizedItem = {
      _id: item.itemId || item._id,
      name: item.name || 'Không có tên',
      price: item.price || 0,
      imageUrl: item.imageUrl || item.image || null,
      description: item.Description || 'Không có mô tả',
      SoLuongKhach: item.SoLuongKhach || null, // Chỉ dành cho sảnh
    };
    setSelectedItemDetail(normalizedItem); // Hiển thị chi tiết item
  };

  const renderItemList = (items, type) => (
    <View>
      {items.length > 0 ? (
        items.map((item, index) => (
          item && item._id ? (
            <View key={item._id || index} style={styles.itemCard}>
              {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />}
              <View style={styles.itemContent}>
                <Text style={styles.itemText}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')} VNĐ</Text>
                
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity style={styles.replaceButton} onPress={() => openChangeModal(type, 'replace', index)}>
                  <Text style={styles.buttonText}>Thay</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveItem(type, index)}>
                  <Text style={styles.buttonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text key={index} style={styles.noDataText}>Dữ liệu không hợp lệ</Text>
          )
        ))
      ) : (
        <Text style={styles.noDataText}>
          Chưa có {type === 'caterings' ? 'món ăn' : type === 'decorates' ? 'trang trí' : 'quà tặng'}
        </Text>
      )}
      <TouchableOpacity style={styles.changeButton} onPress={() => openChangeModal(type, 'add')}>
        <Text style={styles.buttonText}>
          Thêm {type === 'caterings' ? 'món ăn' : type === 'decorates' ? 'trang trí' : 'quà tặng'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderModalItem = ({ item }) => (
    item ? (
      <View style={styles.modalItem}>
        <TouchableOpacity style={styles.modalItemSelect} onPress={() => handleSelectItem(item)}>
          {(item.imageUrl || item.image) && (
            <Image source={{ uri: item.imageUrl || item.image }} style={styles.modalItemImage} />
          )}
          <View style={styles.modalItemContent}>
            <Text style={styles.modalItemText}>{item.name || 'Không có tên'}</Text>
            <Text style={styles.modalItemPrice}>{item.price?.toLocaleString('vi-VN') || '0'} VNĐ</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.viewButton} onPress={() => handleViewDetail(item)}>
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>
      </View>
    ) : null
  );

  const renderSanhItem = ({ item }) => (
    item ? (
      <View style={styles.modalItem}>
        <TouchableOpacity style={styles.modalItemSelect} onPress={() => handleSelectSanh(item)}>
          {(item.imageUrl || item.image) && (
            <Image source={{ uri: item.imageUrl || item.image }} style={styles.modalItemImage} />
          )}
          <View style={styles.modalItemContent}>
            <Text style={styles.modalItemText}>{item.name || 'Không có tên'}</Text>
            <Text style={styles.modalItemPrice}>{item.price?.toLocaleString('vi-VN') || '0'} VNĐ</Text>
            {item.SoLuongKhach && (
              <Text style={styles.modalItemPrice}>{item.SoLuongKhach}/người</Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.viewButton} onPress={() => handleViewDetail(item)}>
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>
      </View>
    ) : null
  );

  const renderDetailView = () => (
    selectedItemDetail ? (
      <View style={styles.detailContainer}>
        <Text style={styles.detailTitle}>{selectedItemDetail.name}</Text>
        {selectedItemDetail.imageUrl && (
          <Image source={{ uri: selectedItemDetail.imageUrl }} style={styles.detailImage} />
        )}
        <Text style={styles.detailPrice}>{selectedItemDetail.price.toLocaleString('vi-VN')} VNĐ</Text>
        <Text style={styles.detailDescription}>{selectedItemDetail.description}</Text>
        {selectedItemDetail.SoLuongKhach && (
          <Text style={styles.detailCapacity}>Sức chứa: {selectedItemDetail.SoLuongKhach}/người</Text>
        )}
        <TouchableOpacity style={styles.backButtonDetail} onPress={() => setSelectedItemDetail(null)}>
          <Text style={styles.buttonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    ) : null
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6F61" />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chỉnh sửa kế hoạch</Text>
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
                <Text style={styles.input}>{plandateevent.toLocaleDateString('vi-VN')}</Text>
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
                value={totalPrice ? parseFloat(totalPrice).toLocaleString('vi-VN') + ' VNĐ' : '0 VNĐ'}
                editable={false}
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Sảnh:</Text>
              <View style={styles.itemCard}>
                {selectedSanh?.imageUrl && (
                  <Image source={{ uri: selectedSanh.imageUrl }} style={styles.itemImage} />
                )}
                <View style={styles.itemContent}>
                  <Text style={styles.itemText}>{selectedSanh?.name || 'Chưa chọn sảnh'}</Text>
                  <Text style={styles.itemPrice}>
                    {selectedSanh?.price?.toLocaleString('vi-VN') || '0'} VNĐ
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
              {renderItemList(presentsList, 'presents')}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Icon name="content-save" size={20} color="#FFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Lưu thay đổi</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {actionType === 'add' ? 'Thêm' : 'Thay đổi'} {currentType === 'caterings' ? 'món ăn' : currentType === 'decorates' ? 'trang trí' : 'quà tặng'}
            </Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, !showFavorites && styles.activeToggle]}
                onPress={() => setShowFavorites(false)}
              >
                <Text style={styles.toggleText}>Tất cả</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, showFavorites && styles.activeToggle]}
                onPress={() => setShowFavorites(true)}
              >
                <Text style={styles.toggleText}>Yêu thích</Text>
              </TouchableOpacity>
            </View>
            {selectedItemDetail ? (
              renderDetailView()
            ) : (
              <>
                {(currentType === 'caterings' && cateringStatus === 'loading') ||
                (currentType === 'decorates' && decorateStatus === 'loading') ||
                (currentType === 'presents' && presentStatus === 'loading') ||
                (showFavorites && favoriteStatus === 'loading') ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6F61" />
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                  </View>
                ) : availableItems.length > 0 ? (
                  <FlatList
                    data={availableItems}
                    renderItem={renderModalItem}
                    keyExtractor={(item) => item._id || item.itemId || Math.random().toString()}
                    style={styles.modalList}
                  />
                ) : (
                  <Text style={styles.noDataText}>
                    {showFavorites ? 'Không có mục yêu thích nào' : 'Không có dữ liệu để hiển thị'}
                  </Text>
                )}
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Đóng</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal animationType="slide" transparent={true} visible={sanhModalVisible} onRequestClose={() => setSanhModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn sảnh</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, !showSanhFavorites && styles.activeToggle]}
                onPress={() => setShowSanhFavorites(false)}
              >
                <Text style={styles.toggleText}>Tất cả</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, showSanhFavorites && styles.activeToggle]}
                onPress={() => setShowSanhFavorites(true)}
              >
                <Text style={styles.toggleText}>Yêu thích</Text>
              </TouchableOpacity>
            </View>
            {selectedItemDetail ? (
              renderDetailView()
            ) : (
              <>
                {(HallStatus === 'loading' || (showSanhFavorites && favoriteStatus === 'loading')) ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6F61" />
                    <Text style={styles.loadingText}>Đang tải danh sách sảnh...</Text>
                  </View>
                ) : availableItems.length > 0 ? (
                  <FlatList
                    data={availableItems}
                    renderItem={renderSanhItem}
                    keyExtractor={(item) => item._id || item.itemId || Math.random().toString()}
                    style={styles.modalList}
                  />
                ) : (
                  <Text style={styles.noDataText}>
                    {showSanhFavorites ? 'Không có sảnh yêu thích nào' : 'Không có sảnh nào để hiển thị'}
                  </Text>
                )}
                <TouchableOpacity style={styles.closeButton} onPress={() => setSanhModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Đóng</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
  toggleButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#EEE', marginHorizontal: 5 },
  activeToggle: { backgroundColor: '#FF6F61' },
  toggleText: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  homeIcon: { width: 22, height: 22 },
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  },
  planTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  inputRow: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#666', marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#F9F9F9',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  itemImage: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  itemContent: { flex: 1 },
  itemText: { fontSize: 14, color: '#444', fontWeight: '500' },
  itemPrice: { fontSize: 12, color: '#FF6F61', marginTop: 5 },
  itemDescription: { fontSize: 12, color: '#888', marginTop: 5 },
  itemActions: { flexDirection: 'row', marginLeft: 10 },
  replaceButton: { backgroundColor: '#FFB300', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15, marginRight: 5 },
  removeButton: { backgroundColor: '#FF4444', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15 },
  noDataText: { fontSize: 14, color: '#888', fontStyle: 'italic', textAlign: 'center' },
  changeButton: { backgroundColor: '#FFB300', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, alignSelf: 'flex-start' },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
  },
  buttonIcon: { marginRight: 8 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: width * 0.9, backgroundColor: '#FFF', borderRadius: 15, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15, textAlign: 'center' },
  modalList: { flexGrow: 0 },
  modalItem: { 
    flexDirection: 'row', 
    padding: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: '#EEE', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  modalItemSelect: { 
    flexDirection: 'row', 
    flex: 1, 
    alignItems: 'center' 
  },
  modalItemImage: { width: 50, height: 50, borderRadius: 8, marginRight: 10 },
  modalItemContent: { flex: 1 },
  modalItemText: { fontSize: 16, color: '#444', fontWeight: '500' },
  modalItemPrice: { fontSize: 14, color: '#FF6F61', marginTop: 5 },
  viewButton: { 
    backgroundColor: '#2196F3', 
    paddingVertical: 5, 
    paddingHorizontal: 10, 
    borderRadius: 15, 
    marginLeft: 10 
  },
  closeButton: { backgroundColor: '#FF6F61', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, alignSelf: 'center', marginTop: 15 },
  closeButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  loadingContainer: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  detailContainer: { padding: 10 },
  detailTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
  detailImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  detailPrice: { fontSize: 18, color: '#FF6F61', marginBottom: 10, textAlign: 'center' },
  detailDescription: { fontSize: 16, color: '#666', marginBottom: 10, textAlign: 'center' },
  detailCapacity: { fontSize: 16, color: '#666', marginBottom: 10, textAlign: 'center' },
  backButtonDetail: { 
    backgroundColor: '#FFB300', 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 25, 
    alignSelf: 'center' 
  },
});

export default EditPlan;