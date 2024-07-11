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
import React, { useEffect, useState } from "react";
import ManageProductComponent from "../../../components/Admin/Products/ManageProducts/ManageProductComponent";
import { RootStore, useTypedDispatch } from "../../../Service/Store";
import restielogo from "../../../assets/images/Icon@3.png";
import "./ManageProductPage.css";
import { arrowBack } from "ionicons/icons";
import { useSelector } from "react-redux";
import PageNotFoundComponent from "../../../components/PageNotFound/PageNotFoundComponent";
import AddNewItemComponent from "../../../components/Admin/Products/ManageProducts/AddNewItemComponent";
const AddNewItemPage = () => {
  const user_login_information = useSelector(
    (store: RootStore) => store.LoginReducer.user_login_information
  );

  const [isLoaded, setLoaded] = useState<boolean>(false);
  const router = useIonRouter();
  useEffect(() => {
    if (
      user_login_information?.role.trim().toLowerCase() === "admin" ||
      user_login_information?.role.trim().toLowerCase() === "super admin"
    ) {
      setLoaded(true);
    } else {
      router.push("/pageNotFound");
    }
  }, [user_login_information]);
  return isLoaded ? (
    <IonPage className="manage-page-container">
      <IonHeader className="manage-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonButtons slot="start" onClick={() => router.goBack()}>
            <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
          </IonButtons>
          <IonTitle>Add Item</IonTitle>
        </IonToolbar>
        <IonToolbar
          mode="ios"
          color="tertiary"
          className="manage-toolbar-logo-container"
        >
          <IonImg src={restielogo} className="manage-toolbar-logo"></IonImg>
        </IonToolbar>
      </IonHeader>
      <AddNewItemComponent />
    </IonPage>
  ) : (
    <PageNotFoundComponent />
  );
};

export default AddNewItemPage;
