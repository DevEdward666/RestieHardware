export interface InventoryModel {
  code: string;
  item: string;
  category: string;
  brand?: string;
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
  onhandqty?: number;
  qty: number;
  price: number;
  createdAt: number;
  status: string;
  orderid?: string;
  paidthru?: string;
  paidcash?: number;
  createdby?: string;
  userid?: string;
  type?: string;
  transid?: string;
  cashier?: string;
  customer?: string;
}
export interface SelectedItemToCart {
  code: string;
  item: string;
  onhandqty?: number;
  price: number;
  qty?: number;
  category?: string;
  brand?: string;
}
export interface PostdOrderList {
  userid: string;
  limit: number;
  offset: number;
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
export interface GetDeliveryImagePath {
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
