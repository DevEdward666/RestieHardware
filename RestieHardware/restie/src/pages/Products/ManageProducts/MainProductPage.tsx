import {
  getPlatforms,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import restielogo from "../../../assets/images/Icon@3.png";
import MainProductComponent from "../../../components/Admin/Products/ManageProducts/MainProductComponent";
import "./MainProductPage.css";
import { arrowBack } from "ionicons/icons";
const MainProductPage: React.FC = () => {
  const platform = getPlatforms();
  const router = useIonRouter();
  return (
    <IonPage className="main-product-page-container">
      <IonHeader className="main-product-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonButtons slot="start" onClick={() => router.push("/home/profile")}>
            <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
          </IonButtons>
          <IonTitle>Manage Product</IonTitle>
        </IonToolbar>
        <IonToolbar
          mode="ios"
          color="tertiary"
          className="main-product-toolbar-logo-container"
        >
          <div
            className={` ${
              platform.includes("mobileweb") && !platform.includes("tablet")
                ? ""
                : "web"
            }`}
          >
            <IonImg
              src={restielogo}
              className="main-product-toolbar-logo"
            ></IonImg>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="main-product-page-button-container">
          <MainProductComponent />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MainProductPage;
