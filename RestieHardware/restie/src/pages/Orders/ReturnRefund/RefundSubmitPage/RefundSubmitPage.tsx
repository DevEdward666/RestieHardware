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
import RefundSubmitComponents from "../../../../components/Orders/ReturnRefund/RefundSubmitComponents/RefundSubmitComponents";
import { arrowBack } from "ionicons/icons";
import {
  CompleteReturnRefund,
  SubmitReturnRefund,
} from "../../../../Models/Request/Inventory/InventoryModel";
import {
  complete_return_refund,
  submit_return_refund,
} from "../../../../Service/Actions/Inventory/InventoryActions";
import { useTypedDispatch } from "../../../../Service/Store";
import "./RefundSubmitPage.css";
const RefundSubmitPage = () => {
  const router = useIonRouter();
  const dispatch = useTypedDispatch();
  const handleReturnRefund = useCallback(() => {
    dispatch(complete_return_refund({ complete: true }));
  }, [dispatch]);
  return (
    <IonPage>
      <IonHeader className="order-info-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonButtons slot="start" onClick={() => router.goBack()}>
            <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
          </IonButtons>
          <IonTitle>Request Return/Refund</IonTitle>
        </IonToolbar>
      </IonHeader>
      <RefundSubmitComponents />
      <div className="complete-return-refund-button-container">
        <IonButton
          className="complete-return-refund-button-list-normal"
          color={"medium"}
          onClick={() => handleReturnRefund()}
        >
          Submit for Return/Refund
        </IonButton>
      </div>
    </IonPage>
  );
};

export default RefundSubmitPage;
