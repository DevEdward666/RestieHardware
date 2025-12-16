export interface PostInventoryModel {
  item: string;
  category: string;
  brand: string;

  code: string;
  onhandqty: number;
  addedqty: number;
  supplierid: string;
  supplierName: string;

  cost: number;
  price: number;
  createdat: number;
  updatedAt: number;
}

export interface PostDeliveryReceipt {
  items:ProductInfo[],
  supplierId:string,
}
export interface ProductInfo {
  item: string;
  category: string;
  brand: string;

  code: string;
  onhandqty: number;
  addedqty: number;
  supplierid: string;
  supplierName: string;

  cost: number;
  price: number;
}
export interface PostNewItemInventoryModel {
  image: string;
  code: string;
  item: string;
  category: string;
  brand: string;

  onhandqty: number;
  addedqty: number;
  supplierid: string;
  supplierName: string;

  cost: number;
  price: number;
  createdat: number;
  status:string;
  updatedAt: number;
}

export interface PostNewSupplierModel {
  company: string;
  contactno: number;
  address: string;
  createdat:number;
  supplierid?:string;
}

export interface PostNewVoucherModel {
  voucher_seq: number;
  vouchercode: string;
  name: string;
  description: string;
  type: string;
  discount: number;
  voucher_for: string;
  createdby:string;
}

export interface PostAddNewUser{
  id: string;
  name: string;
  username: string;
  password: string;
  confirm_password: string;
  role: string;
}