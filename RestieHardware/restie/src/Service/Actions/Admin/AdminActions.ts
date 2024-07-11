import { Dispatch } from "react";
import { SearchInventoryModel } from "../../../Models/Request/searchInventory";
import {
  AddInventory,
  AddNewItemInventory,
  searchInventory,
  searchSuppliers,
} from "../../API/Admin/AdminApi";
import { LIST_OF_ITEMS } from "../../Types/Inventory/InventoryTypes";
import {
  ADMIN_LIST_OF_ITEMS,
  ADMIN_LIST_OF_SUPPLIERS,
} from "../../Types/Admin/AdminTypes";
import { PostInventoryModel, PostNewItemInventoryModel } from "../../../Models/Request/Admin/AdminRequestModel";

export const searchAdminInventoryList =
  (payload: SearchInventoryModel) =>
  async (dispatch: Dispatch<ADMIN_LIST_OF_ITEMS>) => {
    try {
      const res = await searchInventory(payload);
      dispatch({
        type: "ADMIN_LIST_OF_ITEMS",
        admin_list_of_items: res,
      });
      return res;
    } catch (error: any) {
      console.log(error);
    }
  };
export const searchSupplier =
  (payload: SearchInventoryModel) =>
  async (dispatch: Dispatch<ADMIN_LIST_OF_SUPPLIERS>) => {
    try {
      const res = await searchSuppliers(payload);
      dispatch({
        type: "ADMIN_LIST_OF_SUPPLIERS",
        admin_list_of_supplier: res,
      });
      return res;
    } catch (error: any) {
      console.log(error);
    }
  };
export const PostInventory = async (payload: PostInventoryModel) => {
  const res = await AddInventory(payload);
  console.log(res);
  return res;
};
export const PostNewItemInventory = async (payload: PostNewItemInventoryModel) => {
  const res = await AddNewItemInventory(payload);
  console.log(res);
  return res;
};
