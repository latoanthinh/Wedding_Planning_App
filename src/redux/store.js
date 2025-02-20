import { configureStore } from '@reduxjs/toolkit';
import  HallReducer  from './HallSlice';
import  ClothesReducer  from './ClothesSlice';
const dummyReducer = (state = {}) => state;


export const store = configureStore({
  reducer: {
    clothes : ClothesReducer,
    hall : HallReducer,
    dummy: dummyReducer,
  },
});
