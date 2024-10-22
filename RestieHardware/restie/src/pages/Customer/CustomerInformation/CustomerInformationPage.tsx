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
import "./CustomerInformation.css";
import { getPlatforms } from "@ionic/react";
import CustomerInformationComponent from "../../../components/Customer/CustomerInformation/CustomerInformationComponents";
const CustomerInformationPage = () => {
  const router = useIonRouter();
  const platform = getPlatforms();
  return (
    <IonPage className="customer-info-page-container">
      <IonHeader className="customer-info-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonButtons slot="start" onClick={() => router.goBack()}>
            <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
          </IonButtons>
          <IonTitle>Customer Information</IonTitle>
        </IonToolbar>
        {/* <IonToolbar
          mode="ios"
          color="tertiary"
          className="customer-toolbar-logo-container"
        >
          <div
            className={` ${
              platform.includes("mobileweb") && !platform.includes("tablet")
                ? ""
                : "web"
            }`}
          >
            <IonImg src={restielogo} className="customer-toolbar-logo"></IonImg>
          </div>
        </IonToolbar> */}
      </IonHeader>
      <IonContent fullscreen className="customer-info-content">
        <CustomerInformationComponent />
      </IonContent>
    </IonPage>
  );
};

export default CustomerInformationPage;
