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
import { arrowBack } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import restielogo from "../../assets/images/Icon@3.png";

import "./AddUserPage.css";
import PageNotFoundComponent from "../../components/PageNotFound/PageNotFoundComponent";
import { RootStore } from "../../Service/Store";
import AddUserComponent from "../../components/Admin/Users/ManageUsers/AddUserComponent";
const AddUserPage = () => {
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
          <IonTitle>Add New User</IonTitle>
        </IonToolbar>
        <IonToolbar
          mode="ios"
          color="tertiary"
          className="manage-toolbar-logo-container"
        >
          <IonImg src={restielogo} className="manage-toolbar-logo"></IonImg>
        </IonToolbar>
      </IonHeader>
      <AddUserComponent />
    </IonPage>
  ) : (
    <PageNotFoundComponent />
  );
};

export default AddUserPage;
