import {
  IonButtons,
  IonHeader,
  IonIcon,
  IonImg,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import React from "react";
import SalesComponent from "../../../components/Admin/Products/Sales/SalesComponent";
import { arrowBack } from "ionicons/icons";
import restielogo from "../../../assets/images/Icon@3.png";
import "./SalesPage.css";
const SalesPage = () => {
  const router = useIonRouter();
  return (
    <IonPage className="sales-page-container">
      <IonHeader className="sales-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonButtons slot="start" onClick={() => router.goBack()}>
            <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
          </IonButtons>
          <IonTitle>Sales</IonTitle>
        </IonToolbar>
        <IonToolbar
          mode="ios"
          color="tertiary"
          className="sales-toolbar-logo-container"
        >
          <IonImg src={restielogo} className="sales-toolbar-logo"></IonImg>
        </IonToolbar>
      </IonHeader>
      <SalesComponent />
    </IonPage>
  );
};

export default SalesPage;
