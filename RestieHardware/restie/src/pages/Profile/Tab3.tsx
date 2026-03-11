import {
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import ProfileListButtons from "../../components/Profile/ProfileListButtons/ProfileListButtons";
import "./Tab3.css";
const Tab3: React.FC = () => {
  return (
    <IonPage className="profile-page-container">
      <IonHeader className="profile-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <ProfileListButtons />
    </IonPage>
  );
};

export default Tab3;
