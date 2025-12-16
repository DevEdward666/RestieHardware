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
import { useEffect, useState } from "react";
import OrderInfoComponent from "../../../components/Orders/OrderInfo/OrderInfo";
import "./OrderInfo.css";
import { arrowBack } from "ionicons/icons";
const OrderInfoPage = () => {
  const router = useIonRouter();

  const [isFromNotif, setIsFromNotif] = useState<string>("");
  const isNotification = () => {
    const url = new URL(window.location.href);
    const isnotif = url.searchParams.get("notification");
    setIsFromNotif(isnotif!);
  };
  useEffect(() => {
    const initialize = async () => {
      isNotification();
    };
    initialize();
  }, []);
  return (
    <IonPage className="order-info-page-container">
      <IonHeader className="order-info-page-header">
        <IonToolbar mode="ios" color="tertiary">
          {isFromNotif === "true" ? (
            <IonButtons slot="start" onClick={() => router.goBack()}>
              <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
            </IonButtons>
          ) : null}

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
