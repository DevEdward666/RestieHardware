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
import "./DeliveryInfoPage.css";
import DeliveryInfoComponent from "../../../components/Delivery/DeliveryInfo/DeliveryInfoComponent";
import { arrowBack } from "ionicons/icons";
import restielogo from "../../../assets/images/Icon@3.png";
import { getPlatforms } from "@ionic/react";
const DeliveryInfoPage = () => {
  const router = useIonRouter();
  const platform = getPlatforms();
  return (
    <IonPage>
      <IonHeader className="delivery-info-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonButtons slot="start" onClick={() => router.goBack()}>
            <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
          </IonButtons>
          <IonTitle> Delivery Images</IonTitle>
        </IonToolbar>
        <IonToolbar
          mode="ios"
          color="tertiary"
          className="delivery-toolbar-logo-container"
        >
          <div
            className={` ${
              platform.includes("mobileweb") && !platform.includes("tablet")
                ? ""
                : "web"
            }`}
          >
            <IonImg src={restielogo} className="delivery-toolbar-logo"></IonImg>
          </div>
        </IonToolbar>
      </IonHeader>
      <DeliveryInfoComponent />
    </IonPage>
  );
};

export default DeliveryInfoPage;
