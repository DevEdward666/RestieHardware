import { Dispatch } from "react";
import {
  ADD_TO_CART,
  LIST_OF_ITEMS,
  SELECTED_ITEM,
} from "../../Types/Inventory/InventoryTypes";
import {
  addToCart,
  getAllInventory,
  searchInventory,
} from "../../API/Inventory/InventoryApi";
import { SearchInventoryModel } from "../../../Models/Request/searchInventory";
import {
  Addtocart,
  InventoryModel,
} from "../../../Models/Request/Inventory/InventoryModel";

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
  (payload: InventoryModel) => async (dispatch: Dispatch<SELECTED_ITEM>) => {
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
  (payload: Addtocart) => async (dispatch: Dispatch<ADD_TO_CART>) => {
    try {
      const res = await addToCart(payload);
      dispatch({
        type: "ADD_TO_CART",
        add_to_cart: res,
      });
      return res;
    } catch (error: any) {
      console.log(error);
    }
  };
