import { Dispatch } from "react";
import {
  ADD_TO_CART,
  GET_BRANDS,
  GET_DELIVERY_INFO,
  GET_VOUCHER,
  LIST_OF_ITEMS,
  ORDER_LIST,
  ORDER_LIST_INFO,
  SELECTED_ITEM,
  SET_CATEGORY_AND_BRAND,
} from "../../Types/Inventory/InventoryTypes";
import {
  ApprovedOrderAndPay,
  GetVoucherInfo,
  InsertCustomerInfo,
  ListOrder,
  PostGetDeliveryInfo,
  SavedAndPayOrder,
  SelectedListOrder,
  addToCart,
  deleteCart,
  fetchBrands,
  getAllInventory,
  searchInventory,
  updateCartOrder,
  userOrderInfo,
} from "../../API/Inventory/InventoryApi";
import { SearchInventoryModel } from "../../../Models/Request/searchInventory";
import {
  Addtocart,
  CategoryAndBrandModel,
  GetBrandsModel,
  InventoryModel,
  PostDeliveryInfo,
  PostDeliveryInfoModel,
  PostSelectedOrder,
  PostVoucherInfoModel,
  PostdOrderList,
  SelectedItemToCart,
} from "../../../Models/Request/Inventory/InventoryModel";
import { ResponseModel } from "../../../Models/Response/Commons/Commons";
import { v4 as uuidv4 } from "uuid";
import {
  GetDeliveryInfo,
  GetListOrder,
  GetListOrderInfo,
} from "../../../Models/Response/Inventory/GetInventoryModel";
import { GetCustomerInformation } from "../../../Models/Response/Customer/GetCustomerModel";
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
      let orderid = "";
      if (payload[0]?.orderid !== "") {
        orderid = payload[0]?.orderid!;
      }
      const updatedPayload = payload.map((val) => ({
        ...val,
        orderId: orderid,
        createdAt: createdat,
        createdby: "Admin",
        paidcash: 0.0,
        paidthru: "pending",
        status: "pending",
      }));

      // const res: ResponseModel = await addToCart(updatedPayload);
      // if (res.status === 200) {
      //   localStorage.removeItem("cartid");
      //   dispatch({
      //     type: "ADD_TO_CART",
      //     add_to_cart: [], // Assuming you want to clear the cart after saving the order
      //   });
      //   alert(res.message);
      // }
    } catch (error: any) {
      console.log(error);
    }
  };
