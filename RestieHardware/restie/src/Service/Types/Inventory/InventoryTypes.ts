import {
  Addtocart,
  InventoryModel,
} from "../../../Models/Request/Inventory/InventoryModel";

export type LIST_OF_ITEMS = {
  type: "LIST_OF_ITEMS";
  list_of_items: InventoryModel[];
};
export type SELECTED_ITEM = {
  type: "SELECTED_ITEM";
  selected_item: InventoryModel;
};
export type ADD_TO_CART = {
  type: "ADD_TO_CART";
  add_to_cart: Addtocart;
};
export type LIST_OF_PRODUCT_TYPE = LIST_OF_ITEMS | SELECTED_ITEM | ADD_TO_CART;

export interface InventoryTypesModel {
  list_of_items: InventoryModel[];
  selected_item: InventoryModel;
  add_to_cart: Addtocart;
}
