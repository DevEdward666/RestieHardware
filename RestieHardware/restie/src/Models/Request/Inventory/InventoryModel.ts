export interface InventoryModel {
  code: string;
  item: string;
  category: string;
  qty: number;
  reorderqty: number;
  cost: string;
  price: number;
  status: string;
  createdat: number;
  updatedAt: number;
}
export interface Addtocart {
  cartid: string;
  code: string;
  item: string;
  onhandqty: number;
  qty: number;
  price: number;
  createdAt: number;
  status: string;
  orderid?: string;
  paidthru?: string;
  paidcash?: number;
  createdby?: string;
}
export interface SelectedItemToCart {
  code: string;
  item: string;
  onhandqty: number;
  price: number;
  qty?: number;
}
export interface PostdOrderList {
  userid: string;
  limit: number;
  offset: number;
}
export interface PostSelectedOrder {
  userid: string;
  orderid: string;
}
