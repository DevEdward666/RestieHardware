import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import React, { useCallback } from "react";
import ReturnRefundComponent from "../../../components/Orders/ReturnRefund/ReturnRefundComponent";
import { arrowBack } from "ionicons/icons";
import "./ReturnRefundPage.css";
import { useTypedDispatch } from "../../../Service/Store";
import { submit_return_refund } from "../../../Service/Actions/Inventory/InventoryActions";
import { SubmitReturnRefund } from "../../../Models/Request/Inventory/InventoryModel";
const ReturnRefundPage: React.FC = () => {
  const router = useIonRouter();
  const dispatch = useTypedDispatch();
  const getOrderIDFromURL = () => {
    const url = new URL(window.location.href);
    return url.searchParams.get("orderid");
  };
  const handleReturnRefund = useCallback(() => {
    const payload: SubmitReturnRefund = {
      submit: true,
    };
    dispatch(submit_return_refund(payload));
  }, [dispatch]);
  return (
    <IonPage className="return-refund-page-main">
      <IonHeader className="order-info-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonButtons
            slot="start"
            onClick={() =>
              router.push(
                `/orderInfo?orderid=${getOrderIDFromURL()!}&return=false`
              )
            }
          >
            <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
          </IonButtons>
          <IonTitle>Request Return/Refund</IonTitle>
        </IonToolbar>
      </IonHeader>
      <ReturnRefundComponent />
      <div className="return-refund-button-container">
        <IonButton
          className="return-refund-button-list-normal"
          color={"medium"}
          onClick={() => handleReturnRefund()}
        >
          Next
        </IonButton>
      </div>
    </IonPage>
  );
};

export default ReturnRefundPage;
