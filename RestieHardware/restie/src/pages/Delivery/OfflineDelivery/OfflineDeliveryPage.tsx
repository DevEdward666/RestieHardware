import {
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import { arrowBackOutline } from "ionicons/icons";
import OfflineDeliveryComponent from "../../../components/Delivery/OfflineDelivery/OfflineDeliveryComponent";
import "./OfflineDeliveryPage.css";
const OfflineDeliveryPage = () => {
  const router = useIonRouter();
  return (
    <IonPage className="offline-page-container">
      <IonHeader className="offline-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonButtons slot="start" onClick={() => router.goBack()}>
            <IonIcon src={arrowBackOutline}></IonIcon>
          </IonButtons>
          <IonTitle>Offline Delivery</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="offline-page-content">
        <OfflineDeliveryComponent />
      </IonContent>
    </IonPage>
  );
};

export default OfflineDeliveryPage;
