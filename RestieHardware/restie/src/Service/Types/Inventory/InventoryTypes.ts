import {
  Addtocart,
  CategoryAndBrandModel,
  CompleteReturnRefund,
  InventoryModel,
  ItemReturns,
  PostAgedReceivable,
  SelectedItemToCart,
  SubmitReturnRefund,
} from "../../../Models/Request/Inventory/InventoryModel";
import {
  GetBrandsModel,
  GetDeliveryInfo,
  GetListOrder,
  GetListOrderInfo,
  GetVouhcerResponse,
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
  order_list_info: GetListOrderInfo;
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
export type GET_VOUCHER = {
  type: "GET_VOUCHER";
  get_voucher: GetVouhcerResponse;
};
export type GET_ITEM_RETURNS = {
  type: "GET_ITEM_RETURNS";
  get_item_returns: ItemReturns[];
};
export type SUBMIT_RETURN_REFUND = {
  type: "SUBMIT_RETURN_REFUND";
  submit_return_refund: SubmitReturnRefund;
};
export type COMPLETE_RETURN_REFUND = {
  type: "COMPLETE_RETURN_REFUND";
  complete_return_refund: CompleteReturnRefund;
};
export type CHECKED_RETURN_REFUND = {
  type: "CHECKED_RETURN_REFUND";
  checked_return_refund: ItemReturns[];
};
export type RECEIVABLE_LIST = {
  type: "RECEIVABLE_LIST";
  receivable_list: PostAgedReceivable[];
};

export type LIST_OF_PRODUCT_TYPE =
  | LIST_OF_ITEMS
  | SELECTED_ITEM
  | ADD_TO_CART
  | ORDER_LIST
  | ORDER_LIST_INFO
  | GET_DELIVERY_INFO
  | SET_CATEGORY_AND_BRAND
  | GET_BRANDS
  | GET_VOUCHER
  | GET_ITEM_RETURNS
  | SUBMIT_RETURN_REFUND
  | COMPLETE_RETURN_REFUND
  | CHECKED_RETURN_REFUND
  | RECEIVABLE_LIST;

export interface InventoryTypesModel {
  list_of_items: InventoryModel[];
  selected_item: SelectedItemToCart;
  add_to_cart: Addtocart[];
  get_item_returns: ItemReturns[];
  order_list: GetListOrder[];
  order_list_info: GetListOrderInfo;
  get_delivery_info: GetDeliveryInfo;
  set_category_and_brand: CategoryAndBrandModel;
  get_brands: GetBrandsModel[];
  get_voucher: GetVouhcerResponse;
  submit_return_refund: SubmitReturnRefund;
  complete_return_refund: CompleteReturnRefund;
  checked_return_refund: ItemReturns[];
  receivable_list:PostAgedReceivable[];
}
