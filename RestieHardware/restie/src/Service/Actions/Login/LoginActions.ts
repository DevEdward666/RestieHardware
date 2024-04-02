import { Dispatch } from "react";
import { PostCustomer } from "../../../Models/Response/Customer/GetCustomerModel";
import { GetCustomerInfo } from "../../API/Inventory/InventoryApi";
import { GET_CUSTOMER } from "../../Types/Cusotomer/CustomerTypes";
import { PostLogin } from "../../../Models/Request/Login/LoginModel";
import { GetLoginUserAPI, LoginAPI } from "../../API/Login/LoginAPI";
import {
  LOGIN_INFORMATION,
  USER_LOGIN_INFORMATION,
} from "../../Types/LoginTypes/LoginTypes";
import {
  GetUserInfo,
  UserInfo,
} from "../../../Models/Response/Login/LoginModelResponse";

export const Login =
  (payload: PostLogin) => async (dispatch: Dispatch<LOGIN_INFORMATION>) => {
    try {
      const res: GetUserInfo = await LoginAPI(payload);
      localStorage.setItem("bearer", res?.accessToken);
      localStorage.setItem("user_id", res?.loginInfo.id);

      console.log(res);
      dispatch({
        type: "LOGIN_INFORMATION",
        login_information: res,
      });
      return res;
    } catch (error: any) {
      console.log(error);
    }
  };
export const GetLoginUser =
  () => async (dispatch: Dispatch<USER_LOGIN_INFORMATION>) => {
    try {
      const res: UserInfo = await GetLoginUserAPI();

      dispatch({
        type: "USER_LOGIN_INFORMATION",
        user_login_information: res,
      });
      return res;
    } catch (error: any) {
      console.log(error);
    }
  };
export const RemoveLoginUser =
  () => async (dispatch: Dispatch<USER_LOGIN_INFORMATION>) => {
    try {
      dispatch({
        type: "USER_LOGIN_INFORMATION",
        user_login_information: {
          id: "",
          username: "",
          name: "",
          role: "",
        },
      });
    } catch (error: any) {
      console.log(error);
    }
  };
