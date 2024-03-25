import { useIonRouter, IonCard, IonCardContent } from "@ionic/react";
import { useSelector } from "react-redux";
import { PostSelectedOrder } from "../../../Models/Request/Inventory/InventoryModel";
import {
  getOrderInfo,
  selectedOrder,
} from "../../../Service/Actions/Inventory/InventoryActions";
import { RootStore, useTypedDispatch } from "../../../Service/Store";
import "./OrderListComponent.css";
const OrderListComponent = () => {
  const order_list = useSelector(
    (store: RootStore) => store.InventoryReducer.order_list
  );
  const dispatch = useTypedDispatch();
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
  const handleSelectOrder = (orderid: string, status: string) => {
    const statusList = {
      pending: "pending",
      approved: "approved",
      cancelled: "cancelled",
    };
    const payload: PostSelectedOrder = {
      orderid: orderid,
      userid: "",
    };
    if (status.toLowerCase() === statusList.pending.toLowerCase()) {
      dispatch(getOrderInfo(payload));
      router.push("/orderInfo");
    } else {
      dispatch(selectedOrder(payload));
      router.push("/orderInfo");
    }
  };
  return (
    <div>
      {Array.isArray(order_list) && order_list.length > 0 ? (
        order_list?.map((orders) => (
          <IonCard
            className="order-list-card-container"
            key={orders.orderid}
            onClick={() => handleSelectOrder(orders.orderid, orders.status)}
          >
            <div className="order-list-card-add-item-container">
              <IonCardContent className="order-list-card-main-content">
                <div className="order-list-card-content">
                  <div className="order-list-card-title-details">
                    <div className="order-list-card-title">Order Id: </div>
                    {orders.orderid}
                  </div>
                  <div className="order-list-card-title-details">
                    <div className="order-list-card-title">Order Date: </div>
                    {formatDate(orders.createdat)}
                  </div>
                  <div className="order-list-card-price-details">
                    <div className="order-list-card-price">Total Cost: </div>
                    <span>&#8369;</span>
                    {orders.total.toFixed(2)}
                  </div>
                  <div className="order-list-card-price-details">
                    <div className="order-list-card-price">Total Pay: </div>
                    <span>&#8369;</span>
                    {orders.paidcash.toFixed(2)}
                  </div>
                  <div
                    className={`order-list-card-qty ${orders?.status
                      .trim()
                      .toLowerCase()}`}
                  >
                    Status: {orders?.status.toUpperCase()}
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
  );
};

export default OrderListComponent;
