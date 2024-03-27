import {
  GetUserInfo,
  UserInfo,
} from "../../../Models/Response/Login/LoginModelResponse";
export type LOGIN_INFORMATION = {
  type: "LOGIN_INFORMATION";
  login_information: GetUserInfo;
};
export type USER_LOGIN_INFORMATION = {
  type: "USER_LOGIN_INFORMATION";
  user_login_information: UserInfo;
};
export type LOGIN_INFORMATION_TYPE = LOGIN_INFORMATION | USER_LOGIN_INFORMATION;

export interface LoginTypesModel {
  login_information: GetUserInfo;
  user_login_information: UserInfo;
}
