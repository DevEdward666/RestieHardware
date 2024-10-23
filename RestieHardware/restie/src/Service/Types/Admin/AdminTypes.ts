import { InventoryModel } from "../../../Models/Request/Inventory/InventoryModel";
import { SuppliersModel, UserNameModel, VouchersModel } from "../../../Models/Response/Admin/AdminModelResponse";

export type ADMIN_LIST_OF_ITEMS = {
  type: "ADMIN_LIST_OF_ITEMS";
  admin_list_of_items: InventoryModel[];
};
export type ADMIN_LIST_OF_SUPPLIERS = {
  type: "ADMIN_LIST_OF_SUPPLIERS";
  admin_list_of_supplier: SuppliersModel[];
};
export type ADMIN_LIST_OF_VOUCHERS = {
  type: "ADMIN_LIST_OF_VOUCHERS";
  admin_list_of_voucher: VouchersModel[];
};
export type ADMIN_LIST_OF_USERS = {
  type: "ADMIN_LIST_OF_USERS";
  admin_list_of_users: UserNameModel[];
};
export type ADMIN_LIST_OF_ITEMS_TYPE = ADMIN_LIST_OF_USERS | ADMIN_LIST_OF_ITEMS | ADMIN_LIST_OF_SUPPLIERS | ADMIN_LIST_OF_VOUCHERS;

export interface AdminTypesModel {
  admin_list_of_items: InventoryModel[];
  admin_list_of_supplier: SuppliersModel[];
  admin_list_of_voucher: VouchersModel[];
  admin_list_of_users:UserNameModel[];
}
