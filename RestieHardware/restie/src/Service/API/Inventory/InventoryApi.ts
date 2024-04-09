import { baseUrl } from "../../../Helpers/environment";
import { get, getWithAuth, post } from "../../../Helpers/useAxios";
import {
  Addtocart,
  GetBrandsModel,
  GetDeliveryImagePath,
  PostDeliveryImage,
  PostDeliveryInfo,
  PostDeliveryInfoModel,
  PostSelectedOrder,
  PostUpdateDeliveredOrder,
  PostVoucherInfoModel,
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
export const fetchBrands = async (payload: GetBrandsModel) => {
  const response = await post(
    `${baseUrl}api/Inventory/fetchBrands`,
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
  return response;
};
export const updateCartOrder = async (payload: Addtocart[]) => {
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
  return response;
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
  console.log(response);
  return response.result;
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
export const UploadDeliveryImages = async (payload: PostDeliveryImage) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const formData = new FormData();
  formData.append(`Filename`, payload.FileName);
  formData.append(`FolderName`, payload.FolderName);
  formData.append(`FormFile`, payload.FormFile);

  const response = await post(
    `${baseUrl}api/Inventory/UploadFile`,
    {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${getToken}`,
    },
    formData
  );
  return response;
};

export const GetDeliveryImage = async (payload: GetDeliveryImagePath) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }

  const response = await post(
    `${baseUrl}api/Inventory/Getimage`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  return response;
};

export const SavedDeliveryInfo = async (payload: PostDeliveryInfo) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }

  const response = await post(
    `${baseUrl}api/Inventory/PostDeliveryInfo`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  return response;
};
export const UpdateDelivered = async (payload: PostUpdateDeliveredOrder) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }

  const response = await post(
    `${baseUrl}api/Inventory/UpdateDelivered`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  return response;
};
export const PostGetDeliveryInfo = async (payload: PostDeliveryInfoModel) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }

  const response = await post(
    `${baseUrl}api/Inventory/getDelivery`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  return response;
};
export const GetVoucherInfo = async (payload: PostVoucherInfoModel) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }

  const response = await post(
    `${baseUrl}api/Inventory/GetVoucher`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  return response;
};
