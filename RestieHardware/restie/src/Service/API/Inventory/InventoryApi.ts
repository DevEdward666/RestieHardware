import { baseUrl } from "../../../Helpers/environment";
import { post } from "../../../Helpers/useAxios";
import { Addtocart } from "../../../Models/Request/Inventory/InventoryModel";
import { SearchInventoryModel } from "../../../Models/Request/searchInventory";

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

export const addToCart = async (payload: Addtocart) => {
  const response = await post(
    `${baseUrl}api/Inventory/AddToCart`,
    {
      "Content-Type": "application/json",
    },
    JSON.stringify(payload)
  );
  console.log(response);
  return response;
};
