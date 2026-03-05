import {
  IonContent,
  IonIcon,
  useIonRouter,
  IonLoading,
} from "@ionic/react";
import "./ProfileListButtons.css";
import {
  bagOutline,
  barChartOutline,
  cartOutline,
  chevronForwardOutline,
  logInOutline,
  logOutOutline,
  personAdd,
  syncOutline,
} from "ionicons/icons";
import { RootStore, useTypedDispatch } from "../../../Service/Store";
import {
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

  const isAdmin =
    user_login_information?.role?.trim().toLowerCase() === "admin" ||
    user_login_information?.role?.trim().toLowerCase() === "super admin";
  const isSuperAdmin =
    user_login_information?.role?.trim().toLowerCase() === "super admin";

  const initials = user_login_information?.name
    ? user_login_information.name.trim().charAt(0)
    : "?";

  return (
    <IonContent className="pf-content">
      <IonLoading
        isOpen={isOpenToast?.isOpen}
        message="Loading"
        duration={1000}
        spinner="circles"
        onDidDismiss={() => setIsOpenToast((prev) => ({ ...prev, isOpen: false }))}
      />

      <div className="pf-scroll">
        <div className="pf-inner">

          {user_login_information?.name?.length > 0 ? (
            <>
              {/* ── User hero card ── */}
              <div className="pf-hero">
                <div className="pf-avatar">{initials}</div>
                <div className="pf-hero-info">
                  <p className="pf-hero-name">{user_login_information.name}</p>
                  <p className="pf-hero-role">{user_login_information.role}</p>
                </div>
              </div>

              {/* ── My Account section ── */}
              <p className="pf-section-label">My Account</p>
              <div className="pf-card">
                <button className="pf-row" onClick={handleOrderListClick}>
                  <span className="pf-row-icon">
                    <IonIcon icon={cartOutline} />
                  </span>
                  <span className="pf-row-body">
                    <span className="pf-row-label">Order List</span>
                    <span className="pf-row-sub">View and track your orders</span>
                  </span>
                  <IonIcon className="pf-row-chevron" icon={chevronForwardOutline} />
                </button>

                <button className="pf-row" onClick={() => router.push("/DeliverOffline")}>
                  <span className="pf-row-icon">
                    <IonIcon icon={syncOutline} />
                  </span>
                  <span className="pf-row-body">
                    <span className="pf-row-label">Offline Deliveries Sync</span>
                    <span className="pf-row-sub">Sync pending offline deliveries</span>
                  </span>
                  <IonIcon className="pf-row-chevron" icon={chevronForwardOutline} />
                </button>
              </div>

              {/* ── Admin section ── */}
              {isAdmin && (
                <>
                  <p className="pf-section-label">Administration</p>
                  <div className="pf-card">
                    <button className="pf-row" onClick={() => router.push("/admin/mainmanageproduct")}>
                      <span className="pf-row-icon">
                        <IonIcon icon={bagOutline} />
                      </span>
                      <span className="pf-row-body">
                        <span className="pf-row-label">Manage Products</span>
                        <span className="pf-row-sub">Add, edit and remove inventory</span>
                      </span>
                      <IonIcon className="pf-row-chevron" icon={chevronForwardOutline} />
                    </button>

                    <button className="pf-row" onClick={() => router.push("/admin/sales")}>
                      <span className="pf-row-icon">
                        <IonIcon icon={barChartOutline} />
                      </span>
                      <span className="pf-row-body">
                        <span className="pf-row-label">Manage Sales</span>
                        <span className="pf-row-sub">View reports and sales data</span>
                      </span>
                      <IonIcon className="pf-row-chevron" icon={chevronForwardOutline} />
                    </button>

                    {isSuperAdmin && (
                      <button className="pf-row" onClick={() => router.push("/admin/add-new-user")}>
                        <span className="pf-row-icon">
                          <IonIcon icon={personAdd} />
                        </span>
                        <span className="pf-row-body">
                          <span className="pf-row-label">Manage Users</span>
                          <span className="pf-row-sub">Add, edit and manage staff accounts</span>
                        </span>
                        <IonIcon className="pf-row-chevron" icon={chevronForwardOutline} />
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* ── Logout ── */}
              <button className="pf-logout-btn" onClick={handleLogout}>
                <IonIcon icon={logOutOutline} />
                Log Out
              </button>
            </>
          ) : (
            <>
              {/* ── Not logged in ── */}
              <div className="pf-hero">
                <div className="pf-avatar">?</div>
                <div className="pf-hero-info">
                  <p className="pf-hero-name">Guest</p>
                  <p className="pf-hero-role">Not signed in</p>
                </div>
              </div>

              <div className="pf-login-card">
                <button className="pf-row" onClick={() => router.push("/login")}>
                  <span className="pf-row-icon">
                    <IonIcon icon={logInOutline} />
                  </span>
                  <span className="pf-row-body">
                    <span className="pf-row-label">Log In</span>
                    <span className="pf-row-sub">Sign in to your account</span>
                  </span>
                  <IonIcon className="pf-row-chevron" icon={chevronForwardOutline} />
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </IonContent>
  );
};

export default ProfileListButtons;
