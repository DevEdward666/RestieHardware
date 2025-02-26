export interface ResponseModel {
  status: number;
  message: string;
  result?: {
    cartid: string;
    orderid: string;
  };
}
export interface ToastModel {
  isOpen: boolean;
  message: string;
  color: string;
  position: string;
}

export interface TypeOfDeliveryReceipt {
  id: number;
  name: string;
  type: string;
}