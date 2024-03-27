import {
  IonContent,
  IonButton,
  IonIcon,
  IonText,
  useIonRouter,
} from "@ionic/react";
import "./ProfileListButtons.css";
import { chevronForwardOutline } from "ionicons/icons";
import { useTypedDispatch } from "../../../Service/Store";
import { ListOrder } from "../../../Service/API/Inventory/InventoryApi";
import {
  PostSelectedOrder,
  PostdOrderList,
} from "../../../Models/Request/Inventory/InventoryModel";
import { getOrderList } from "../../../Service/Actions/Inventory/InventoryActions";
import { LogoutUser } from "../../../Service/API/Login/LoginAPI";
const ProfileListButtons: React.FC = () => {
  const router = useIonRouter();
  const dispatch = useTypedDispatch();
  const handleOrderListClick = () => {
    const payload: PostdOrderList = {
      limit: 100,
      offset: 0,
      userid: "4105df30-717a-4170-af97-5dd8dacd03a2",
    };
    dispatch(getOrderList(payload));
    router.push("/orders");
  };
  const handleLogout = async () => {
    await LogoutUser();
    router.push("/login");
  };
  return (
    <IonContent>
      <div className="profile-list-button-main-content">
        <div className="profile-list-button-list-container">
          <div
            className="profile-list-button-list"
            onClick={() => handleOrderListClick()}
          >
            <IonText className="profile-button-text">Order List</IonText>
            <IonButton fill="clear" className="profile-button-order">
              <IonIcon icon={chevronForwardOutline}></IonIcon>
            </IonButton>
          </div>
          <div
            className="profile-list-button-list"
            onClick={() => handleLogout()}
          >
            <IonText className="profile-button-text">Logout</IonText>
            <IonButton fill="clear" className="profile-button-order">
              <IonIcon icon={chevronForwardOutline}></IonIcon>
            </IonButton>
          </div>
        </div>
      </div>
    </IonContent>
  );
};

export default ProfileListButtons;
