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
import "./OrderListPage.css";
const OrderListPage = () => {
  const router = useIonRouter();
  return (
    <IonPage className="order-list-page-container">
      <IonHeader className="order-list-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonButtons slot="start" onClick={() => router.goBack()}>
            <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
          </IonButtons>
          <IonTitle>Order List</IonTitle>
        </IonToolbar>
        <IonToolbar
          mode="ios"
          color="tertiary"
          className="order-list-toolbar-logo-container"
        >
          <IonImg src={restielogo} className="order-list-toolbar-logo"></IonImg>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div>
          <OrderListComponent />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OrderListPage;
