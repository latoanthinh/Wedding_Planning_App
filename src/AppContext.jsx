import React from 'react'
import { Provider } from 'react-redux';
import { store } from './redux/store';

import { useContext, useState, createContext } from 'react'
const AppContext = createContext();

function AppContextProvider(props) {
    const { children } = props
    const [user, setUser] = useState(null);



    return (
        <AppContext.Provider value={{ user, setUser }} >
            <Provider store={store}>
                {children}
            </Provider>
        </AppContext.Provider>
    );
}

export default AppContextProvider;
export { AppContext }

