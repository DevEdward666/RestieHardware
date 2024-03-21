import { combineReducers } from "redux";

import InventoryReducer from "./Inventory/InventoryReducer";

const RootReducer = combineReducers({
  InventoryReducer,
});

export default RootReducer;
