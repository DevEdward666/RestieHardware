import { IonPage } from "@ionic/react";
import React, { useEffect } from "react";
import NotificationComponent from "../../components/Notification/NotificationComponent";
import { useTypedDispatch } from "../../Service/Store";
import { getReceivableList } from "../../Service/Actions/Inventory/InventoryActions";

const NotificationPage: React.FC = () => {
  const dispatch = useTypedDispatch();
  useEffect(() => {
    const initialize = () => {
      dispatch(getReceivableList());
    };
    initialize();
  }, [dispatch]);
  return (
    <IonPage>
      <NotificationComponent />
    </IonPage>
  );
};

export default NotificationPage;
