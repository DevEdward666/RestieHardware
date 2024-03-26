import {
  CUSTOMER_INFORMATION_TYPE,
  CustomerTypesModel,
} from "../../Types/Cusotomer/CustomerTypes";

const defaultState: CustomerTypesModel = {
  customer_information: {
    name: "",
    address: "",
    contactno: 0,
    ordertype: "",
    customerid: "",
  },
  customers: [],
  get_customer: {
    customerid: "",
    name: "",
    address: "",
    contactno: 0,
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
    case "CUSTOMERS": {
      return {
        ...state,
        customers: action.customers,
      };
    }
    case "GET_CUSTOMER": {
      return {
        ...state,
        get_customer: action.get_customer,
      };
    }

    default:
      return state;
  }
};

export default CustomerReducer;
