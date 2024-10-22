import baseUrl from "../../../Helpers/environment";
import { post } from "../../../Helpers/useAxios";
import { PostAddNewUser, PostInventoryModel, PostNewItemInventoryModel, PostNewSupplierModel, PostNewVoucherModel } from "../../../Models/Request/Admin/AdminRequestModel";
import { UploadSalesReportFile } from "../../../Models/Request/Inventory/InventoryModel";
import { SearchInventoryModel } from "../../../Models/Request/searchInventory";

export const searchInventory = async (payload: SearchInventoryModel) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response = await post(
    `${baseUrl}api/Admin/searchInventory/${payload.page}`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  return response.result.$values;
};
export const searchSuppliers = async (payload: SearchInventoryModel) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response = await post(
    `${baseUrl}api/Admin/searchSupplier/${payload.page}`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  return response.result.$values;
};

export const searchVoucher = async (payload: SearchInventoryModel) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response = await post(
    `${baseUrl}api/Admin/searchVouchers/${payload.page}`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  return response.result.$values;
};
export const AddInventory = async (payload: PostInventoryModel) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response = await post(
    `${baseUrl}api/admin/AddInventory`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  return response;
};
export const AddNewItemInventory = async (payload: PostNewItemInventoryModel) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response = await post(
    `${baseUrl}api/admin/NewItemInventory`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  return response;
};
export const AddNewSupplier = async (payload: PostNewSupplierModel) => {
  console.log(payload)
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response = await post(
    `${baseUrl}api/admin/AddNewSupplier`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  return response;
};
export const UpdateSupplier = async (payload: PostNewSupplierModel) => {
  console.log(payload)
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response = await post(
    `${baseUrl}api/admin/UpdateSupplier`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  return response;
};

export const AddNewVoucher = async (payload: PostNewVoucherModel) => {

  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response = await post(
    `${baseUrl}api/admin/AddNewVoucher`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  return response;
};
export const UpdateVoucher = async (payload: PostNewVoucherModel) => {

  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response = await post(
    `${baseUrl}api/admin/PutVoucher`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  return response;
};
export const AddNewUser = async (payload: PostAddNewUser) => {
  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const response = await post(
    `${baseUrl}api/user/AddNewUser`,
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken}`,
    },
    JSON.stringify(payload)
  );
  return response;
}
export const UploadSales = async (payload: UploadSalesReportFile) => {

  const getToken = localStorage.getItem("bearer");
  if (!getToken) {
    throw new Error("Token not found");
  }
  const formData = new FormData();
  formData.append(`SalesFile`, payload.SalesFile);
  const response = await post(
    `${baseUrl}api/admin/ImportDataFromExcel`,
    {
      "Content-Type": "application/form-data",
      Authorization: `Bearer ${getToken}`,
    },
    formData
  );
  return response;
};