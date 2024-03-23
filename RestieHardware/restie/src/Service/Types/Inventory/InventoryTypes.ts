import {
  Addtocart,
  InventoryModel,
  SelectedItemToCart,
} from "../../../Models/Request/Inventory/InventoryModel";
import { GetListOrder } from "../../../Models/Response/Inventory/GetInventoryModel";

export type LIST_OF_ITEMS = {
  type: "LIST_OF_ITEMS";
  list_of_items: InventoryModel[];
};
export type SELECTED_ITEM = {
  type: "SELECTED_ITEM";
  selected_item: SelectedItemToCart;
};
export type ADD_TO_CART = {
  type: "ADD_TO_CART";
  add_to_cart: Addtocart[];
};
export type ORDER_LIST = {
  type: "ORDER_LIST";
  order_list: GetListOrder[];
};
export type LIST_OF_PRODUCT_TYPE =
  | LIST_OF_ITEMS
  | SELECTED_ITEM
  | ADD_TO_CART
  | ORDER_LIST;

export interface InventoryTypesModel {
  list_of_items: InventoryModel[];
  selected_item: SelectedItemToCart;
  add_to_cart: Addtocart[];
  order_list: GetListOrder[];
}
