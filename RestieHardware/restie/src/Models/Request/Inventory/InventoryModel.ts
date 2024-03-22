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
}