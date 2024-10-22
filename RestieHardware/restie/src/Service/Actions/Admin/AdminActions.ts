import { Dispatch } from "react";
import { SearchInventoryModel } from "../../../Models/Request/searchInventory";
import {
  AddInventory,
  AddNewItemInventory,
  AddNewSupplier,
  AddNewUser,
  AddNewVoucher,
  searchInventory,
  searchSuppliers,
  searchVoucher,
  UpdateSupplier,
  UpdateVoucher,
} from "../../API/Admin/AdminApi";
import { LIST_OF_ITEMS } from "../../Types/Inventory/InventoryTypes";
import {
  ADMIN_LIST_OF_ITEMS,
  ADMIN_LIST_OF_SUPPLIERS,
  ADMIN_LIST_OF_VOUCHERS,
} from "../../Types/Admin/AdminTypes";
import { PostAddNewUser, PostInventoryModel, PostNewItemInventoryModel, PostNewSupplierModel, PostNewVoucherModel } from "../../../Models/Request/Admin/AdminRequestModel";

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
  export const searchVouchers =
  (payload: SearchInventoryModel) =>
  async (dispatch: Dispatch<ADMIN_LIST_OF_VOUCHERS>) => {
    try {
      const res = await searchVoucher(payload);
      dispatch({
        type: "ADMIN_LIST_OF_VOUCHERS",
        admin_list_of_voucher: res,
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
export const PostNewSupplier = async (payload: PostNewSupplierModel) => {
  const res = await AddNewSupplier(payload);
  console.log(res);
  return res;
};
export const PostUpdateSupplier = async (payload: PostNewSupplierModel) => {
  const res = await UpdateSupplier(payload);
  console.log(res);
  return res;
};
export const PostNewVoucher = async (payload: PostNewVoucherModel) => {
  const res = await AddNewVoucher(payload);
  console.log(res);
  return res;
};
export const PostUpdateVoucher = async (payload: PostNewVoucherModel) => {
  const res = await UpdateVoucher(payload);
  console.log(res);
  return res;
};
export const AddNewUsers = async (payload: PostAddNewUser) => {
  const res = await AddNewUser(payload);
  console.log(res);
  return res;
};
