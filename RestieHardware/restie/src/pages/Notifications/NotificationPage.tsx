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
import NotificationComponent from "../../components/Notification/NotificationComponent";
import { useTypedDispatch } from "../../Service/Store";
import { getReceivableList } from "../../Service/Actions/Inventory/InventoryActions";
import { arrowBack } from "ionicons/icons";

const NotificationPage: React.FC = () => {
  const dispatch = useTypedDispatch();
  const router = useIonRouter();
  useEffect(() => {
    const initialize = () => {
      dispatch(getReceivableList());
    };
    initialize();
  }, [dispatch]);
  return (
    <IonPage>
      <IonHeader className="order-list-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonButtons slot="start" onClick={() => router.push("/home/main")}>
            <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
          </IonButtons>
          <IonTitle>Notifications</IonTitle>
        </IonToolbar>
      </IonHeader>
      <NotificationComponent />
    </IonPage>
  );
};

export default NotificationPage;
