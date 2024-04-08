import {
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import React from "react";
import OrderListComponent from "../../../components/Orders/OrderList/OrderListComponent";
import restielogo from "../../../assets/images/Icon@3.png";
import { arrowBack } from "ionicons/icons";
import "./PaymentOptionsPage.css";
import PaymentOptionsComponent from "../../../components/Payment/PaymentOptions/PaymentOptionsComponent";
import { useTypedDispatch } from "../../../Service/Store";
import { get_voucher_actions } from "../../../Service/Actions/Inventory/InventoryActions";
const PaymentOptionsPage = () => {
  const router = useIonRouter();
  const dispatch = useTypedDispatch();
  return (
    <IonPage className="payment-options-page-container">
      <IonHeader className="payment-options-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonButtons
            slot="start"
            onClick={() => {
              router.goBack();
              dispatch(get_voucher_actions({ vouchercode: "" }));
            }}
          >
            <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
          </IonButtons>
          <IonTitle>Payment Options</IonTitle>
        </IonToolbar>
        <IonToolbar
          mode="ios"
          color="tertiary"
          className="payment-options-toolbar-logo-container"
        >
          <IonImg
            src={restielogo}
            className="payment-options-toolbar-logo"
          ></IonImg>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div>
          <PaymentOptionsComponent />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PaymentOptionsPage;
