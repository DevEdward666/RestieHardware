import { IonContent, IonPage } from "@ionic/react";
import { QueryClient } from "react-query";
import SelectedItemContainer from "../../components/SelectedItem/SelectedItemContainer";
import "./SelectedItemPage.css";
const SelectedItemPage: React.FC = () => {
  return (
    <IonContent>
      <SelectedItemContainer />
    </IonContent>
  );
};

export default SelectedItemPage;
