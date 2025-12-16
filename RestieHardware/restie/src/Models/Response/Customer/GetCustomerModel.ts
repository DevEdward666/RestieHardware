export interface GetCustomerInformation {
  customerid?: string;
  name: string;
  address: string;
  contactno: string;
  ordertype: string;
  customer_email?: string;
  newUser?: boolean;
}
export interface PutCustomerEmail {
  customerid: string;
  customer_email: string;
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
  contactno: string;
}
