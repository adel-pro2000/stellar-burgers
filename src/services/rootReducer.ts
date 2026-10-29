import { combineReducers } from '@reduxjs/toolkit';

import { burgerConstructorSlice } from './slices/burger-constructor';
import { feedSlice } from './slices/feed';
import { ingredientsSlice } from './slices/ingredients';
import { orderSlice } from './slices/order';
import { orderInfoSlice } from './slices/order-info';
import { profileOrdersSlice } from './slices/profile-orders';
import { userSlice } from './slices/user';

export const rootReducer = combineReducers({
  [ingredientsSlice.name]: ingredientsSlice.reducer,
  [burgerConstructorSlice.name]: burgerConstructorSlice.reducer,
  [orderSlice.name]: orderSlice.reducer,
  [orderInfoSlice.name]: orderInfoSlice.reducer,
  [feedSlice.name]: feedSlice.reducer,
  [profileOrdersSlice.name]: profileOrdersSlice.reducer,
  [userSlice.name]: userSlice.reducer,
});
