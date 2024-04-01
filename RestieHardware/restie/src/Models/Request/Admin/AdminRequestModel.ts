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
