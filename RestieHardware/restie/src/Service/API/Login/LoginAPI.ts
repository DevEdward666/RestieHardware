import { baseUrl } from "../../../Helpers/environment";
import { get, getWithAuth, post } from "../../../Helpers/useAxios";
import { PostLogin } from "../../../Models/Request/Login/LoginModel";
import { PostCustomer } from "../../../Models/Response/Customer/GetCustomerModel";

export const LoginAPI = async (payload: PostLogin) => {
  const response = await post(
    `${baseUrl}api/user/login`,
    {
      "Content-Type": "application/json",
    },
    JSON.stringify(payload)
  );
  return response;
};
export const GetLoginUserAPI = async () => {
  try {
    const getToken = localStorage.getItem("bearer");
    if (!getToken) {
      throw new Error("Token not found");
    }

    const response = await getWithAuth(
      `${baseUrl}api/user/userinfo`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken}`,
        },
      },
      getToken
    );
    return response; // Return only response data
  } catch (error) {
    console.warn("Error while fetching user info:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
export const LogoutUser = async () => {
  try {
    const getToken = localStorage.getItem("bearer");
    if (!getToken) {
      throw new Error("Token not found");
    }

    const response = await getWithAuth(
      `${baseUrl}api/user/logout`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken}`,
        },
      },
      getToken
    );
    localStorage.removeItem("bearer");
    return response; // Return only response data
  } catch (error) {
    console.error("Error while fetching user info:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
};
