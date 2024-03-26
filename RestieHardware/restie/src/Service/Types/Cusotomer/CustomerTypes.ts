import {
  GetCustomerInformation,
  GetCustomers,
} from "../../../Models/Response/Customer/GetCustomerModel";
export type CUSTOMER_INFORMATION = {
  type: "CUSTOMER_INFORMATION";
  customer_information: GetCustomerInformation;
};
export type CUSTOMERS = {
  type: "CUSTOMERS";
  customers: GetCustomers[];
};
export type GET_CUSTOMER = {
  type: "GET_CUSTOMER";
  get_customer: GetCustomers;
};
export type CUSTOMER_INFORMATION_TYPE =
  | CUSTOMER_INFORMATION
  | CUSTOMERS
  | GET_CUSTOMER;

export interface CustomerTypesModel {
  customer_information: GetCustomerInformation;
  customers: GetCustomers[];
  get_customer: GetCustomers;
}
