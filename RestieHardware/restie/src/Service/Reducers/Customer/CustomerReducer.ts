import {
  CUSTOMER_INFORMATION_TYPE,
  CustomerTypesModel,
} from "../../Types/Cusotomer/CustomerTypes";

const defaultState: CustomerTypesModel = {
  customer_information: {
    name: "",
    address: "",
    contact: 0,
    ordertype: "",
    customerid: "",
  },
};

const CustomerReducer = (
  state: CustomerTypesModel = defaultState,
  action: CUSTOMER_INFORMATION_TYPE
): CustomerTypesModel => {
  switch (action.type) {
    case "CUSTOMER_INFORMATION": {
      return {
        ...state,
        customer_information: action.customer_information,
      };
    }

    default:
      return state;
  }
};

export default CustomerReducer;
