import baseUrl from "../../../Helpers/environment";
import { post } from "../../../Helpers/useAxios";
import { PostInventoryModel } from "../../../Models/Request/Admin/AdminRequestModel";
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
