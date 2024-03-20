
import { baseUrl } from "../../../Helpers/environment";
import { post } from "../../../Helpers/useAxios";
import { SearchInventoryModel } from "../../../Models/Request/searchInventory";


export const getAllInventory = async (payload:SearchInventoryModel) =>{
    const response = await post(
        `${baseUrl}api/Inventory/fetchInventory/${payload.page}`,
        {
          "Content-Type": "application/json",
        },
        JSON.stringify(payload)
      );
      console.log(response)
      console.log(process.env.NODE_ENV);
      return response;
}
export const searchInventory = async (payload:SearchInventoryModel) =>{
    const response = await post(
        `${baseUrl}api/Inventory/searchInventory/${payload.page}`,
        {
          "Content-Type": "application/json",
        },
        JSON.stringify(payload)
      );
      console.log(response)
      return response;
}