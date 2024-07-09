import { IonCard, IonCardContent, IonContent, IonPage } from "@ionic/react";
import React from "react";
import OnboardingComponent from "../../components/Onboarding/OnboardingComponent";
import { useSelector } from "react-redux";
import { RootStore } from "../../Service/Store";
import { formatDate } from "date-fns";
import { filter } from "ionicons/icons";

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
            <IonCard className="order-list-card-container" key={value.transid}>
              <div className="order-list-card-add-item-container">
                <IonCardContent className="order-list-card-main-content">
                  <div className="order-list-card-content">
                    <div className="order-list-card-title-details">
                      <div className="order-list-card-title">
                        Transaction Id:{" "}
                      </div>
                      {value.transid}
                    </div>
                    <div className="order-list-card-title-details">
                      <div className="order-list-card-title">Order Date: </div>
                      {formatDate(value.createdat)}
                    </div>
                    <div className="order-list-card-price-details">
                      <div className="order-list-card-price">Total Debt: </div>
                      <span>&#8369;</span>
                      {value.total.toFixed(2)}
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
