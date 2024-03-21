import {
  InventoryTypesModel,
  LIST_OF_PRODUCT_TYPE,
} from "../../Types/Inventory/InventoryTypes";

const defaultState: InventoryTypesModel = {
  list_of_items: [],
  selected_item: {
    code: "",
    item: "",
    category: "",
    qty: 0,
    reorderqty: 0,
    cost: "",
    price: 0,
    status: "",
    createdat: 0,
    updatedAt: 0,
  },
  add_to_cart: {
    cartid: "",
    code: "",
    item: "",
    qty: 0,
    price: 0,
    createdAt: 0,
    status: "",
    onhandqty: 0,
  },
};

const InventoryReducer = (
  state: InventoryTypesModel = defaultState,
  action: LIST_OF_PRODUCT_TYPE
): InventoryTypesModel => {
  switch (action.type) {
    case "LIST_OF_ITEMS": {
      return {
        ...state,
        list_of_items: action.list_of_items,
      };
    }
    case "SELECTED_ITEM": {
      return {
        ...state,
        selected_item: action.selected_item,
      };
    }
    case "ADD_TO_CART": {
      return {
        ...state,
        add_to_cart: action.add_to_cart,
      };
    }
    default:
      return state;
  }
};

export default InventoryReducer;
