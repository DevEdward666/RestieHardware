import { baseUrl } from "../../../Helpers/environment";
import { post } from "../../../Helpers/useAxios";
import { Addtocart } from "../../../Models/Request/Inventory/InventoryModel";
import { SearchInventoryModel } from "../../../Models/Request/searchInventory";
import { ResponseModel } from "../../../Models/Response/Commons/Commons";

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
  console.log("order", payload);
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
