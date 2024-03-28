import { ToastModel } from "../../../Models/Response/Commons/Commons";

export type SET_TOAST = {
  type: "SET_TOAST";
  set_toast: ToastModel;
};
export type COMMONS_TYPE = SET_TOAST;

export interface CommonsTypesModel {
  set_toast: ToastModel;
}
