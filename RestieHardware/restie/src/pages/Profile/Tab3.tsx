import {
  getPlatforms,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import ProfileListButtons from "../../components/Profile/ProfileListButtons/ProfileListButtons";
import "./Tab3.css";
const Tab3: React.FC = () => {
  const platform = getPlatforms();
  return (
    <IonPage className="profile-page-container">
      <IonHeader className="profile-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
        {/* <IonToolbar
          mode="ios"
          color="tertiary"
          className="profile-toolbar-logo-container"
        >
          <div
            className={` ${
              platform.includes("mobileweb") && !platform.includes("tablet")
                ? ""
                : "web"
            }`}
          >
            <IonImg src={restielogo} className="profile-toolbar-logo"></IonImg>
          </div>
        </IonToolbar> */}
      </IonHeader>
      <IonContent fullscreen>
        <div className="profile-page-button-container">
          <ProfileListButtons />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
