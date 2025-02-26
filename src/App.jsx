import React from 'react';
import AppContextProvider from './AppContext';
import AppNavigation from './navigations/Appnavigation';

import TabNavigation from './navigations/TabNavigation';
import { NavigationContainer } from '@react-navigation/native';



function App() {
  return (

    <AppContextProvider>
      <AppNavigation />
    </AppContextProvider>
    
  );
}
// ok


export default App;
