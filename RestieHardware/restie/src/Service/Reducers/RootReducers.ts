import { combineReducers } from "redux";

import InventoryReducer from "./Inventory/InventoryReducer";
import CustomerReducer from "./Customer/CustomerReducer";
import LoginReducer from "./LoginReducer/LoginReducer";
import CommonsReducer from "./Commons/CommonsReducer";
const RootReducer = combineReducers({
  InventoryReducer,
  CustomerReducer,
  LoginReducer,
  CommonsReducer,
});

export default RootReducer;
