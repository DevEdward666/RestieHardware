import {
  IonContent,
  IonButton,
  IonIcon,
  IonText,
  useIonRouter,
  IonLoading,
  getPlatforms,
} from "@ionic/react";
import "./ProfileListButtons.css";
import {
  bagOutline,
  barChartOutline,
  cartOutline,
  cashOutline,
  chevronForwardOutline,
  logInOutline,
  logOutOutline,
  personAdd,
  syncCircle,
  syncCircleOutline,
  syncCircleSharp,
  syncOutline,
} from "ionicons/icons";
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
  const platform = getPlatforms();
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
      status: "pending",
      searchdate: "",
      orderid: "",
      paidThru: "",
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
          <div
            className={`profile-list-button-list-container ${
              platform.includes("mobileweb") && !platform.includes("tablet")
                ? "profile-list-mobile"
                : "profile-list-desktop"
            }`}
          >
            <div
              className="profile-list-button-list"
              onClick={() => handleOrderListClick()}
            >
              <IonButton fill="clear" className="profile-button-order">
                <IonIcon icon={cartOutline}></IonIcon>
                <IonText className="profile-button-text">Order List</IonText>
              </IonButton>

              <IonButton fill="clear" className="profile-button-order">
                <IonIcon icon={chevronForwardOutline}></IonIcon>
              </IonButton>
            </div>
            {user_login_information?.role.trim().toLowerCase() === "admin" ||
            user_login_information?.role.trim().toLowerCase() ===
              "super admin" ? (
              <>
                <div
                  className="profile-list-button-list"
                  onClick={() => router.push("/admin/mainmanageproduct")}
                >
                  <IonButton fill="clear" className="profile-button-order">
                    <IonIcon icon={bagOutline}></IonIcon>
                    <IonText className="profile-button-text">
                      Manage Product
                    </IonText>
                  </IonButton>

                  <IonButton fill="clear" className="profile-button-order">
                    <IonIcon icon={chevronForwardOutline}></IonIcon>
                  </IonButton>
                </div>
                <div
                  className="profile-list-button-list"
                  onClick={() => router.push("/admin/sales")}
                >
                  <IonButton fill="clear" className="profile-button-order">
                    <IonIcon icon={barChartOutline}></IonIcon>
                    <IonText className="profile-button-text">
                      Manage Sales
                    </IonText>
                  </IonButton>

                  <IonButton fill="clear" className="profile-button-order">
                    <IonIcon icon={chevronForwardOutline}></IonIcon>
                  </IonButton>
                </div>
                {user_login_information?.role.trim().toLowerCase() ===
                "super admin" ? (
                  <div
                    className="profile-list-button-list"
                    onClick={() => router.push("/admin/add-new-user")}
                  >
                    <IonButton fill="clear" className="profile-button-order">
                      <IonIcon icon={personAdd}></IonIcon>
                      <IonText className="profile-button-text">
                        Manage User
                      </IonText>
                    </IonButton>

                    <IonButton fill="clear" className="profile-button-order">
                      <IonIcon icon={chevronForwardOutline}></IonIcon>
                    </IonButton>
                  </div>
                ) : null}

                <div
                  className="profile-list-button-list"
                  onClick={() => router.push("/DeliverOffline")}
                >
                  <IonButton fill="clear" className="profile-button-order">
                    <IonIcon icon={syncOutline}></IonIcon>
                    <IonText className="profile-button-text">
                      Offline Deliveries Sync
                    </IonText>
                  </IonButton>

                  <IonButton fill="clear" className="profile-button-order">
                    <IonIcon icon={chevronForwardOutline}></IonIcon>
                  </IonButton>
                </div>
              </>
            ) : null}

            <div
              className={`profile-list-button-list-logout-container ${
                platform.includes("mobileweb") && !platform.includes("tablet")
                  ? "profile-logout-mobile"
                  : "profile-logout-desktop"
              }`}
            >
              <div
                className="profile-list-button-list-logout"
                onClick={() => handleLogout()}
              >
                <IonButton fill="clear" className="profile-button-order">
                  <IonIcon icon={logOutOutline}></IonIcon>
                  <IonText className="profile-button-text">Logout</IonText>
                </IonButton>
                <IonButton fill="clear" className="profile-button-order">
                  <IonIcon icon={chevronForwardOutline}></IonIcon>
                </IonButton>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`profile-list-button-list-logout-container ${
              platform.includes("mobileweb") && !platform.includes("tablet")
                ? "profile-logout-mobile"
                : "profile-logout-desktop"
            }`}
          >
            <div
              className="profile-list-button-list-logout"
              onClick={() => router.push("/login")}
            >
              <IonButton fill="clear" className="profile-button-order">
                <IonIcon icon={logInOutline}></IonIcon>
                <IonText className="profile-button-text">Login</IonText>
              </IonButton>

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
