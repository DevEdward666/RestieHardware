export interface GetCustomerInformation {
  customerid?: string;
  name: string;
  address: string;
  contactno: number;
  ordertype: string;
  newUser?: boolean;
}
export interface GetPaymentInfo {
  cash: number;
  voucher?: string;
}
export interface PostCustomer {
  customerid: string;
}
export interface GetCustomers {
  customerid: string;
  name: string;
  address: string;
  contactno: number;
}
