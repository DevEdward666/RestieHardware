import {
  IonContent,
  IonButton,
  IonIcon,
  IonText,
  useIonRouter,
} from "@ionic/react";
import "./ProfileListButtons.css";
import { chevronForwardOutline } from "ionicons/icons";
import { RootStore, useTypedDispatch } from "../../../Service/Store";
import { ListOrder } from "../../../Service/API/Inventory/InventoryApi";
import {
  PostSelectedOrder,
  PostdOrderList,
} from "../../../Models/Request/Inventory/InventoryModel";
import { getOrderList } from "../../../Service/Actions/Inventory/InventoryActions";
import { LogoutUser } from "../../../Service/API/Login/LoginAPI";
import { useSelector } from "react-redux";
const ProfileListButtons: React.FC = () => {
  const user_login_information = useSelector(
    (store: RootStore) => store.LoginReducer.user_login_information
  );
  const router = useIonRouter();
  const dispatch = useTypedDispatch();

  const handleOrderListClick = () => {
    const user_id = localStorage.getItem("user_id");
    const payload: PostdOrderList = {
      limit: 100,
      offset: 0,
      userid: user_id!,
    };
    dispatch(getOrderList(payload));
    router.push("/orders");
  };
  const handleLogout = async () => {
    await LogoutUser();
    router.push("/login");
  };
  console.log(user_login_information);
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
          {user_login_information?.role.trim().toLowerCase() === "admin" ||
          user_login_information?.role.trim().toLowerCase() ===
            "super admin" ? (
            <div
              className="profile-list-button-list"
              onClick={() => router.push("/admin/manageproduct")}
            >
              <IonText className="profile-button-text">Manage Product</IonText>
              <IonButton fill="clear" className="profile-button-order">
                <IonIcon icon={chevronForwardOutline}></IonIcon>
              </IonButton>
            </div>
          ) : null}

          <div className="profile-list-button-list-logout-container">
            <div
              className="profile-list-button-list-logout"
              onClick={() => handleLogout()}
            >
              <IonText className="profile-button-text">Logout</IonText>
              <IonButton fill="clear" className="profile-button-order">
                <IonIcon icon={chevronForwardOutline}></IonIcon>
              </IonButton>
            </div>
          </div>
        </div>
      </div>
    </IonContent>
  );
};

export default ProfileListButtons;
