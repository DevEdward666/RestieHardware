export interface InventoryModel {
  code: string;
  item: string;
  category: string;
  brand?: string;
  qty: number;
  reorderqty: number;
  cost: string;
  image: string;
  price: number;
  status: string;
  createdat: number;
  updatedAt: number;
}
export interface Addtocart {
  cartid: string;
  code: string;
  item: string;
  onhandqty?: number;
  qty: number;
  price: number;
  createdAt: number;
  status: string;
  orderid?: string;
  paidthru?: string;
  paidcash?: number;
  image: string;
  createdby?: string;
  userid?: string;
  type?: string;
  transid?: string;
  cashier?: string;
  customer?: string;
  reorder?: boolean;
}
export interface ItemReturns {
  transid: string;
  orderid: string;
  cartid: string;
  code: string;
  item: string;
  qty: number;
  onhandqty?: number;
  price: number;
  total: number;
  createdat: number;
  status: string;
  remarks?: string;
}
export interface SelectedItemToCart {
  code: string;
  item: string;
  onhandqty?: number;
  price: number;
  qty?: number;
  category?: string;
  brand?: string;
  image: string;
}
export interface PostdOrderList {
  userid: string;
  limit: number;
  offset: number;
  status: string;
  searchdate?: string;
  orderid?: string;
}
export interface PostSelectedOrder {
  orderid: string;
  userid?: string;
  cartid?: string;
}
export interface PostDeliveryImage {
  FolderName: string;
  FileName: string;
  FormFile: File;
}
export interface PostDeliveryInfoOffline {
  deliveredby: string;
  deliverydate: number;
  imgData: string;
  createdat: number;
  createdby: string;
  orderid: string;
}
export interface PostDeliveryInfo {
  deliveredby: string;
  deliverydate: number;
  path: string;
  createdat: number;
  createdby: string;
  orderid: string;
}
export interface PostUpdateDeliveredOrder {
  transid: string;
  orderid: string;
  cartid: string;
  status: string;
  updateat: number;
}

export interface PostDeliveryInfoModel {
  orderid: string;
}
export interface PostVoucherInfoModel {
  vouchercode: string;
}
export interface PostDaysSalesModel {
  fromDate: string;
  toDate: string;
}
export interface GetItemToRefundRequest {
  transid: string;
}
export interface GetDeliveryImagePath {
  imagePath: string;
}
export interface GetItemImageRequest {
  imagePath: string;
}
export interface CategoryAndBrandModel {
  category: string;
  brand: string;
  filter: string;
}
export interface GetBrandsModel {
  category: string;
}
export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}
export interface OrderListFilter {
  filter: OrderListFilterModel;
}
interface OrderListFilterModel {
  status: string;
  date: string;
  search: string;
}
export interface SubmitReturnRefund {
  submit: boolean;
}
export interface CompleteReturnRefund {
  complete: boolean;
}
