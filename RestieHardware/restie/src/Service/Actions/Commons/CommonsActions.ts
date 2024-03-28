import { Dispatch } from "react";
import { GetCustomerInformation } from "../../../Models/Response/Customer/GetCustomerModel";
import { SET_TOAST } from "../../Types/Commons/CommonsType";
import { ToastModel } from "../../../Models/Response/Commons/Commons";

export const set_toast =
  (payload: ToastModel) => async (dispatch: Dispatch<SET_TOAST>) => {
    try {
      dispatch({
        type: "SET_TOAST",
        set_toast: payload,
      });
      // return res;
    } catch (error: any) {
      console.log(error);
    }
  };
