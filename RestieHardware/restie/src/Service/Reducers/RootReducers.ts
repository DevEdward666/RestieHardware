import { combineReducers } from "redux";

import InventoryReducer from "./Inventory/InventoryReducer";
import CustomerReducer from "./Customer/CustomerReducer";

const RootReducer = combineReducers({
  InventoryReducer,
  CustomerReducer,
});

export default RootReducer;
