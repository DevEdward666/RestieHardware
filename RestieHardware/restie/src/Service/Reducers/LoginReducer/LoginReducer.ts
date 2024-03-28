import {
  LOGIN_INFORMATION_TYPE,
  LoginTypesModel,
} from "../../Types/LoginTypes/LoginTypes";

const defaultState: LoginTypesModel = {
  login_information: {
    loginInfo: {
      username: "",
      name: "",
      role: "",
      id: "",
    },
    accessToken: "",
    refreshToken: "",
  },
  user_login_information: {
    username: "",
    name: "",
    role: "",
    id: "",
  },
};

const LoginReducer = (
  state: LoginTypesModel = defaultState,
  action: LOGIN_INFORMATION_TYPE
): LoginTypesModel => {
  switch (action.type) {
    case "LOGIN_INFORMATION": {
      return {
        ...state,
        login_information: action.login_information,
      };
    }
    case "USER_LOGIN_INFORMATION": {
      return {
        ...state,
        user_login_information: action.user_login_information,
      };
    }
    default:
      return state;
  }
};

export default LoginReducer;
