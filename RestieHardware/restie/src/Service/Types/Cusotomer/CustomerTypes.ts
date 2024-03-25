import { GetCustomerInformation } from "../../../Models/Response/Customer/GetCustomerModel";
export type CUSTOMER_INFORMATION = {
  type: "CUSTOMER_INFORMATION";
  customer_information: GetCustomerInformation;
};
export type CUSTOMER_INFORMATION_TYPE = CUSTOMER_INFORMATION;

export interface CustomerTypesModel {
  customer_information: GetCustomerInformation;
}
