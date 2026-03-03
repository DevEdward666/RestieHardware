import {
  IonContent,
  IonIcon,
  useIonRouter,
} from "@ionic/react";
import "./MainProductComponent.css";
import {
  addCircleOutline,
  bagOutline,
  barcodeOutline,
  chevronForwardOutline,
  cloudUploadOutline,
  createOutline,
  receiptOutline,
  storefrontOutline,
} from "ionicons/icons";
import { useSelector } from "react-redux";
import { RootStore } from "../../../../Service/Store";
const MainProductComponent: React.FC = () => {
  const router = useIonRouter();
  const user_login_information = useSelector(
    (store: RootStore) => store.LoginReducer.user_login_information
  );

  const isAdmin =
    user_login_information?.role?.trim().toLowerCase() === "admin" ||
    user_login_information?.role?.trim().toLowerCase() === "super admin";
  const isSuperAdmin =
    user_login_information?.role?.trim().toLowerCase() === "super admin";

  if (!isAdmin) return null;

  return (
    <IonContent className="main-product-content">
      <div className="mpc-scroll">
        <div className="mpc-inner">

          <p className="mpc-section-label">Products</p>
          <div className="mpc-card">
            <button className="mpc-row" onClick={() => router.push("/admin/addNewItem")}>
              <span className="mpc-row-icon"><IonIcon icon={addCircleOutline} /></span>
              <span className="mpc-row-body">
                <span className="mpc-row-label">Add New Product</span>
                <span className="mpc-row-sub">Create a new inventory item</span>
              </span>
              <IonIcon className="mpc-row-chevron" icon={chevronForwardOutline} />
            </button>

            <button className="mpc-row" onClick={() => router.push("/admin/manageproduct")}>
              <span className="mpc-row-icon"><IonIcon icon={createOutline} /></span>
              <span className="mpc-row-body">
                <span className="mpc-row-label">Update Product</span>
                <span className="mpc-row-sub">Edit existing product details</span>
              </span>
              <IonIcon className="mpc-row-chevron" icon={chevronForwardOutline} />
            </button>

            <button className="mpc-row" onClick={() => router.push("/admin/bulk-update-inventory")}>
              <span className="mpc-row-icon"><IonIcon icon={cloudUploadOutline} /></span>
              <span className="mpc-row-body">
                <span className="mpc-row-label">Bulk Update Inventory</span>
                <span className="mpc-row-sub">Import items from Excel (.xlsx)</span>
              </span>
              <IonIcon className="mpc-row-chevron" icon={chevronForwardOutline} />
            </button>

            <button className="mpc-row" onClick={() => router.push("/admin/import-pos-log")}>
              <span className="mpc-row-icon"><IonIcon icon={receiptOutline} /></span>
              <span className="mpc-row-body">
                <span className="mpc-row-label">Import POS Log</span>
                <span className="mpc-row-sub">Sync sales from external POS system</span>
              </span>
              <IonIcon className="mpc-row-chevron" icon={chevronForwardOutline} />
            </button>
          </div>

          <p className="mpc-section-label">Suppliers</p>
          <div className="mpc-card">
            <button className="mpc-row" onClick={() => router.push("/admin/addnewsupplier")}>
              <span className="mpc-row-icon"><IonIcon icon={storefrontOutline} /></span>
              <span className="mpc-row-body">
                <span className="mpc-row-label">Add / Update Supplier</span>
                <span className="mpc-row-sub">Manage supplier information</span>
              </span>
              <IonIcon className="mpc-row-chevron" icon={chevronForwardOutline} />
            </button>
          </div>

          {isSuperAdmin && (
            <>
              <p className="mpc-section-label">Vouchers</p>
              <div className="mpc-card">
                <button className="mpc-row" onClick={() => router.push("/admin/add-update-voucher")}>
                  <span className="mpc-row-icon"><IonIcon icon={barcodeOutline} /></span>
                  <span className="mpc-row-body">
                    <span className="mpc-row-label">Add / Update Voucher</span>
                    <span className="mpc-row-sub">Manage discount voucher codes</span>
                  </span>
                  <IonIcon className="mpc-row-chevron" icon={chevronForwardOutline} />
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </IonContent>
  );
};

export default MainProductComponent;
