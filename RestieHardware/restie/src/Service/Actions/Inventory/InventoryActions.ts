import { Dispatch } from "react";
import {
  ADD_TO_CART,
  CHECKED_RETURN_REFUND,
  COMPLETE_RETURN_REFUND,
  GET_BRANDS,
  GET_CATEGORY,
  GET_DELIVERY_INFO,
  GET_ITEM_RETURNS,
  GET_LIST_VOUCHER,
  GET_VOUCHER,
  GET_VOUCHER_LIST,
  LIST_OF_ITEMS,
  ORDER_LIST,
  ORDER_LIST_INFO,
  RECEIVABLE_LIST,
  SELECTED_ITEM,
  SET_CATEGORY_AND_BRAND,
  SUBMIT_RETURN_REFUND,
} from "../../Types/Inventory/InventoryTypes";
import {
  ApprovedOrderAndPay,
  CancelOrder,
  GetItemsToRefund,
  GetVoucherInfo,
  InsertCustomerInfo,
  ListAgedReceivable,
  ListOfVouchers,
  ListOrder,
  PostGetDeliveryInfo,
  PostReturnItems,
  SavedAndPayOrder,
  SelectedListOrder,
  addToCart,
  deleteCart,
  fetchBrands,
  fetchCategory,
  getAllInventory,
  getSelectedItem,
  searchInventory,
  updateCartOrder,
  userOrderInfo,
  userQuoatationOrderInfo,
} from "../../API/Inventory/InventoryApi";
import { SearchInventoryModel } from "../../../Models/Request/searchInventory";
import {
  Addtocart,
  CategoryAndBrandModel,
  CompleteReturnRefund,
  GetBrandsModel,
  GetItemToRefundRequest,
  GetVoucherType,
  InventoryModel,
  ItemReturns,
  PostAgedReceivable,
  PostDeliveryInfo,
  PostDeliveryInfoModel,
  PostSelectedOrder,
  PostVoucherInfoModel,
  PostdOrderList,
  SelectedItemToCart,
  SubmitReturnRefund,
} from "../../../Models/Request/Inventory/InventoryModel";
import { ResponseModel } from "../../../Models/Response/Commons/Commons";
import { v4 as uuidv4 } from "uuid";
import {
  GetCategoryModel,
  GetDeliveryInfo,
  GetListOrder,
  GetListOrderInfo,
  GetOrderItems,
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
  (itemCode: string) => async (dispatch: Dispatch<SELECTED_ITEM>) => {
    try {
      const res = await getSelectedItem(itemCode);
      if(res[0].image !==null){
        res[0].image = `data:image/jpeg;base64,${res[0]?.image}`;
      }else{
        res[0].image=null;
      }
      dispatch({
        type: "SELECTED_ITEM",
        selected_item: res[0],
      });
      return res[0];
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
  const paymentMethod = {
    cash: "Cash",
    pending: "Pending",
    quotation: "Quotation",
    cancel: "Cancel",
    debt: "Debt",
  };
  let update_status = "";
  if (
    method.toLowerCase() === paymentMethod.cash.toLowerCase() ||
    method.toLowerCase() === paymentMethod.debt.toLowerCase()
  ) {
    update_status = "approved";
  }
  if (method.toLowerCase() === paymentMethod.quotation.toLowerCase()) {
    update_status = "quotation";
  }
  if (method.toLowerCase() === paymentMethod.cancel.toLowerCase()) {
    update_status = "cancel";
  }
  if (method.toLowerCase() === paymentMethod.pending.toLowerCase()) {
    update_status = "pending";
  }
  const updatedPayload = payload.map((val) => ({
    ...val,
    orderid: orderid,
    createdAt: payload[0].reorder ? new Date().getTime() : createdat,
    createdby: "Admin",
    paidcash:
      method.toLowerCase() === paymentMethod.cash.toLowerCase()
        ? customerCash
        : 0.0,
    paidthru: method,
    status: update_status,
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
    post_orderid: string,
    payload: Addtocart[],
    customer_payload: GetCustomerInformation,
    createdat: number,
    method: string,
    customerCash?: number,
    cashierName?: string
  ) =>
  async (dispatch: Dispatch<ADD_TO_CART>) => {
    let isReorder = payload[0].reorder;
    let res: ResponseModel = {
      result: {
        cartid: "",
        orderid: "",
      },
      status: 0,
      message: "",
    };
    try {
      if (customer_payload.newUser) {
        await InsertCustomerInfo(customer_payload);
      }
      const paymentMethod = {
        cash: "Cash",
        pending: "Pending",
        quotation: "Quotation",
        cancel: "Cancel",
        debt: "Debt",
      };
      let orderid = "";
      if (post_orderid) {
        orderid = post_orderid!;
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
      if (
        method.toLowerCase() === paymentMethod.cash.toLowerCase() ||
        method.toLowerCase() === paymentMethod.debt.toLowerCase()
      ) {
        if (payload[0]?.orderid) {
          await deleteCart(updatePayload);
          await addToCart(updatePayload);
          const UserOrderInfopayload: PostSelectedOrder = {
            orderid: orderid,
            userid: "",
            cartid: payload[0].cartid,
          };
          const resOrderInfo = await userOrderInfo(UserOrderInfopayload);
          let newItem: Addtocart;
          payload = [];
          resOrderInfo.order_item.$values?.map((val: GetOrderItems) => {
            let totalDiscount = 0;
            totalDiscount += val.discount_price;
            newItem = {
              onhandqty: val?.onhandqty!,
              code: val.code,
              item: val.item,
              qty: val.qty,
              image: "",
              price: val.price,
              discount: val.discount_price,
              total_discount: totalDiscount,
              orderid: resOrderInfo.order_info.orderid,
              cartid: resOrderInfo.order_info.cartid,
              createdAt: isReorder
                ? new Date().getTime()
                : resOrderInfo.order_info.createdat,
              status: resOrderInfo.order_info.status,
            };
            payload.push(newItem);
          });
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
      } else if (
        method.toLowerCase() === paymentMethod.quotation.toLowerCase()
      ) {
        await deleteCart(updatePayload);
        res = await addToCart(updatePayload);
      } else if (method.toLowerCase() === paymentMethod.cancel.toLowerCase()) {
        res = await CancelOrder(updatePayload);
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
      return true;
    } catch (error: any) {
      console.log(error);
      return false;
    }
  };
export const getReceivableList =
  () => async (dispatch: Dispatch<RECEIVABLE_LIST>) => {
    try {
      const res: PostAgedReceivable[] = await ListAgedReceivable();
      dispatch({
        type: "RECEIVABLE_LIST",
        receivable_list: res,
      });
      return true;
    } catch (error: any) {
      console.log(error);
      return false;
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
          return_item: res.return_items.$values,
        },
      });
      return res;
    } catch (error: any) {
      console.log(error);
    }
  };
export const getQuotationOrderInfo =
  (payload: PostSelectedOrder) =>
  async (dispatch: Dispatch<ORDER_LIST_INFO>) => {
    try {
      const res: any = await userQuoatationOrderInfo(payload);
      dispatch({
        type: "ORDER_LIST_INFO",
        order_list_info: {
          order_item: res.order_item.$values,
          order_info: res.order_info,
          return_item: res.return_items.$values,
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
export const get_category_actions =
  (payload: GetCategoryModel) => async (dispatch: Dispatch<GET_CATEGORY>) => {
    try {
      const res = await fetchCategory(payload);
      dispatch({
        type: "GET_CATEGORY",
        get_category: res,
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
export const remove_voucher_actions =
  () => async (dispatch: Dispatch<GET_VOUCHER>) => {
    try {
      dispatch({
        type: "GET_VOUCHER",
        get_voucher: {
          name: "",
          description: "",
          maxredemption: "",
          discount: 0,
          type: "",
          voucher_for: "",
          vouchercode: "",
        },
      });
    } catch (error: any) {
      console.log(error);
    }
  };
export const get_all_voucher_actions =
  (payload: GetVoucherType) => async (dispatch: Dispatch<GET_VOUCHER_LIST>) => {
    try {
      const res = await ListOfVouchers(payload);
      dispatch({
        type: "GET_VOUCHER_LIST",
        get_voucher_list: res.result.$values,
      });
      return res.result.$values;
    } catch (error: any) {
      console.log(error);
    }
  };
export const get_list_of_voucher_actions =
  (payload: GetVoucherType) => async (dispatch: Dispatch<GET_LIST_VOUCHER>) => {
    try {
      const res = await ListOfVouchers(payload);
      dispatch({
        type: "GET_LIST_VOUCHER",
        get_list_voucher: res.result.$values,
      });
      return res.result.$values;
    } catch (error: any) {
      console.log(error);
    }
  };

export const get_item_returns =
  (payload: GetItemToRefundRequest) =>
  async (dispatch: Dispatch<GET_ITEM_RETURNS>) => {
    try {
      const res = await GetItemsToRefund(payload);
      dispatch({
        type: "GET_ITEM_RETURNS",
        get_item_returns: res.result.$values,
      });
      return res.result.$values;
    } catch (error: any) {
      console.log(error);
    }
  };
export const update_item_returns =
  (payload: ItemReturns[]) => async (dispatch: Dispatch<GET_ITEM_RETURNS>) => {
    try {
      dispatch({
        type: "GET_ITEM_RETURNS",
        get_item_returns: payload,
      });
      return payload;
    } catch (error: any) {
      console.log(error);
    }
  };
export const submit_return_refund =
  (payload: SubmitReturnRefund) =>
  async (dispatch: Dispatch<SUBMIT_RETURN_REFUND>) => {
    try {
      dispatch({
        type: "SUBMIT_RETURN_REFUND",
        submit_return_refund: payload,
      });
      return payload;
    } catch (error: any) {
      console.log(error);
    }
  };
export const checked_refund_items =
  (payload: ItemReturns[]) =>
  async (dispatch: Dispatch<CHECKED_RETURN_REFUND>) => {
    try {
      dispatch({
        type: "CHECKED_RETURN_REFUND",
        checked_return_refund: payload,
      });
      return payload;
    } catch (error: any) {
      console.log(error);
    }
  };
export const complete_return_refund =
  (payload: CompleteReturnRefund) =>
  async (dispatch: Dispatch<COMPLETE_RETURN_REFUND>) => {
    try {
      dispatch({
        type: "COMPLETE_RETURN_REFUND",
        complete_return_refund: payload,
      });
      return payload;
    } catch (error: any) {
      console.log(error);
    }
  };
export const completeRefund =
  (payload: ItemReturns[]) =>
  async (dispatch: Dispatch<COMPLETE_RETURN_REFUND>) => {
    try {
      const res = await PostReturnItems(payload);
      dispatch({
        type: "COMPLETE_RETURN_REFUND",
        complete_return_refund: { complete: false },
      });
      return res;
    } catch (error: any) {
      console.log(error);
    }
  };
