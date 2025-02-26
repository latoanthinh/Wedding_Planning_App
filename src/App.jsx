import React from 'react';
import AppContextProvider from './AppContext';
import AppNavigation from './navigations/Appnavigation';

function App() {
  return (

    <AppContextProvider>
      <AppNavigation />
    </AppContextProvider>

  );
}
export default App;
