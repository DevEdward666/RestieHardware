import {
  Addtocart,
  CategoryAndBrandModel,
  InventoryModel,
  SelectedItemToCart,
} from "../../../Models/Request/Inventory/InventoryModel";
import {
  GetBrandsModel,
  GetDeliveryInfo,
  GetListOrder,
  GetListOrderInfo,
} from "../../../Models/Response/Inventory/GetInventoryModel";

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
export type ORDER_LIST_INFO = {
  type: "ORDER_LIST_INFO";
  order_list_info: GetListOrderInfo[];
};
export type GET_DELIVERY_INFO = {
  type: "GET_DELIVERY_INFO";
  get_delivery_info: GetDeliveryInfo;
};
export type SET_CATEGORY_AND_BRAND = {
  type: "SET_CATEGORY_AND_BRAND";
  set_category_and_brand: CategoryAndBrandModel;
};
export type GET_BRANDS = {
  type: "GET_BRANDS";
  get_brands: GetBrandsModel[];
};
export type LIST_OF_PRODUCT_TYPE =
  | LIST_OF_ITEMS
  | SELECTED_ITEM
  | ADD_TO_CART
  | ORDER_LIST
  | ORDER_LIST_INFO
  | GET_DELIVERY_INFO
  | SET_CATEGORY_AND_BRAND
  | GET_BRANDS;

export interface InventoryTypesModel {
  list_of_items: InventoryModel[];
  selected_item: SelectedItemToCart;
  add_to_cart: Addtocart[];
  order_list: GetListOrder[];
  order_list_info: GetListOrderInfo[];
  get_delivery_info: GetDeliveryInfo;
  set_category_and_brand: CategoryAndBrandModel;
  get_brands: GetBrandsModel[];
}
