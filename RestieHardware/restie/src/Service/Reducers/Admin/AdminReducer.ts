import {
  ADMIN_LIST_OF_ITEMS_TYPE,
  AdminTypesModel,
} from "../../Types/Admin/AdminTypes";

const defaultState: AdminTypesModel = {
  admin_list_of_items: [],
  admin_list_of_supplier: [],
};

const AdminReducer = (
  state: AdminTypesModel = defaultState,
  action: ADMIN_LIST_OF_ITEMS_TYPE
): AdminTypesModel => {
  switch (action.type) {
    case "ADMIN_LIST_OF_ITEMS": {
      return {
        ...state,
        admin_list_of_items: action.admin_list_of_items,
      };
    }
    case "ADMIN_LIST_OF_SUPPLIERS": {
      return {
        ...state,
        admin_list_of_supplier: action.admin_list_of_supplier,
      };
    }
    default:
      return state;
  }
};

export default AdminReducer;
