import baseUrl from "../../../Helpers/environment";
import { get, getWithAuth, post } from "../../../Helpers/useAxios";
import {
  Addtocart,
  GetBrandsModel,
  GetDeliveryImagePath,
  GetItemImageRequest,
  GetItemToRefundRequest,
  GetVoucherType,
  ItemReturns,
  PostAgedReceivable,
  PostDaysSalesModel,
  PostDeliveryImage,
  PostDeliveryInfo,
  PostDeliveryInfoModel,
  PostInventoryLogsModel,
  PostMultipleImage,
  PostSelectedOrder,
  PostUpdateDeliveredOrder,
  PostVoucherInfoModel,
  PostdOrderList,
  PutInventoryImage,
} from "../../../Models/Request/Inventory/InventoryModel";
import { SearchInventoryModel } from "../../../Models/Request/searchInventory";
import { ResponseModel } from "../../../Models/Response/Commons/Commons";
import {
  GetCustomerInformation,
  PostCustomer,
  PutCustomerEmail,
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
export const getSelectedItem = async (itemCode: string) => {
  const response = await post(
    `${baseUrl}api/Inventory/selectedItem/${itemCode}`,
    {
      "Content-Type": "application/json",
    },
    JSON.stringify(itemCode)
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
export const fetchCategory = async (payload: GetBrandsModel) => {
  const response = await post(
    `${baseUrl}api/Inventory/fetchCategory`,
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
export const CancelOrder = async (payload: Addtocart[]) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response: ResponseModel = await post(
    `${baseUrl}api/Inventory/CancelOrder`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  console.log(response);
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
export const ListAgedReceivable = async () => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response = await post(
    `${baseUrl}api/Inventory/GetAllAgedReceivable`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    null
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
export const userQuoatationOrderInfo = async (payload: PostSelectedOrder) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response = await post(
    `${baseUrl}api/Inventory/GetQuotationOrderInfo`,
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
    `${baseUrl}api/Inventory/PostCustomerInfo`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  console.log(response);
  return response.result;
};
export const UpdateCustomerEmail = async (payload: PutCustomerEmail) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response = await post(
    `${baseUrl}api/Inventory/UpdateCustomerEmail`,
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
  formData.append("FormFile", payload.FormFile);

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
export const UploadMultipleImages = async (
  formData: FormData,
  payload: PostMultipleImage
) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  formData.append(`Filename`, payload.FileName);
  formData.append(`FolderName`, payload.FolderName);

  const response = await post(
    `${baseUrl}api/Inventory/UploadFileMultiple`,
    {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${getToken}`,
    },
    formData
  );
  return response;
};
export const UpdateInventoryImage = async (payload: PutInventoryImage) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }

  const response = await post(
    `${baseUrl}api/Inventory/UpdateInventoryImage`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    payload
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

export const GetMultipleimage = async (folderPath: string) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const payload = {
    folderPath: folderPath,
  };

  const response = await post(
    `${baseUrl}api/Inventory/GetMultipleimage`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );

  return response;
};
export const GetItemImage = async (payload: GetItemImageRequest) => {
  // const getToken = localStorage.getItem("bearer");
  // if (!getToken) {
  //   throw new Error("Token not found");
  // }

  const response = await post(
    `${baseUrl}api/Inventory/Getimage`,
    {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${getToken}`,
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
export const ListOfVouchers = async (payload: GetVoucherType) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }

  const response = await post(
    `${baseUrl}api/Inventory/ListOfVouchers`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  return response;
};
export const GenerateSalesReturn = async (payload: PostDaysSalesModel) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }

  const response = await post(
    `${baseUrl}api/Inventory/GenerateSalesReturn`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  console.log(response);
  return response;
};
export const GenerateInventoryLogs = async (
  payload: PostInventoryLogsModel
) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }

  const response = await post(
    `${baseUrl}api/Inventory/GenerateInventoryLogs`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  return response;
};
export const GetSalesByDay = async (payload: PostDaysSalesModel) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }

  const response = await post(
    `${baseUrl}api/Inventory/GetByDaySales`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  console.log(response);
  return response;
};
export const GetInventory = async () => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }

  const response = await post(
    `${baseUrl}api/Inventory/GetInventory`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    null
  );
  console.log(response);
  return response;
};
export const GetItemsToRefund = async (payload: GetItemToRefundRequest) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }

  const response = await post(
    `${baseUrl}api/Inventory/GetItemsToRefund`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  console.log(response);
  return response;
};
export const PostReturnItems = async (payload: ItemReturns[]) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }

  const response = await post(
    `${baseUrl}api/Inventory/PostReturnItems`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  console.log(response);
  return response;
};

export const SendEmail = async (
  from: string,
  to: string,
  subject: string,
  body: string,
  Attachment: any
) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const formData = new FormData();
  formData.append("from", from);
  formData.append("to", to);
  formData.append("subject", subject);
  formData.append("text", body);
  formData.append("Attachment", Attachment);
  const response = await post(
    `${baseUrl}api/Inventory/SendEmail`,
    {
      "Content-Type": "multipart/data",
      Authorization: `Bearer ${getToken}`,
    },
    formData
  );
  console.log(response);
  return response;
};
