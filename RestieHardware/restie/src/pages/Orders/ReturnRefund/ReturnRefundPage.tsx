import {
  IonButtons,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import React from "react";
import ReturnRefundComponent from "../../../components/Orders/ReturnRefund/ReturnRefundComponent";
import { arrowBack } from "ionicons/icons";

const ReturnRefundPage: React.FC = () => {
  const router = useIonRouter();
  const getOrderIDFromURL = () => {
    const url = new URL(window.location.href);
    return url.searchParams.get("orderid");
  };
  return (
    <IonPage>
      <IonHeader className="order-info-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonButtons
            slot="start"
            onClick={() =>
              router.push(`/orderInfo?orderid=${getOrderIDFromURL()!}`)
            }
          >
            <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
          </IonButtons>
          <IonTitle>Request Return/Refund</IonTitle>
        </IonToolbar>
      </IonHeader>
      <ReturnRefundComponent />
    </IonPage>
  );
};

export default ReturnRefundPage;
