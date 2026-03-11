import {
  IonContent,
  IonIcon,
  useIonRouter,
} from "@ionic/react";
import React from "react";
import { useSelector } from "react-redux";
import { RootStore } from "../../Service/Store";
import { alertCircleSharp } from "ionicons/icons";
import "./NotificationComponent.css";
import { PostAgedReceivable } from "../../Models/Request/Inventory/InventoryModel";
const NotificationComponent: React.FC = () => {
  const receivable_list = useSelector(
    (store: RootStore) => store.InventoryReducer.receivable_list
  );
  const router = useIonRouter();
  const formatDate = (datetime: number) => {
    const timestamp = datetime;
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone: "Asia/Manila",
    });

    return formattedDate;
  };
  const handleReceivable = (value: PostAgedReceivable) => {
    router.push(
      `/orderInfo?orderid=${value.orderid}&return=false&notification=true`
    );
  };
  return (
    <IonContent className="notif-content">
      <div className="notif-scroll">
        <div className="notif-inner">
          {Array.isArray(receivable_list) && receivable_list.length > 0 ? (
            receivable_list.map((value, index) => (
              <div
                key={index}
                className="notif-card"
                onClick={() => handleReceivable(value)}
              >
                {/* Header: name + days badge */}
                <div className="notif-header">
                  <span className="notif-customer-name">{value.customer}</span>
                  <span className="notif-days-badge">
                    {value.total_days} day{value.total_days !== 1 ? "s" : ""} unpaid
                  </span>
                </div>

                {/* Debt amount */}
                <span className="notif-debt">
                  ₱{value.total.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>

                <div className="notif-divider" />

                <div className="notif-row">
                  <span className="notif-row-label">Contact No.</span>
                  <span className="notif-row-value">{value.contactno}</span>
                </div>
                <div className="notif-row">
                  <span className="notif-row-label">Email</span>
                  <span className="notif-row-value">{value.customer_email}</span>
                </div>
                <div className="notif-row">
                  <span className="notif-row-label">Order Date</span>
                  <span className="notif-row-value">{formatDate(value.createdat)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="notif-empty">
              <IonIcon className="notif-empty-icon" icon={alertCircleSharp} />
              <p className="notif-empty-text">No overdue receivables found.</p>
            </div>
          )}
        </div>
      </div>
    </IonContent>
  );
};

export default NotificationComponent;
