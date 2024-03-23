export interface GetListOrder {
  orderid: string;
  cartid: string;
  total: number;
  paidthru: string;
  paidcash: number;
  createdby: string;
  createdat: number;
  status: string;
  userid: string;
}
export interface SelectedOrder {
  cartid: string;
  code: string;
  item: string;
  qty: number;
  price: number;
  createdAt: number;
  status: string;
  orderId: string;
  paidthru: string;
  paidcash: number;
  createdby: string;
}
