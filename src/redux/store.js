import { configureStore } from '@reduxjs/toolkit';
import  HallReducer  from './HallSlice';
import  ClothesReducer  from './ClothesSlice';
import  FlowersReducer  from './FlowersSlice';
import  LoginReducer  from './LoginSlice';
import  RegisterReducer  from './RegisterSlice';
import  ChitietsanphamReducer  from './ChitietsanphamSlice';
import  ChitietFlowersReducer  from './ChitietFlowersSlice';



const dummyReducer = (state = {}) => state;


export const store = configureStore({
  reducer: {
    chitietflowers:ChitietFlowersReducer,
    flowers: FlowersReducer,
    chitiet : ChitietsanphamReducer,
    register: RegisterReducer,
    login : LoginReducer,
    clothes : ClothesReducer,
    hall : HallReducer,
    dummy: dummyReducer,
  },
});
