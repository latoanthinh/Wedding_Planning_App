import socketService from './socketService';

/**
 * Tích hợp SocketService với AppContext
 * Gọi hàm này trong component cấp cao nhất (như App.js) để kết nối 
 * SocketService với AppContext.
 * 
 * @param {object} appContextValue - Giá trị từ AppContext.Provider
 */
export const connectSocketToAppContext = (appContextValue) => {
  if (!appContextValue) {
    console.warn('connectSocketToAppContext: AppContext không được cung cấp');
    return;
  }

  console.log('Kết nối SocketService với AppContext');
  socketService.setAppContext(appContextValue);

  if (!appContextValue.user) {
    console.log('Không có user, bỏ qua khởi tạo socket');
    socketService.disconnect(); // Ngắt kết nối socket nếu không có user
    return;
  }

  if (socketService.isConnected()) {
    console.log('Socket đã kết nối, chỉ cập nhật thông tin user');
    socketService.updateUserInfoFromContext(appContextValue.user);
    return;
  }

  console.log('Khởi tạo SocketService với user từ AppContext');
  socketService.init(appContextValue.user, false);
};

/**
 * Hook cho phép các component con lắng nghe thay đổi của AppContext
 * và cập nhật SocketService khi cần thiết
 * 
 * @param {object} appContext - Context từ useContext(AppContext)
 */
export const useSocketWithAppContext = (appContext) => {
  React.useEffect(() => {
    if (appContext && appContext.user) {
      socketService.updateUserInfoFromContext(appContext.user);
      if (!socketService.isConnected()) {
        console.log('Socket chưa kết nối, khởi tạo lại với user từ AppContext');
        socketService.init(appContext.user, false);
      }
    } else {
      console.log('Không có user trong AppContext, ngắt kết nối socket');
      socketService.disconnect();
    }
  }, [appContext?.user]);

  return socketService;
};

export default { connectSocketToAppContext, useSocketWithAppContext };