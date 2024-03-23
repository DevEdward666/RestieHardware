import { IonContent } from "@ionic/react";
import React from "react";
import OrderListComponent from "../../../components/Profile/OrderListComponent";

const OrderListPage = () => {
  return (
    <IonContent>
      <div>
        <OrderListComponent />
      </div>
    </IonContent>
  );
};

export default OrderListPage;
