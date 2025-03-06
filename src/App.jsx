import React from 'react';
import AppContextProvider from './AppContext';
import AppNavigation from './navigations/Appnavigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  return (
    <SafeAreaProvider>
      <AppContextProvider>
        <AppNavigation />
      </AppContextProvider>
    </SafeAreaProvider>
  );
}
export default App;