const checkPayload = (
  payload: Addtocart[],
  orderid: string,
  createdat: number,
  method: string,
  customer_payload: GetCustomerInformation,
  customerCash?: number,
  cashier?: string
) => {
  const paymentMethod = { cash: "Cash", pending: "Pending" };
  const updatedPayload = payload.map((val) => ({
    ...val,
    orderid: orderid,
    createdAt: createdat,
    createdby: "Admin",
    paidcash:
      method.toLowerCase() === paymentMethod.cash.toLowerCase()
        ? customerCash
        : 0.0,
    paidthru: method,
    status:
      method.toLowerCase() === paymentMethod.cash.toLowerCase()
        ? "approved"
        : "pending",
    userid: customer_payload?.customerid,
    type: customer_payload.ordertype,
    updateat: payload[0]?.orderid !== "" ? new Date().getTime() : null,
    customer: customer_payload.name,
    cashier: cashier,
  }));
  return updatedPayload;
};
export const PostOrder =
  (
    payload: Addtocart[],
    customer_payload: GetCustomerInformation,
    createdat: number,
    method: string,
    customerCash?: number,
    cashierName?: string
  ) =>
  async (dispatch: Dispatch<ADD_TO_CART>) => {
    let res: ResponseModel = {
      result: {
        cartid: "",
        orderid: "",
      },
      status: 0,
      message: "",
    };
    try {
      console.log(customer_payload);
      if (customer_payload.newUser) {
        await InsertCustomerInfo(customer_payload);
      }
      const paymentMethod = { cash: "Cash", pending: "Pending" };
      let orderid = "";
      if (payload[0]?.orderid) {
        orderid = payload[0]?.orderid!;
      }

      const updatePayload = checkPayload(
        payload,
        orderid,
        createdat,
        method,
        customer_payload,
        customerCash,
        cashierName
      );
      if (method.toLowerCase() === paymentMethod.cash.toLowerCase()) {
        if (payload[0]?.orderid) {
          await deleteCart(updatePayload);
          await addToCart(updatePayload);
          const UserOrderInfopayload: PostSelectedOrder = {
            orderid: orderid,
            userid: "",
            cartid: payload[0].cartid,
          };
          const resOrderInfo: GetListOrderInfo[] = await userOrderInfo(
            UserOrderInfopayload
          );
          let newItem: Addtocart;

          payload = [];
          resOrderInfo.map((items) => {
            items.order_item.map((val) => {
              newItem = {
                onhandqty: val?.onhandqty!,
                code: val.code,
                item: val.item,
                qty: val.qty,
                price: val.price,
                orderid: items.order_info.orderid,
                cartid: items.order_info.cartid,
                createdAt: items.order_info.createdat,
                status: items.order_info.status,
              };
              payload.push(newItem);
            });
          });
          // resOrderInfo.map((val) => {
          //   const newItem: Addtocart = {
          //     onhandqty: val.onhandqty,
          //     orderid: val.orderid,
          //     cartid: val.cartid,
          //     code: val.code,
          //     item: val.item,
          //     qty: val.qty,
          //     price: val.price,
          //     createdAt: val.createdat,
          //     status: val.status,
          //   };
          //   payload.push(newItem);
          // });
          const updatedPayload = checkPayload(
            payload,
            orderid,
            createdat,
            method,
            customer_payload,
            customerCash,
            cashierName
          );
          res = await ApprovedOrderAndPay(updatedPayload);
        } else {
          res = await SavedAndPayOrder(updatePayload);
        }
      } else if (method.toLowerCase() === paymentMethod.pending.toLowerCase()) {
        await deleteCart(updatePayload);
        res = await addToCart(updatePayload);
      }
      localStorage.removeItem("cartid");
      dispatch({
        type: "ADD_TO_CART",
        add_to_cart: [], // Assuming you want to clear the cart after saving the order
      });
      return res;
    } catch (error: any) {
      console.log(error);
      return res;
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
export const getOrderInfo =
  (payload: PostSelectedOrder) =>
  async (dispatch: Dispatch<ORDER_LIST_INFO>) => {
    try {
      const res: any = await userOrderInfo(payload);
      dispatch({
        type: "ORDER_LIST_INFO",
        order_list_info: {
          order_item: res.order_item.$values,
          order_info: res.order_info,
        },
      });
      return res;
    } catch (error: any) {
      console.log(error);
    }
  };

export const selectedOrder =
  (payload: PostSelectedOrder) => async (dispatch: Dispatch<ADD_TO_CART>) => {
    try {
      const res: Addtocart[] = await SelectedListOrder(payload);
      dispatch({
        type: "ADD_TO_CART",
        add_to_cart: res,
      });
    } catch (error: any) {
      console.log(error);
    }
  };
export const getDelivery =
  (payload: PostDeliveryInfoModel) =>
  async (dispatch: Dispatch<GET_DELIVERY_INFO>) => {
    try {
      const res = await PostGetDeliveryInfo(payload);
      dispatch({
        type: "GET_DELIVERY_INFO",
        get_delivery_info: res,
      });
      return res;
    } catch (error: any) {
      console.log(error);
    }
  };

export const set_category_and_brand =
  (payload: CategoryAndBrandModel) =>
  async (dispatch: Dispatch<SET_CATEGORY_AND_BRAND>) => {
    try {
      dispatch({
        type: "SET_CATEGORY_AND_BRAND",
        set_category_and_brand: payload,
      });
    } catch (error: any) {
      console.log(error);
    }
  };
export const get_brands_actions =
  (payload: GetBrandsModel) => async (dispatch: Dispatch<GET_BRANDS>) => {
    try {
      const res = await fetchBrands(payload);
      dispatch({
        type: "GET_BRANDS",
        get_brands: res,
      });
    } catch (error: any) {
      console.log(error);
    }
  };
export const get_voucher_actions =
  (payload: PostVoucherInfoModel) =>
  async (dispatch: Dispatch<GET_VOUCHER>) => {
    try {
      const res = await GetVoucherInfo(payload);
      dispatch({
        type: "GET_VOUCHER",
        get_voucher: res.result,
      });
      return res.result;
    } catch (error: any) {
      console.log(error);
    }
  };
