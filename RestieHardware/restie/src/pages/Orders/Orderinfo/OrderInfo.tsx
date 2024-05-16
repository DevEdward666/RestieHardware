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
import OrderInfoComponent from "../../../components/Orders/OrderInfo/OrderInfo";
import { arrowBack } from "ionicons/icons";
import restielogo from "../../../assets/images/Icon@3.png";
import "./OrderInfo.css";
const OrderInfoPage = () => {
  const router = useIonRouter();
  return (
    <IonPage className="order-info-page-container">
      <IonHeader className="order-info-page-header">
        <IonToolbar mode="ios" color="tertiary">
          {/* <IonButtons slot="start" onClick={() => router.goBack()}>
            <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
          </IonButtons> */}
          <IonTitle>Order Summary</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="order-info-content">
        <div className={`order-info-container`}>
          <OrderInfoComponent />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OrderInfoPage;
