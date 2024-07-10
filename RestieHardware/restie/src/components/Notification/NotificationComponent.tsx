import {
  IonCard,
  IonCardContent,
  IonContent,
  IonIcon,
  IonPage,
} from "@ionic/react";
import React from "react";
import OnboardingComponent from "../../components/Onboarding/OnboardingComponent";
import { useSelector } from "react-redux";
import { RootStore } from "../../Service/Store";
import { formatDate } from "date-fns";
import { alertCircleSharp, filter } from "ionicons/icons";
import "./NotificationComponent.css";
const NotificationComponent: React.FC = () => {
  const receivable_list = useSelector(
    (store: RootStore) => store.InventoryReducer.receivable_list
  );
  console.log(receivable_list);
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
  return (
    <IonContent>
      <div>
        {Array.isArray(receivable_list) && receivable_list.length > 0 ? (
          receivable_list?.map((value) => (
            <IonCard
              className="notification-list-card-container"
              key={value.transid}
            >
              <div className="notification-list-card-add-item-container">
                <IonCardContent className="notification-list-card-main-content">
                  <div className="notification-list-card-icon">
                    <IonIcon
                      color="danger"
                      size="large"
                      icon={alertCircleSharp}
                    ></IonIcon>
                    <div className="notification-list-card-content">
                      <div className="notification-list-card-price-details">
                        <div className="notification-list-card-price">
                          Customer:{" "}
                        </div>
                        {value.customer}
                      </div>
                      <div className="notification-list-card-price-details">
                        <div className="notification-list-card-price">
                          Contact No.:{" "}
                        </div>
                        {value.contactno}
                      </div>
                      <div className="notification-list-card-price-details">
                        <div className="notification-list-card-price">
                          Customer Email:{" "}
                        </div>
                        {value.customer_email}
                      </div>
                      <div className="notification-list-card-title-details">
                        <div className="notification-list-card-title">
                          Order Date:{" "}
                        </div>
                        {formatDate(value.createdat)}
                      </div>
                      <div className="notification-list-card-price-details">
                        <div className="notification-list-card-price">
                          Total Debt:{" "}
                        </div>
                        <span>&#8369;</span>
                        {value.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </IonCardContent>
              </div>
            </IonCard>
          ))
        ) : (
          <p>No orders found.</p>
        )}
      </div>
    </IonContent>
  );
};

export default NotificationComponent;
