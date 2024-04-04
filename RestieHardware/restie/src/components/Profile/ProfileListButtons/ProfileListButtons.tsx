import {
  IonContent,
  IonButton,
  IonIcon,
  IonText,
  useIonRouter,
  IonLoading,
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
import { RemoveLoginUser } from "../../../Service/Actions/Login/LoginActions";
import { useCallback, useState } from "react";
const ProfileListButtons: React.FC = () => {
  const user_login_information = useSelector(
    (store: RootStore) => store.LoginReducer.user_login_information
  );
  const router = useIonRouter();
  const dispatch = useTypedDispatch();
  const [isOpenToast, setIsOpenToast] = useState({
    toastMessage: "",
    isOpen: false,
    type: "",
  });
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
  const handleLogout = useCallback(async () => {
    await LogoutUser();
    dispatch(RemoveLoginUser());
    setIsOpenToast((prev) => ({ ...prev, isOpen: true }));
    router.push("/login");
  }, [dispatch]);
  console.log(user_login_information);
  return (
    <IonContent>
      <IonLoading
        isOpen={isOpenToast?.isOpen}
        message="Loading"
        duration={1000}
        spinner="circles"
        onDidDismiss={() =>
          setIsOpenToast((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
      />
      <div className="profile-list-button-main-content">
        {user_login_information?.name?.length > 0 ? (
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
                <IonText className="profile-button-text">
                  Manage Product
                </IonText>
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
        ) : (
          <div className="profile-list-button-list-logout-container">
            <div
              className="profile-list-button-list-logout"
              onClick={() => router.push("/login")}
            >
              <IonText className="profile-button-text">Login</IonText>
              <IonButton fill="clear" className="profile-button-order">
                <IonIcon icon={chevronForwardOutline}></IonIcon>
              </IonButton>
            </div>
          </div>
        )}
      </div>
    </IonContent>
  );
};

export default ProfileListButtons;
