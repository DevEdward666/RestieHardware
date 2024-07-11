import {
  getPlatforms,
  IonButton,
  IonContent,
  IonIcon,
  IonText,
  useIonRouter,
} from "@ionic/react";
import "./MainProductComponent.css";
import { bagOutline, chevronForwardOutline } from "ionicons/icons";
import { useSelector } from "react-redux";
import { RootStore } from "../../../../Service/Store";
const MainProductComponent: React.FC = () => {
  const router = useIonRouter();
  const platform = getPlatforms();
  const user_login_information = useSelector(
    (store: RootStore) => store.LoginReducer.user_login_information
  );
  return (
    <IonContent fullscreen className="main-product-content">
      <div className="main-manage-list-button-list-container">
        {user_login_information?.role.trim().toLowerCase() === "admin" ||
        user_login_information?.role.trim().toLowerCase() === "super admin" ? (
          <>
            <div
              className="main-manage-list-button-list"
              onClick={() => router.push("/admin/addNewItem")}
            >
              <IonButton fill="clear" className="main-manage-button-order">
                <IonIcon icon={bagOutline}></IonIcon>
                <IonText className="main-manage-button-text">
                  Add New Product
                </IonText>
              </IonButton>

              <IonButton fill="clear" className="main-manage-button-order">
                <IonIcon icon={chevronForwardOutline}></IonIcon>
              </IonButton>
            </div>
            <div
              className="main-manage-list-button-list"
              onClick={() => router.push("/admin/manageproduct")}
            >
              <IonButton fill="clear" className="main-manage-button-order">
                <IonIcon icon={bagOutline}></IonIcon>
                <IonText className="main-manage-button-text">
                  Update Product
                </IonText>
              </IonButton>

              <IonButton fill="clear" className="main-manage-button-order">
                <IonIcon icon={chevronForwardOutline}></IonIcon>
              </IonButton>
            </div>
          </>
        ) : null}
      </div>
    </IonContent>
  );
};

export default MainProductComponent;
