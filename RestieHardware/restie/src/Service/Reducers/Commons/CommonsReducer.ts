import {
  COMMONS_TYPE,
  CommonsTypesModel,
} from "../../Types/Commons/CommonsType";

const defaultState: CommonsTypesModel = {
  set_toast: {
    isOpen: false,
    message: "",
    color: "",
    position: "",
  },
};

const CustomerReducer = (
  state: CommonsTypesModel = defaultState,
  action: COMMONS_TYPE
): CommonsTypesModel => {
  switch (action.type) {
    case "SET_TOAST": {
      return {
        ...state,
        set_toast: action.set_toast,
      };
    }

    default:
      return state;
  }
};

export default CustomerReducer;
