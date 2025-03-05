import { configureStore } from '@reduxjs/toolkit';
import  HallReducer  from './HallSlice';
import  ClothesReducer  from './ClothesSlice';
import  FlowersReducer  from './FlowersSlice';
import  LoginReducer  from './LoginSlice';
import  RegisterReducer  from './RegisterSlice';
import  ChitietsanphamReducer  from './ChitietsanphamSlice';
import  ChitietFlowersReducer  from './ChitietFlowersSlice';
import  HallTheoWeddingHallsReducer  from './HallTheoWeddingHallsSlice';
import  CreatePlanReducer  from './CreatePlanSlice';
import  GetAllPlanReducer  from './GetAllPlanSlice';
import  InvitationsReducer  from './InvitationsSlice';
import  Cate_decoratesReducer  from './Cate_decoratesSlice';
import  DecoratesByCateReducer  from './DecoratesByCateSlice';



const dummyReducer = (state = {}) => state;


export const store = configureStore({
  reducer: {
    decoratesbyCate:DecoratesByCateReducer,
    cate_decorates:Cate_decoratesReducer,
    invitations:InvitationsReducer,
    allplan:GetAllPlanReducer,
    createplan:CreatePlanReducer,
    halltheowedding: HallTheoWeddingHallsReducer,
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
