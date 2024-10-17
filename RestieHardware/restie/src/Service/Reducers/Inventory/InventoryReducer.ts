import {
  InventoryTypesModel,
  LIST_OF_PRODUCT_TYPE,
} from "../../Types/Inventory/InventoryTypes";

const defaultState: InventoryTypesModel = {
  list_of_items: [],
  selected_item: {
    code: "",
    item: "",
    onhandqty: 0,
    price: 0,
    image: "",
  },
  add_to_cart: [],
  order_list: [],
  order_list_info: {
    order_item: [],
    order_info: {
      orderid: "",
      cartid: "",
      total: 0,
      paidthru: "",
      paidcash: 0,
      createdby: "",
      createdat: 0,
      status: "",
      type: "",
      name: "",
      address: "",
      contactno: 0,
    },
    return_item: [],
  },
  get_delivery_info: {
    deliveryid: "",
    deliveredby: "",
    deliverydate: 0,
    path: "",
  },
  set_category_and_brand: {
    category: "",
    brand: "",
    filter: "",
  },
  get_brands: [],
  get_voucher: {
    name: "",
    description: "",
    maxredemption: "",
    discount: 0,
    type: "",
    voucher_for: "",
    vouchercode: ""
  },
  get_item_returns: [],
  submit_return_refund: { submit: false },
  checked_return_refund: [],
  complete_return_refund: { complete: false },
  receivable_list: [],
  get_voucher_list: []
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
    case "ORDER_LIST": {
      return {
        ...state,
        order_list: action.order_list,
      };
    }
    case "ORDER_LIST_INFO": {
      return {
        ...state,
        order_list_info: action.order_list_info,
      };
    }
    case "GET_DELIVERY_INFO": {
      return {
        ...state,
        get_delivery_info: action.get_delivery_info,
      };
    }
    case "SET_CATEGORY_AND_BRAND": {
      return {
        ...state,
        set_category_and_brand: action.set_category_and_brand,
      };
    }
    case "GET_BRANDS": {
      return {
        ...state,
        get_brands: action.get_brands,
      };
    }
    case "GET_VOUCHER": {
      return {
        ...state,
        get_voucher: action.get_voucher,
      };
    }
    case "GET_VOUCHER_LIST": {
      return {
        ...state,
        get_voucher_list: action.get_voucher_list,
      };
    }
    case "GET_ITEM_RETURNS": {
      return {
        ...state,
        get_item_returns: action.get_item_returns,
      };
    }
    case "SUBMIT_RETURN_REFUND": {
      return {
        ...state,
        submit_return_refund: action.submit_return_refund,
      };
    }
    case "COMPLETE_RETURN_REFUND": {
      return {
        ...state,
        complete_return_refund: action.complete_return_refund,
      };
    }
    case "CHECKED_RETURN_REFUND": {
      return {
        ...state,
        checked_return_refund: action.checked_return_refund,
      };
    }
    case "RECEIVABLE_LIST": {
      return {
        ...state,
        receivable_list: action.receivable_list,
      };
    }
    default:
      return state;
  }
};

export default InventoryReducer;
