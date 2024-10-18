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

export interface GetListOrderInfo {
  order_item: GetOrderItems[];
  return_item: ReturnItems[];
  order_info: GetOrderInfo;
}
export interface GetOrderInfo {
  transid?: string;
  orderid: string;
  cartid: string;
  total: number;
  totaldiscount: number;
  paidthru: string;
  paidcash: number;
  createdby: string;
  createdat: number;
  status: string;
  type: string;
  name: string;
  address: string;
  contactno: number;
  customerid?: string;
  customer_email?: string;
}
export interface ReturnItems {
  transid: string;
  orderid: string;
  code: string;
  item: string;
  remarks: string;
  qty: number;
  total: number;
  price: number;
  createdat: number;
}
export interface GetOrderItems {
  code: string;
  item: string;
  price: number;
  qty: number;
  onhandqty?: number;
  category: string;
  brand: string;
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
export interface GetDeliveryInfo {
  deliveryid: string;
  deliveredby: string;
  deliverydate: number;
  path: string;
}
export interface FileResponse {
  contentType: string;
  enableRangeProcessing: boolean;
  entityTag: string;
  fileContents: string;
  fileDownloadName: string;
  lastModified: number;
}
export interface GetVouhcerResponse {
  vouchercode:string;
  name: string;
  description: string;
  maxredemption: string;
  discount: number;
  type: string;
  voucher_for: string;

}
export interface GetBrandsModel {
  brand: string;
}
