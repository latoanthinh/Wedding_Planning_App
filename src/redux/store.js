import { configureStore } from '@reduxjs/toolkit';
import  HallReducer  from './HallSlice';
import  ClothesReducer  from './ClothesSlice';
import  LoginReducer  from './LoginSlice';
import  RegisterReducer  from './RegisterSlice';
const dummyReducer = (state = {}) => state;


export const store = configureStore({
  reducer: {
    register: RegisterReducer,
    login : LoginReducer,
    clothes : ClothesReducer,
    hall : HallReducer,
    dummy: dummyReducer,
  },
});
