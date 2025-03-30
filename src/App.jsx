import React from 'react';
import { AppContextProvider } from './AppContext';
import AppNavigation from './navigations/Appnavigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppInit from './components/AppInit';

function App() {
  return (
    <SafeAreaProvider>
      <AppContextProvider>
        <AppInit />
        <AppNavigation />
      </AppContextProvider>
    </SafeAreaProvider>
  );
}
export default App;
