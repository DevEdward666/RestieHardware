import { baseUrl } from "../../../Helpers/environment";
import { get, post } from "../../../Helpers/useAxios";
import {
  Addtocart,
  PostSelectedOrder,
  PostdOrderList,
} from "../../../Models/Request/Inventory/InventoryModel";
import { SearchInventoryModel } from "../../../Models/Request/searchInventory";
import { ResponseModel } from "../../../Models/Response/Commons/Commons";
import {
  GetCustomerInformation,
  PostCustomer,
} from "../../../Models/Response/Customer/GetCustomerModel";
import {
  GetListOrder,
  SelectedOrder,
} from "../../../Models/Response/Inventory/GetInventoryModel";

export const getAllInventory = async (payload: SearchInventoryModel) => {
  const response = await post(
    `${baseUrl}api/Inventory/fetchInventory/${payload.page}`,
    {
      "Content-Type": "application/json",
    },
    JSON.stringify(payload)
  );
  console.log(response);
  return response;
};
export const searchInventory = async (payload: SearchInventoryModel) => {
  const response = await post(
    `${baseUrl}api/Inventory/searchInventory/${payload.page}`,
    {
      "Content-Type": "application/json",
    },
    JSON.stringify(payload)
  );
  console.log(response);
  return response;
};

export const addToCart = async (payload: Addtocart[]) => {
  const response: ResponseModel = await post(
    `${baseUrl}api/Inventory/AddToCart`,
    {
      "Content-Type": "application/json",
    },
    JSON.stringify(payload)
  );
  console.log("order", response);
  return response;
};

export const SavedAndPayOrder = async (payload: Addtocart[]) => {
  const response: ResponseModel = await post(
    `${baseUrl}api/Inventory/SaveOrder`,
    {
      "Content-Type": "application/json",
    },
    JSON.stringify(payload)
  );
  console.log("order", response);
  return response;
};
export const ApprovedOrderAndPay = async (payload: Addtocart[]) => {
  const response: ResponseModel = await post(
    `${baseUrl}api/Inventory/ApprovedOrderAndPay`,
    {
      "Content-Type": "application/json",
    },
    JSON.stringify(payload)
  );
  console.log("order", response);
  return response;
};
export const deleteCart = async (payload: Addtocart[]) => {
  const response: ResponseModel = await post(
    `${baseUrl}api/Inventory/deleteCart`,
    {
      "Content-Type": "application/json",
    },
    JSON.stringify(payload)
  );
  console.log("order", response);
  return response;
};
export const updateCartOrder = async (payload: Addtocart[]) => {
  console.log("order", payload);
  const response: ResponseModel = await post(
    `${baseUrl}api/Inventory/UpdatedOrderAndCart`,
    {
      "Content-Type": "application/json",
    },
    JSON.stringify(payload)
  );
  console.log("order", response);
  return response;
};
export const ListOrder = async (payload: PostdOrderList) => {
  const response = await post(
    `${baseUrl}api/Inventory/userOrders`,
    {
      "Content-Type": "application/json",
    },
    JSON.stringify(payload)
  );
  return response.result;
};
export const userOrderInfo = async (payload: PostSelectedOrder) => {
  const response = await post(
    `${baseUrl}api/Inventory/userOrderInfo`,
    {
      "Content-Type": "application/json",
    },
    JSON.stringify(payload)
  );
  return response.result;
};
export const SelectedListOrder = async (payload: PostSelectedOrder) => {
  const response = await post(
    `${baseUrl}api/Inventory/getSelectedOrder`,
    {
      "Content-Type": "application/json",
    },
    JSON.stringify(payload)
  );
  console.log("order", response);
  return response.result;
};

export const InsertCustomerInfo = async (payload: GetCustomerInformation) => {
  const response = await post(
    `${baseUrl}api/Inventory/PostCustoemrInfo`,
    {
      "Content-Type": "application/json",
    },
    JSON.stringify(payload)
  );
  console.log("order", response);
  return response.result;
};

export const GetCustomers = async () => {
  const response = await get(`${baseUrl}api/Inventory/GetCustomers`, {
    "Content-Type": "application/json",
  });
  return response.result;
};

export const GetCustomerInfo = async (payload: PostCustomer) => {
  const response = await post(
    `${baseUrl}api/Inventory/GetCustomerInfo`,
    {
      "Content-Type": "application/json",
    },
    JSON.stringify(payload)
  );
  return response.result;
};
