import {
  IonButtons,
  IonContent,
  IonHeader,
  IonImg,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import ExploreContainer from "../../components/ExploreContainer";
import "./Tab3.css";
import restielogo from "../../assets/images/Icon@3.png";
import ProfileListButtons from "../../components/Profile/ProfileListButtons/ProfileListButtons";
const Tab3: React.FC = () => {
  return (
    <IonPage className="profile-page-container">
      <IonHeader className="profile-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonButtons slot="start">
            <IonMenuButton autoHide={false}></IonMenuButton>
          </IonButtons>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
        <IonToolbar
          mode="ios"
          color="tertiary"
          className="profile-toolbar-logo-container"
        >
          <IonImg src={restielogo} className="profile-toolbar-logo"></IonImg>
        </IonToolbar>
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
