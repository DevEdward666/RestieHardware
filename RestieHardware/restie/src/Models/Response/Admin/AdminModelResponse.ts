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
