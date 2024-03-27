import { baseUrl } from "../../../Helpers/environment";
import { get, getWithAuth, post } from "../../../Helpers/useAxios";
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
  return response.result.$values;
};
export const searchInventory = async (payload: SearchInventoryModel) => {
  const response = await post(
    `${baseUrl}api/Inventory/searchInventory/${payload.page}`,
    {
      "Content-Type": "application/json",
    },
    JSON.stringify(payload)
  );
  return response.result.$values;
};

export const addToCart = async (payload: Addtocart[]) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response: ResponseModel = await post(
    `${baseUrl}api/Inventory/AddToCart`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  console.log("order", response);
  return response;
};

export const SavedAndPayOrder = async (payload: Addtocart[]) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response: ResponseModel = await post(
    `${baseUrl}api/Inventory/SaveOrder`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  console.log("order", response);
  return response;
};
export const ApprovedOrderAndPay = async (payload: Addtocart[]) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response: ResponseModel = await post(
    `${baseUrl}api/Inventory/ApprovedOrderAndPay`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  console.log("order", response);
  return response;
};
export const deleteCart = async (payload: Addtocart[]) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response: ResponseModel = await post(
    `${baseUrl}api/Inventory/deleteCart`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  console.log("order", response);
  return response;
};
export const updateCartOrder = async (payload: Addtocart[]) => {
  console.log("order", payload);
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response: ResponseModel = await post(
    `${baseUrl}api/Inventory/UpdatedOrderAndCart`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  console.log("order", response);
  return response;
};
export const ListOrder = async (payload: PostdOrderList) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response = await post(
    `${baseUrl}api/Inventory/userOrders`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  return response.result.$values;
};
export const userOrderInfo = async (payload: PostSelectedOrder) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response = await post(
    `${baseUrl}api/Inventory/userOrderInfo`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  return response.result.$values;
};
export const SelectedListOrder = async (payload: PostSelectedOrder) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response = await post(
    `${baseUrl}api/Inventory/getSelectedOrder`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  console.log("order", response);
  return response.result.$values;
};

export const InsertCustomerInfo = async (payload: GetCustomerInformation) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response = await post(
    `${baseUrl}api/Inventory/PostCustoemrInfo`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  console.log("order", response);
  return response.result.$values;
};

export const GetCustomers = async () => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }

  const response = await getWithAuth(
    `${baseUrl}api/Inventory/GetCustomers`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken}`,
      },
    },
    getToken
  );
  return response.result;
};

export const GetCustomerInfo = async (payload: PostCustomer) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response = await post(
    `${baseUrl}api/Inventory/GetCustomerInfo`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  return response.result;
};
