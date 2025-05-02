import React, { useRef, useEffect, useState, useContext } from 'react';
import {
  StyleSheet, View, Text, Animated, Image, TouchableOpacity, ScrollView, StatusBar,
  Dimensions, TextInput, ToastAndroid, Modal, FlatList, ActivityIndicator, Alert
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
import ButtonLoading from '../components/ButtonLoading';
import { BackHandler } from 'react-native';

const { width } = Dimensions.get('window');

const EditPlan = ({ navigation, route }) => {
  const { planId, planData } = route?.params || {};

  const dispatch = useDispatch();
  const { user } = useContext(AppContext);
  const userId = user._id;
  const flatListRef = useRef(null);

  const { caterings, cateringStatus, error: cateringError } = useSelector((state) => state.getallcatering);
  const { decorates, decorateStatus, error: decorateError } = useSelector((state) => state.getalldecorates);
  const { HallData, HallStatus, error: hallError } = useSelector((state) => state.hall);
  const { presents, presentStatus, error: presentError } = useSelector((state) => state.getallpresent);
  const { data: favorites, status: favoriteStatus, error: favoriteError } = useSelector((state) => state.favoriteset);

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [name, setName] = useState(planData?.name || '');
  const [plandateevent, setPlandateevent] = useState(
    planData?.eventDate && !isNaN(new Date(planData.eventDate).getTime())
      ? new Date(planData.eventDate)
      : (planData?.plandateevent && !isNaN(new Date(planData.plandateevent).getTime())
        ? new Date(planData.plandateevent)
        : new Date())
  );
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [plansoluongkhach, setPlansoluongkhach] = useState(
    planData?.guestCount
      ? String(planData.guestCount)
      : (planData?.plansoluongkhach
        ? String(planData.plansoluongkhach)
        : '')
  );
  const [planprice, setPlanprice] = useState(
    planData?.budget
      ? String(planData.budget)
      : (planData?.planprice
        ? String(planData.planprice)
        : '')
  );
  const [totalPrice, setTotalPrice] = useState(0);
  const [sanhId, setSanhId] = useState(planData?.SanhId?._id || '');
  const [selectedSanh, setSelectedSanh] = useState(planData?.SanhId || null);
  const [cateringsList, setCateringsList] = useState(planData?.caterings?.filter(item => item && item._id) || []);
  const [decoratesList, setDecoratesList] = useState(
    planData?.decorates?.filter(item => item && item._id).map(item => ({
      ...item,
      Cate_decorateId: item.Cate_decorateId?._id || item.Cate_decorateId || null,
    })) || []
  );
  const [presentsList, setPresentsList] = useState(
    planData?.presents?.filter(item => item && item._id).map(item => ({
      ...item,
      quantity: item.quantity || 1
    })) || []
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [currentType, setCurrentType] = useState('');
  const [availableItems, setAvailableItems] = useState([]);
  const [actionType, setActionType] = useState('replace');
  const [replaceIndex, setReplaceIndex] = useState(null);
  const [sanhModalVisible, setSanhModalVisible] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showSanhFavorites, setShowSanhFavorites] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);
  const [priceDifference, setPriceDifference] = useState(0);
  const [presentQuantities, setPresentQuantities] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isSaving, setIsSaving] = useState(false);

  const [sanhTotal, setSanhTotal] = useState(0);
  const [cateringTotal, setCateringTotal] = useState(0);
  const [decorateTotal, setDecorateTotal] = useState(0);
  const [presentTotal, setPresentTotal] = useState(0);

  const DECORATE_CATEGORIES = {
    "67c52a1d4a00200b0ab1539a": "Cổng hoa",
    "67c52a274a00200b0ab1539c": "Sân khấu",
    "67c52a3f4a00200b0ab1539e": "Background",
    "67c52a564a00200b0ab153a0": "Pháo hoa - khói",
  };
  const DECORATE_TYPES = Object.values(DECORATE_CATEGORIES);

  const isDecorateLimitReached = () => {
    const currentCateIds = decoratesList.map(item => item.Cate_decorateId).filter(Boolean);
    return Object.keys(DECORATE_CATEGORIES).every(cateId => currentCateIds.includes(cateId));
  };

  const isDecorateTypeExist = (cateId) => {
    return decoratesList.some(item => item.Cate_decorateId === cateId);
  };

  // Hàm kiểm tra dữ liệu hợp lệ
  const isDataValid = () => {
    return (
      userId &&
      planId &&
      name.trim() &&
      !isNaN(parseInt(plansoluongkhach, 10)) &&
      !isNaN(parseFloat(planprice))
    );
  };

  const savePlanOnExit = (navigateAction) => {
    if (!isSaving && isDataValid()) {
      // Hiển thị Alert để hỏi người dùng có muốn lưu trước khi thoát
      Alert.alert(
        'Bạn có muốn lưu trước khi thoát?',
        'Các thay đổi chưa được lưu. Bạn có muốn lưu trước khi thoát không?',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Không lưu',
            onPress: () => {
              if (navigateAction) navigation.dispatch(navigateAction);
            }
          },
          {
            text: 'Lưu',
            onPress: () => {
              const updateData = {
                UserId: userId,
                name,
                plandateevent: plandateevent.toISOString(),
                plansoluongkhach: parseInt(plansoluongkhach, 10) || undefined,
                planprice: parseFloat(planprice) || undefined,
                totalPrice: totalPrice,
                SanhId: sanhId || undefined,
                caterings: cateringsList.map(item => item._id).filter(Boolean),
                decorates: decoratesList.map(item => item._id).filter(Boolean),
                presents: presentsList.map(item => ({
                  id: item._id,
                  quantity: item.quantity || 1
                })).filter(item => item.id),
                isCopy: planData.isCopy || false,
                originalPlanId: planData.originalPlanId || planId,
              };

              if (priceDifference < 0) {
                setConfirmModalVisible(true);
                return;
              }

              setIsSaving(true);
              dispatch(updatePlan({ planId, updateData }))
                .unwrap()
                .then((updatedPlan) => {
                  ToastAndroid.show('Đã lưu kế hoạch!', ToastAndroid.SHORT);
                  const combinedPlanData = {
                    ...updatedPlan,
                    UserId: updatedPlan.UserId || userId,
                    SanhId: selectedSanh || updatedPlan.SanhId || null,
                    caterings: cateringsList.length > 0 ? cateringsList : updatedPlan.caterings || [],
                    decorates: decoratesList.length > 0 ? decoratesList : updatedPlan.decorates || [],
                    presents: presentsList.length > 0 ? presentsList : updatedPlan.presents || [],
                    plansoluongkhach: updateData.plansoluongkhach || updatedPlan.plansoluongkhach || 0,
                    planprice: updateData.planprice || updatedPlan.planprice || 0,
                    totalPrice: totalPrice,
                    plandateevent: updateData.plandateevent || updatedPlan.plandateevent,
                    name: updateData.name || updatedPlan.name || 'Kế hoạch không tên',
                    eventDate: planData.eventDate,
                    guestCount: planData.guestCount,
                    budget: planData.budget,
                    priceDifference: updatedPlan.priceDifference || priceDifference,
                    isCopy: updateData.isCopy,
                    originalPlanId: updateData.originalPlanId,
                  };
                  navigation.navigate('DetailPlan', { planId, planData: combinedPlanData });
                })
                .catch((err) => {
                  console.error('Error saving plan on exit:', err);
                  ToastAndroid.show(`Lỗi lưu khi thoát: ${err.message || err}`, ToastAndroid.SHORT);
                  if (navigateAction) navigation.dispatch(navigateAction);
                })
                .finally(() => {
                  setIsSaving(false);
                });
            }
          }
        ]
      );
      return false; // Ngăn thoát để hiển thị Alert
    }
    return true; // Cho phép thoát nếu không cần lưu
  };

  // Xử lý nút back của ứng dụng
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isSaving && isDataValid()) {
        // Ngăn hành động thoát mặc định
        e.preventDefault();
        // Hiển thị xác nhận lưu
        savePlanOnExit(e.data.action);
      }
      // Nếu không có dữ liệu hợp lệ, cho phép thoát mặc định
    });
    return unsubscribe;
  }, [
    isSaving,
    name,
    plandateevent,
    plansoluongkhach,
    planprice,
    totalPrice,
    sanhId,
    cateringsList,
    decoratesList,
    presentsList,
    userId,
    planId,
    navigation,
    dispatch,
    planData.isCopy,
    planData.originalPlanId,
    priceDifference
  ]);

  // Xử lý nút back vật lý trên Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return !savePlanOnExit(); // Trả về true để ngăn hành động back, false để cho phép
    });
    return () => backHandler.remove();
  }, [
    isSaving,
    name,
    plandateevent,
    plansoluongkhach,
    planprice,
    totalPrice,
    sanhId,
    cateringsList,
    decoratesList,
    presentsList,
    userId,
    planId,
    navigation,
    dispatch,
    planData.isCopy,
    planData.originalPlanId,
    priceDifference
  ]);

  useEffect(() => {
    if (modalVisible) {
      let items = [];
      if (showFavorites && favoriteStatus === 'succeeded') {
        const typeMap = { caterings: 'catering', decorates: 'decorate', presents: 'present' };
        items = Array.from(
          new Map(
            favorites.filter(item => item.type === typeMap[currentType]).map(item => [item._id, item])
          ).values()
        );
      } else if (currentType === 'caterings' && cateringStatus === 'succeeded') {
        items = Array.from(new Map(caterings.map(item => [item._id, item])).values());
      } else if (currentType === 'decorates' && decorateStatus === 'succeeded') {
        items = Array.from(
          new Map(
            decorates.map(item => [item._id, {
              ...item,
              Cate_decorateId: item.Cate_decorateId?._id || item.Cate_decorateId || null,
            }])
          ).values()
        );
      } else if (currentType === 'presents' && presentStatus === 'succeeded') {
        items = Array.from(new Map(presents.map(item => [item._id, item])).values());
      }
      setAvailableItems(items);
    }
  }, [caterings, cateringStatus, decorates, decorateStatus, presents, presentStatus, favorites, favoriteStatus, currentType, showFavorites, HallStatus, HallData, sanhModalVisible, showSanhFavorites]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    if (userId) dispatch(fetchUserFavorites(userId));
  }, [dispatch, userId]);

  useEffect(() => {
    const calculateTotals = () => {
      const sanhPrice = selectedSanh?.price ? parseFloat(selectedSanh.price) : 0;
      setSanhTotal(sanhPrice);

      const guestCount = parseInt(plansoluongkhach, 10) || 0;
      const cateringTotal = cateringsList.reduce((sum, item) => {
        const price = item?.price ? parseFloat(item.price) : 0;
        return sum + (price * (guestCount / 10));
      }, 0);
      setCateringTotal(cateringTotal);

      const decorateTotal = decoratesList.reduce((sum, item) => {
        const price = item?.price ? parseFloat(item.price) : 0;
        return sum + price;
      }, 0);
      setDecorateTotal(decorateTotal);

      const presentTotal = presentsList.reduce((sum, item) => {
        const price = item?.price ? parseFloat(item.price) : 0;
        const quantity = item?.quantity ? parseInt(item.quantity, 10) : 1;
        return sum + price * quantity;
      }, 0);
      setPresentTotal(presentTotal);

      const total = sanhPrice + cateringTotal + decorateTotal + presentTotal;
      setTotalPrice(total);

      const budget = parseFloat(planprice) || 0;
      const difference = budget - total;
      setPriceDifference(difference);
    };
    calculateTotals();
  }, [cateringsList, decoratesList, presentsList, selectedSanh, plansoluongkhach, planprice]);

  const openChangeModal = (type, action = 'replace', index = null) => {
    setCurrentType(type);
    setActionType(type === 'presents' ? action : 'replace');
    setReplaceIndex(index);
    setModalVisible(true);
    setShowFavorites(false);
    setSelectedItemDetail(null);
    setPresentQuantities({});

    if (type === 'caterings') {
      setSelectedItems([...cateringsList]);
      dispatch(fetchCaterings());
    } else if (type === 'decorates') {
      setSelectedItems([...decoratesList]);
      dispatch(fetchDecorates());
    } else if (type === 'presents') {
      if (action === 'replace' && index !== null) {
        setSelectedItems([presentsList[index]]);
      } else {
        setSelectedItems([]);
      }
      dispatch(fetchPresents());
    }
  };

  const handleChangeSanh = () => {
    setSanhModalVisible(true);
    setShowSanhFavorites(false);
    setSelectedItemDetail(null);
    dispatch(Hall());
    if (userId) dispatch(fetchUserFavorites(userId));
  };

  useEffect(() => {
    if (modalVisible) {
      let items = [];
      if (showFavorites && favoriteStatus === 'succeeded') {
        const typeMap = { caterings: 'catering', decorates: 'decorate', presents: 'present' };
        items = Array.from(
          new Map(
            favorites.filter(item => item.type === typeMap[currentType]).map(item => [item._id, item])
          ).values()
        );
      } else if (currentType === 'caterings' && cateringStatus === 'succeeded') {
        items = Array.from(new Map(caterings.map(item => [item._id, item])).values());
      } else if (currentType === 'decorates' && decorateStatus === 'succeeded') {
        items = Array.from(new Map(decorates.map(item => [item._id, {
          ...item,
          Cate_decorateId: item.Cate_decorateId || null,
        }])).values());
      } else if (currentType === 'presents' && presentStatus === 'succeeded') {
        items = Array.from(new Map(presents.map(item => [item._id, item])).values());
      }
      setAvailableItems(items);
    }

    if (sanhModalVisible && HallStatus === 'succeeded') {
      const sanhItems = showSanhFavorites && favoriteStatus === 'succeeded'
        ? Array.from(new Map(favorites.filter(item => item.type === 'Sanh').map(item => [item._id, item])).values())
        : Array.from(new Map(HallData.map(item => [item._id, item])).values());
      setAvailableItems(sanhItems);
    }
  }, [caterings, cateringStatus, decorates, decorateStatus, presents, presentStatus, favorites, favoriteStatus, currentType, showFavorites, HallStatus, HallData, sanhModalVisible, showSanhFavorites]);

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
    if (!item) return;

    const normalizedItem = {
      _id: item.itemId || item._id,
      name: item.name || 'Không có tên',
      price: item.price || 0,
      imageUrl: item.imageUrl || item.image || null,
      description: item.description || '',
      Cate_decorateId: item.Cate_decorateId?._id || item.Cate_decorateId || null,
      ...(currentType === 'presents' && {
        quantity: parseInt(presentQuantities[item._id] || '1') || 1,
      }),
    };

    if (currentType === 'caterings' || currentType === 'decorates') {
      const isSelected = selectedItems.some((selected) => selected._id === normalizedItem._id);
      if (isSelected) {
        setSelectedItems(selectedItems.filter((selected) => selected._id !== normalizedItem._id));
      } else {
        if (currentType === 'decorates') {
          if (!normalizedItem.Cate_decorateId) {
            ToastAndroid.show('Dữ liệu trang trí không hợp lệ: Thiếu Cate_decorateId!', ToastAndroid.SHORT);
            return;
          }
          const isCateDuplicate = selectedItems.some(
            (selected) => selected.Cate_decorateId === normalizedItem.Cate_decorateId
          );
          if (isCateDuplicate) {
            ToastAndroid.show(
              `Loại "${DECORATE_CATEGORIES[normalizedItem.Cate_decorateId] || normalizedItem.name}" đã được chọn. Vui lòng chọn loại khác!`,
              ToastAndroid.SHORT
            );
            return;
          }
          if (selectedItems.length >= DECORATE_TYPES.length) {
            ToastAndroid.show(
              'Đã đủ số lượng trang trí tối đa (Cổng hoa, Sân khấu, Background, Pháo hoa - khói)!',
              ToastAndroid.SHORT
            );
            return;
          }
        }
        setSelectedItems([...selectedItems, normalizedItem]);
      }
    } else if (currentType === 'presents') {
      const updateList = (list, setList) => {
        const existingIndex = list.findIndex((existing) => existing._id === normalizedItem._id);
        if (actionType === 'add') {
          if (existingIndex !== -1) {
            ToastAndroid.show(
              `Món "${normalizedItem.name}" đã có trong danh sách. Vui lòng chọn món khác!`,
              ToastAndroid.SHORT
            );
            return;
          }
          setList([...list, normalizedItem]);
          setModalVisible(false);
        } else if (actionType === 'replace' && replaceIndex !== null) {
          const newList = [...list];
          const existingQuantity = list[replaceIndex]?.quantity || 1;
          newList[replaceIndex] = { ...normalizedItem, quantity: existingQuantity };
          setList(newList);
          setModalVisible(false);
        }
      };
      updateList(presentsList, setPresentsList);
    }

    setReplaceIndex(null);
    if (currentType === 'presents') setActionType('add');
  };

  const confirmSelection = () => {
    if (currentType === 'caterings') {
      setCateringsList(selectedItems);
    } else if (currentType === 'decorates') {
      setDecoratesList(selectedItems);
    }
    setModalVisible(false);
    setSelectedItems([]);
  };

  const handleRemoveItem = (type, index) => {
    const updateList = (list, setList) => setList(list.filter((_, i) => i !== index));
    if (type === 'caterings') updateList(cateringsList, setCateringsList);
    else if (type === 'decorates') updateList(decoratesList, setDecoratesList);
    else if (type === 'presents') updateList(presentsList, setPresentsList);
  };

  const handleSelectSanh = (item) => {
    const normalizedSanh = {
      _id: item.itemId || item._id,
      name: item.name || 'Không có tên',
      price: item.price || 0,
      imageUrl: item.imageUrl || item.image || null,
      SoLuongKhach: item.SoLuongKhach || 0,
    };
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
      totalPrice: totalPrice,
      SanhId: sanhId || undefined,
      caterings: cateringsList.map(item => item._id).filter(Boolean),
      decorates: decoratesList.map(item => item._id).filter(Boolean),
      presents: presentsList.map(item => ({
        id: item._id,
        quantity: item.quantity || 1
      })).filter(item => item.id),
      isCopy: planData.isCopy || false,
      originalPlanId: planData.originalPlanId || planId,
    };

    if (priceDifference < 0) {
      setConfirmModalVisible(true);
    } else {
      savePlan(updateData);
    }
  };

  const savePlan = (updateData) => {
    setIsSaving(true);
    dispatch(updatePlan({ planId, updateData }))
      .unwrap()
      .then((updatedPlan) => {
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
          totalPrice: totalPrice,
          plandateevent: updateData.plandateevent || updatedPlan.plandateevent,
          name: updateData.name || updatedPlan.name || 'Kế hoạch không tên',
          eventDate: planData.eventDate,
          guestCount: planData.guestCount,
          budget: planData.budget,
          priceDifference: updatedPlan.priceDifference || priceDifference,
          isCopy: updateData.isCopy,
          originalPlanId: updateData.originalPlanId,
        };
        setIsSaving(false);
        navigation.navigate('DetailPlan', { planId, planData: combinedPlanData });
      })
      .catch((err) => {
        setIsSaving(false);
        ToastAndroid.show(`Lỗi cập nhật kế hoạch: ${err.message || err}`, ToastAndroid.SHORT);
      });
  };

  const handleViewDetail = (item) => {
    const normalizedItem = {
      _id: item.itemId || item._id,
      name: item.name || 'Không có tên',
      price: item.price || 0,
      imageUrl: item.imageUrl || item.image || null,
      description: item.Description || 'Không có mô tả',
      SoLuongKhach: item.SoLuongKhach || null,
    };
    setSelectedItemDetail(normalizedItem);
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    const updatedPresents = [...presentsList];
    const quantity = parseInt(newQuantity) || 1;
    updatedPresents[index] = { ...updatedPresents[index], quantity };
    setPresentsList(updatedPresents);
  };

  const renderItemList = (items, type, total) => (
    <View>
      {items.length > 0 ? (
        items.map((item, index) => {
          const uniqueKey = `${type}-${item._id}-${index}`;
          return item && item._id ? (
            <View key={uniqueKey} style={styles.itemCard}>
              {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />}
              <View style={styles.itemContent}>
                <Text style={styles.itemText}>{item.name}</Text>
                <Text style={styles.itemPrice}>
                  {item.price.toLocaleString('vi-VN')} VNĐ {type === 'presents' ? `x ${item.quantity || 1}` : ''}
                </Text>
                {type === 'presents' && (
                  <TextInput
                    style={styles.quantityInput}
                    value={String(item.quantity || 1)}
                    onChangeText={(text) => handleUpdateQuantity(index, text)}
                    keyboardType="numeric"
                    placeholder="Số lượng"
                  />
                )}
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
            <Text key={`${type}-invalid-${index}`} style={styles.noDataText}>Dữ liệu không hợp lệ</Text>
          );
        })
      ) : (
        <Text style={styles.noDataText}>
          Chưa chọn {type === 'caterings' ? 'món ăn' : type === 'decorates' ? 'trang trí' : 'quà tặng'}
        </Text>
      )}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Tổng chi phí {type === 'caterings' ? 'món ăn' : type === 'decorates' ? 'trang trí' : 'quà tặng'}:</Text>
        <Text style={styles.totalValue}>{total.toLocaleString('vi-VN')} VNĐ</Text>
      </View>
      <TouchableOpacity style={styles.changeButton} onPress={() => openChangeModal(type, 'replace')}>
        <Text style={styles.buttonText}>
          Thay đổi {type === 'caterings' ? 'món ăn' : type === 'decorates' ? 'trang trí' : 'quà tặng'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSanhSection = () => (
    <View>
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
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Tổng chi phí sảnh:</Text>
        <Text style={styles.totalValue}>{sanhTotal.toLocaleString('vi-VN')} VNĐ</Text>
      </View>
      <TouchableOpacity style={styles.changeButton} onPress={handleChangeSanh}>
        <Text style={styles.buttonText}>Thay đổi sảnh</Text>
      </TouchableOpacity>
    </View>
  );

  const renderModalItem = ({ item }) => (
    item ? (
      <TouchableOpacity
        style={[
          styles.modalItem,
          selectedItems.some((selected) => selected._id === item._id) && styles.modalItemSelected,
        ]}
        activeOpacity={0.7}
        onPress={() => handleSelectItem(item)}
      >
        <View style={styles.modalItemSelect}>
          {(item.imageUrl || item.image) && (
            <Image source={{ uri: item.imageUrl || item.image }} style={styles.modalItemImage} />
          )}
          <View style={styles.modalItemContent}>
            <Text style={styles.modalItemText}>{item.name || 'Không có tên'}</Text>
            <Text style={styles.modalItemPrice}>{item.price?.toLocaleString('vi-VN') || '0'} VNĐ</Text>
            {(currentType === 'caterings' || currentType === 'decorates') && (
              <View style={styles.checkboxContainer}>
                <Icon
                  name={selectedItems.some((selected) => selected._id === item._id) ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={20}
                  color={selectedItems.some((selected) => selected._id === item._id) ? '#007AFF' : '#666666'}
                />
              </View>
            )}
            {currentType === 'presents' && (
              <View style={styles.quantityInputContainer}>
                <Text style={styles.quantityLabel}>Số lượng:</Text>
                <TextInput
                  style={styles.smallQuantityInput}
                  value={presentQuantities[item._id] || '1'}
                  onChangeText={(text) => setPresentQuantities({
                    ...presentQuantities,
                    [item._id]: text
                  })}
                  keyboardType="numeric"
                  placeholder="1"
                />
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.viewButton} onPress={() => handleViewDetail(item)}>
          <Icon name="eye" size={18} color="#FFF" />
        </TouchableOpacity>
      </TouchableOpacity>
    ) : null
  );

  const renderSanhItem = ({ item }) => (
    item ? (
      <TouchableOpacity
        style={styles.modalItem}
        activeOpacity={0.7}
        onPress={() => handleSelectSanh(item)}
      >
        <View style={styles.modalItemSelect}>
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
        </View>
        <TouchableOpacity style={styles.viewButton} onPress={() => handleViewDetail(item)}>
          <Icon name="eye" size={18} color="#FFF" />
        </TouchableOpacity>
      </TouchableOpacity>
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={22} color="#000000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chỉnh sửa kế hoạch</Text>
            <View style={{ width: 22 }} />
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
                onChangeText={(text) => {
                  const cleanedText = text.replace(/[^0-9]/g, '');
                  const newGuestCount = parseInt(cleanedText, 10) || 0;
                  const maxCapacity = selectedSanh?.SoLuongKhach ? parseInt(selectedSanh.SoLuongKhach, 10) : Infinity;

                  if (newGuestCount > maxCapacity) {
                    ToastAndroid.show(
                      `Số lượng khách không được vượt quá sức chứa của sảnh (${maxCapacity} người)!`,
                      ToastAndroid.SHORT
                    );
                    setPlansoluongkhach(plansoluongkhach || '');
                  } else {
                    setPlansoluongkhach(cleanedText);
                  }
                }}
                placeholder="Nhập số lượng khách"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Ngân sách:</Text>
              <TextInput
                style={styles.input}
                value={planprice ? parseFloat(planprice).toLocaleString('vi-VN') + ' VNĐ' : ''}
                onChangeText={(text) => setPlanprice(text.replace(/[^0-9]/g, ''))}
                placeholder="Nhập ngân sách (VNĐ)"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.label}>Tổng giá:</Text>
              <TextInput
                style={styles.input}
                value={totalPrice.toLocaleString('vi-VN') + ' VNĐ'}
                editable={false}
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.label}>Chênh lệch:</Text>
              <Text
                style={[
                  styles.input,
                  {
                    color: priceDifference > 0 ? '#4CAF50' : priceDifference < 0 ? '#FF4444' : '#666',
                    fontWeight: 'bold',
                  }
                ]}
              >
                {priceDifference.toLocaleString('vi-VN')} VNĐ
              </Text>
            </View>

            <View style={styles.divider} />
            <View style={styles.inputRow}>
              <Text style={styles.label}>Sảnh:</Text>
              {renderSanhSection()}
            </View>
            <View style={styles.divider} />
            <View style={styles.inputRow}>
              <Text style={styles.label}>Dịch vụ ăn uống:</Text>
              {renderItemList(cateringsList, 'caterings', cateringTotal)}
            </View>
            <View style={styles.divider} />
            <View style={styles.inputRow}>
              <Text style={styles.label}>Trang trí:</Text>
              {renderItemList(decoratesList, 'decorates', decorateTotal)}
            </View>
            <View style={styles.divider} />
            <View style={styles.inputRow}>
              <Text style={styles.label}>Quà tặng:</Text>
              {renderItemList(presentsList, 'presents', presentTotal)}
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.persistentBottomBar}>
        <View style={styles.bottomBarPriceInfo}>
          <View style={styles.bottomBarPriceRow}>
            <Text style={styles.bottomBarPriceLabel}>Ngân sách:</Text>
            <Text style={styles.bottomBarPriceValue}>{parseFloat(planprice || 0).toLocaleString('vi-VN')} VNĐ</Text>
          </View>
          <View style={styles.bottomBarPriceRow}>
            <Text style={styles.bottomBarPriceLabel}>Tổng chi phí:</Text>
            <Text style={styles.bottomBarPriceValue}>{totalPrice.toLocaleString('vi-VN')} VNĐ</Text>
          </View>
          <View style={styles.bottomBarPriceRow}>
            <Text style={styles.bottomBarPriceLabel}>Chênh lệch:</Text>
            <View style={styles.differenceContainer}>
              <Icon
                name={priceDifference >= 0 ? "arrow-down-bold" : "arrow-up-bold"}
                size={13}
                color={priceDifference > 0 ? '#4CAF50' : priceDifference < 0 ? '#FF4444' : '#000000'}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.bottomBarPriceValue,
                  { color: priceDifference > 0 ? '#4CAF50' : priceDifference < 0 ? '#FF4444' : '#000000' }
                ]}
              >
                {priceDifference.toLocaleString('vi-VN')} VNĐ
              </Text>
            </View>
          </View>
        </View>
        <ButtonLoading
          text="Lưu thay đổi"
          loading={isSaving}
          disabled={isSaving}
          onPress={handleSave}
          style={styles.saveBottomBarButton}
          textStyle={styles.bottomBarButtonText}
          color="primary"
          size="medium"
        />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Thay đổi {currentType === 'caterings' ? 'món ăn' : currentType === 'decorates' ? 'trang trí' : 'quà tặng'}
            </Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, !showFavorites && styles.activeToggle]}
                onPress={() => setShowFavorites(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.toggleText, !showFavorites && styles.activeToggleText]}>Tất cả</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, showFavorites && styles.activeToggle]}
                onPress={() => setShowFavorites(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.toggleText, showFavorites && styles.activeToggleText]}>Yêu thích</Text>
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
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                  </View>
                ) : availableItems.length > 0 ? (
                  <FlatList
                    data={availableItems}
                    renderItem={renderModalItem}
                    keyExtractor={(item, index) => `${currentType}-${item._id || item.itemId || 'item'}-${index}`}
                    style={styles.modalList}
                    ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                  />
                ) : (
                  <Text style={styles.noDataText}>
                    {showFavorites ? 'Không có mục yêu thích nào' : 'Không có dữ liệu để hiển thị'}
                  </Text>
                )}
                <View style={styles.modalButtonContainer}>
                  {(currentType === 'caterings' || currentType === 'decorates') && (
                    <TouchableOpacity style={styles.confirmButton} onPress={confirmSelection}>
                      <Text style={styles.modalButtonText}>Xác nhận</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                    <Text style={styles.modalButtonText}>Đóng</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={sanhModalVisible}
        onRequestClose={() => setSanhModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn sảnh</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, !showSanhFavorites && styles.activeToggle]}
                onPress={() => setShowSanhFavorites(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.toggleText, !showSanhFavorites && styles.activeToggleText]}>Tất cả</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, showSanhFavorites && styles.activeToggle]}
                onPress={() => setShowSanhFavorites(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.toggleText, showSanhFavorites && styles.activeToggleText]}>Yêu thích</Text>
              </TouchableOpacity>
            </View>
            {selectedItemDetail ? (
              renderDetailView()
            ) : (
              <>
                {(HallStatus === 'loading' || (showSanhFavorites && favoriteStatus === 'loading')) ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Đang tải danh sách sảnh...</Text>
                  </View>
                ) : availableItems.length > 0 ? (
                  <FlatList
                    data={availableItems}
                    renderItem={renderSanhItem}
                    keyExtractor={(item, index) => `sanh-${item._id || item.itemId || 'sanh'}-${index}`}
                    style={styles.modalList}
                    ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                  />
                ) : (
                  <Text style={styles.noDataText}>
                    {showSanhFavorites ? 'Không có sảnh yêu thích nào' : 'Không có sảnh nào để hiển thị'}
                  </Text>
                )}
                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity style={styles.closeButton} onPress={() => setSanhModalVisible(false)}>
                    <Text style={styles.modalButtonText}>Đóng</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>Xác nhận lưu kế hoạch</Text>
            <Text style={styles.confirmModalText}>
              Tổng chi phí vượt ngân sách {Math.abs(priceDifference).toLocaleString('vi-VN')} VNĐ.
              Bạn có chắc chắn muốn lưu?
            </Text>
            <View style={styles.confirmButtonContainer}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.confirmButtonText}>Không</Text>
              </TouchableOpacity>
              <ButtonLoading
                text="Đồng ý"
                loading={isSaving}
                disabled={isSaving}
                style={[styles.confirmButton, styles.confirmSaveButton]}
                textStyle={styles.confirmButtonText}
                onPress={() => {
                  setConfirmModalVisible(false);
                  setIsSaving(true);
                  const updateData = {
                    UserId: userId,
                    name,
                    plandateevent: plandateevent.toISOString(),
                    plansoluongkhach: parseInt(plansoluongkhach, 10) || undefined,
                    planprice: parseFloat(planprice) || undefined,
                    totalPrice: totalPrice,
                    SanhId: sanhId || undefined,
                    caterings: cateringsList.map(item => item._id).filter(Boolean),
                    decorates: decoratesList.map(item => item._id).filter(Boolean),
                    presents: presentsList.map(item => ({
                      id: item._id,
                      quantity: item.quantity || 1
                    })).filter(item => item.id),
                    isCopy: planData.isCopy || false,
                    originalPlanId: planData.originalPlanId || planId,
                  };
                  dispatch(updatePlan({ planId, updateData }))
                    .unwrap()
                    .then((updatedPlan) => {
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
                        totalPrice: totalPrice,
                        plandateevent: updateData.plandateevent || updatedPlan.plandateevent,
                        name: updateData.name || updatedPlan.name || 'Kế hoạch không tên',
                        eventDate: planData.eventDate,
                        guestCount: planData.guestCount,
                        budget: planData.budget,
                        priceDifference: updatedPlan.priceDifference || priceDifference,
                        isCopy: updateData.isCopy,
                        originalPlanId: updateData.originalPlanId,
                      };
                      setIsSaving(false);
                      navigation.navigate('DetailPlan', { planId, planData: combinedPlanData });
                    })
                    .catch((err) => {
                      setIsSaving(false);
                      ToastAndroid.show(`Lỗi cập nhật kế hoạch: ${err.message || err}`, ToastAndroid.SHORT);
                    });
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  confirmModalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 15,
  },
  confirmModalText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#666666',
  },
  confirmSaveButton: {
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 25,
    padding: 4,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeToggle: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 15,
    color: '#333333',
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  planInfoCard: {
    padding: 0,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 20,
  },
  inputRow: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    padding: 12,
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
    color: '#000000',
  },
  itemPrice: {
    fontSize: 12,
    color: '#000000',
    marginTop: 5,
  },
  itemActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  replaceButton: {
    backgroundColor: '#000000',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 5,
  },
  removeButton: {
    backgroundColor: '#333333',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  noDataText: {
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
  changeButton: {
    backgroundColor: '#000000',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxHeight: '85%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalList: {
    flexGrow: 0,
    marginBottom: 10,
  },
  modalItem: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalItemSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  modalItemSelect: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  modalItemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
  },
  modalItemContent: {
    flex: 1,
  },
  modalItemText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  modalItemPrice: {
    fontSize: 14,
    color: '#333333',
    marginTop: 4,
  },
  viewButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginHorizontal: 8,
    flex: 1,
  },
  closeButton: {
    backgroundColor: '#666666',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginHorizontal: 8,
    flex: 1,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  itemSeparator: {
    height: 8,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333333',
  },
  detailContainer: {
    padding: 10,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  detailImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  detailPrice: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  detailDescription: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
    textAlign: 'center',
  },
  detailCapacity: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 12,
    textAlign: 'center',
  },
  backButtonDetail: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignSelf: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 20,
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityLabel: {
    fontSize: 14,
    color: '#333333',
    marginRight: 8,
  },
  smallQuantityInput: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 6,
    padding: 6,
    width: 50,
    fontSize: 14,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 6,
    padding: 6,
    width: 60,
    fontSize: 14,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    marginTop: 8,
  },
  persistentBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    height: 80,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomBarPriceInfo: {
    flex: 1,
    paddingRight: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    padding: 8,
  },
  bottomBarPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bottomBarPriceLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  bottomBarPriceValue: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '600',
  },
  saveBottomBarButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    backgroundColor: '#000000',
    flex: 1,
    maxWidth: 140,
  },
  bottomBarButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  differenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  checkboxContainer: {
    marginTop: 8,
  },
});

export default EditPlan;