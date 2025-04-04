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
  
  // Cập nhật SocketService khi user trong AppContext thay đổi
  if (appContextValue.user) {
    console.log('Khởi tạo SocketService với user từ AppContext');
    socketService.init(appContextValue.user, false);
  }
};

/**
 * Hook cho phép các component con lắng nghe thay đổi của AppContext
 * và cập nhật SocketService khi cần thiết
 * 
 * @param {object} appContext - Context từ useContext(AppContext)
 */
export const useSocketWithAppContext = (appContext) => {
  // Cập nhật SocketService khi AppContext thay đổi
  if (appContext && appContext.user) {
    socketService.updateUserInfoFromContext(appContext.user);
  }
  
  return socketService;
};

export default { connectSocketToAppContext, useSocketWithAppContext }; 