import { combineReducers } from "redux";

import InventoryReducer from "./Inventory/InventoryReducer";
import CustomerReducer from "./Customer/CustomerReducer";
import LoginReducer from "./LoginReducer/LoginReducer";

const RootReducer = combineReducers({
  InventoryReducer,
  CustomerReducer,
  LoginReducer,
});

export default RootReducer;
