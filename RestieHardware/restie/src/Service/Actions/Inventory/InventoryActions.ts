import { Dispatch } from "react";
import {
  ADD_TO_CART,
  LIST_OF_ITEMS,
  ORDER_LIST,
  SELECTED_ITEM,
} from "../../Types/Inventory/InventoryTypes";
import {
  ListOrder,
  SelectedListOrder,
  addToCart,
  getAllInventory,
  searchInventory,
  updateCartOrder,
} from "../../API/Inventory/InventoryApi";
import { SearchInventoryModel } from "../../../Models/Request/searchInventory";
import {
  Addtocart,
  InventoryModel,
  PostSelectedOrder,
  PostdOrderList,
  SelectedItemToCart,
} from "../../../Models/Request/Inventory/InventoryModel";
import { ResponseModel } from "../../../Models/Response/Commons/Commons";
import { v4 as uuidv4 } from "uuid";
import { GetListOrder } from "../../../Models/Response/Inventory/GetInventoryModel";
export const getInventory =
  (payload: SearchInventoryModel) =>
  async (dispatch: Dispatch<LIST_OF_ITEMS>) => {
    try {
      const res = await getAllInventory(payload);
      dispatch({
        type: "LIST_OF_ITEMS",
        list_of_items: res,
      });
      return res;
    } catch (error: any) {
      console.log(error);
    }
  };
export const searchInventoryList =
  (payload: SearchInventoryModel) =>
  async (dispatch: Dispatch<LIST_OF_ITEMS>) => {
    try {
      const res = await searchInventory(payload);
      dispatch({
        type: "LIST_OF_ITEMS",
        list_of_items: res,
      });
      return res;
    } catch (error: any) {
      console.log(error);
    }
  };

export const selectedItem =
  (payload: SelectedItemToCart) =>
  async (dispatch: Dispatch<SELECTED_ITEM>) => {
    try {
      dispatch({
        type: "SELECTED_ITEM",
        selected_item: payload,
      });
    } catch (error: any) {
      console.log(error);
    }
  };

export const addToCartAction =
  (payload: Addtocart[]) => async (dispatch: Dispatch<ADD_TO_CART>) => {
    try {
      dispatch({
        type: "ADD_TO_CART",
        add_to_cart: payload,
      });
      // return res;
    } catch (error: any) {
      console.log(error);
    }
  };
export const saveOrder =
  (payload: Addtocart[], createdat: number) =>
  async (dispatch: Dispatch<ADD_TO_CART>) => {
    try {
      const orderid = uuidv4();
      const updatedPayload = payload.map((val) => ({
        ...val,
        orderId: orderid,
        createdAt: createdat,
        createdby: "Admin",
        paidcash: 0.0,
        paidthru: "pending",
        status: "pending",
      }));

      const res: ResponseModel = await addToCart(updatedPayload);
      if (res.status === 200) {
        localStorage.removeItem("cartid");
        dispatch({
          type: "ADD_TO_CART",
          add_to_cart: [], // Assuming you want to clear the cart after saving the order
        });
        alert(res.message);
      }
    } catch (error: any) {
      console.log(error);
    }
  };
export const updateOrder =
  (payload: Addtocart[], updatedAt: number) =>
  async (dispatch: Dispatch<ADD_TO_CART>) => {
    try {
      const res: ResponseModel = await updateCartOrder(payload);
      if (res.status === 200) {
        localStorage.removeItem("cartid");
        dispatch({
          type: "ADD_TO_CART",
          add_to_cart: [], // Assuming you want to clear the cart after saving the order
        });
        alert(res.message);
      }
    } catch (error: any) {
      console.log(error);
    }
  };
export const getOrderList =
  (payload: PostdOrderList) => async (dispatch: Dispatch<ORDER_LIST>) => {
    try {
      const res: GetListOrder[] = await ListOrder(payload);
      dispatch({
        type: "ORDER_LIST",
        order_list: res,
      });
    } catch (error: any) {
      console.log(error);
    }
  };
export const selectedOrder =
  (payload: PostSelectedOrder) => async (dispatch: Dispatch<ADD_TO_CART>) => {
    try {
      const res: Addtocart[] = await SelectedListOrder(payload);
      console.log("selectedOrder", res);
      dispatch({
        type: "ADD_TO_CART",
        add_to_cart: res,
      });
    } catch (error: any) {
      console.log(error);
    }
  };
