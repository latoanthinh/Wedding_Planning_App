import { useEffect } from 'react';
import { BackHandler } from 'react-native';

export const useBackHandler = (navigation, routeName, options = {}) => {
  useEffect(() => {
    const backAction = () => {
      const navState = navigation.getState();
      const routeIndex = navState.routes.findIndex(route => route.name === routeName);

      if (routeIndex !== -1) {
        const { screen } = options;
        navigation.navigate(routeName, screen ? { screen } : undefined);
        return true;
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      backHandler.remove();
    };
  }, [navigation, routeName, options]);
};