import { Dispatch } from "react";
import {
  CUSTOMERS,
  CUSTOMER_INFORMATION,
  GET_CUSTOMER,
} from "../../Types/Cusotomer/CustomerTypes";
import {
  GetCustomerInformation,
  PostCustomer,
} from "../../../Models/Response/Customer/GetCustomerModel";
import {
  GetCustomerInfo,
  GetCustomers,
} from "../../API/Inventory/InventoryApi";

export const AddCustomerInformation =
  (payload: GetCustomerInformation) =>
  async (dispatch: Dispatch<CUSTOMER_INFORMATION>) => {
    try {
      dispatch({
        type: "CUSTOMER_INFORMATION",
        customer_information: payload,
      });
      // return res;
    } catch (error: any) {
      console.log(error);
    }
  };
export const GetAllCustomers = () => async (dispatch: Dispatch<CUSTOMERS>) => {
  try {
    const res = await GetCustomers();
    dispatch({
      type: "CUSTOMERS",
      customers: res,
    });
    // return res;
  } catch (error: any) {
    console.log(error);
  }
};

export const GetOneCustomer =
  (payload: PostCustomer) => async (dispatch: Dispatch<GET_CUSTOMER>) => {
    try {
      const res = await GetCustomerInfo(payload);
      dispatch({
        type: "GET_CUSTOMER",
        get_customer: res,
      });
      return true;
    } catch (error: any) {
      console.log(error);
    }
  };
