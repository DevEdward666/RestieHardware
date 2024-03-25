import { Dispatch } from "react";
import { CUSTOMER_INFORMATION } from "../../Types/Cusotomer/CustomerTypes";
import { GetCustomerInformation } from "../../../Models/Response/Customer/GetCustomerModel";

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
