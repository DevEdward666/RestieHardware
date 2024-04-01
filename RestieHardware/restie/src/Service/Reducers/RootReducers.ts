import { combineReducers } from "redux";

import InventoryReducer from "./Inventory/InventoryReducer";
import CustomerReducer from "./Customer/CustomerReducer";
import LoginReducer from "./LoginReducer/LoginReducer";
import CommonsReducer from "./Commons/CommonsReducer";
import AdminReducer from "./Admin/AdminReducer";

const RootReducer = combineReducers({
  InventoryReducer,
  CustomerReducer,
  LoginReducer,
  CommonsReducer,
  AdminReducer,
});

export default RootReducer;
