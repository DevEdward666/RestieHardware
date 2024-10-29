export interface AdminInventoryModel {
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
export interface SuppliersModel {
  supplierid: string;
  company: string;
  contactno: string;
  address: string;
  createdat: number;
}
export interface VouchersModel {
  voucher_seq: number;
  vouchercode: string;
  name: string;
  description: string;
  discount: number;
  type: string;
  voucher_for: string;
  createdby:string;
}

export interface UserNameModel {
  id: string;
  name: string;
  username: string;
  password: string;
  role: string;
}