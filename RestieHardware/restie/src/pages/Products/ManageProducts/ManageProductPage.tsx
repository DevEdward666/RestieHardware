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
import React, { useEffect } from "react";
import ManageProductComponent from "../../../components/Admin/Products/ManageProducts/ManageProductComponent";
import { useTypedDispatch } from "../../../Service/Store";
import restielogo from "../../../assets/images/Icon@3.png";
import "./ManageProductPage.css";
import { arrowBack } from "ionicons/icons";
const ManageProductPage = () => {
  const router = useIonRouter();
  return (
    <IonPage className="manage-page-container">
      <IonHeader className="manage-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonButtons slot="start" onClick={() => router.goBack()}>
            <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
          </IonButtons>
          <IonTitle>Manage Products</IonTitle>
        </IonToolbar>
        <IonToolbar
          mode="ios"
          color="tertiary"
          className="manage-toolbar-logo-container"
        >
          <IonImg src={restielogo} className="manage-toolbar-logo"></IonImg>
        </IonToolbar>
      </IonHeader>
      <ManageProductComponent />
    </IonPage>
  );
};

export default ManageProductPage;
