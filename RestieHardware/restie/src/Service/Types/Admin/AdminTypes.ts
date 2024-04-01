import { InventoryModel } from "../../../Models/Request/Inventory/InventoryModel";
import { SuppliersModel } from "../../../Models/Response/Admin/AdminModelResponse";

export type ADMIN_LIST_OF_ITEMS = {
  type: "ADMIN_LIST_OF_ITEMS";
  admin_list_of_items: InventoryModel[];
};
export type ADMIN_LIST_OF_SUPPLIERS = {
  type: "ADMIN_LIST_OF_SUPPLIERS";
  admin_list_of_supplier: SuppliersModel[];
};
export type ADMIN_LIST_OF_ITEMS_TYPE =
  | ADMIN_LIST_OF_ITEMS
  | ADMIN_LIST_OF_SUPPLIERS;

export interface AdminTypesModel {
  admin_list_of_items: InventoryModel[];
  admin_list_of_supplier: SuppliersModel[];
}
