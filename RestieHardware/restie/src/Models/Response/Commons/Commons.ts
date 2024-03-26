export interface ResponseModel {
  status: number;
  message: string;
  result?: {
    cartid: string;
    orderid: string;
  };
}
