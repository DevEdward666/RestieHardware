import {
  useIonRouter,
  IonCard,
  IonCardContent,
  IonItem,
  IonImg,
  IonButton,
} from "@ionic/react";
import { useSelector } from "react-redux";
import { PostSelectedOrder } from "../../../Models/Request/Inventory/InventoryModel";
import { selectedOrder } from "../../../Service/Actions/Inventory/InventoryActions";
import { RootStore, useTypedDispatch } from "../../../Service/Store";
import "./OrderInfo.css";
import { useState } from "react";
import breakline from "../../../assets/images/breakline.png";
const OrderInfoComponent = () => {
  const order_list_info = useSelector(
    (store: RootStore) => store.InventoryReducer.order_list_info
  );
  const [getDiscount, setDiscount] = useState<number>(0.0);
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
  const handleSelectOrder = (orderid: string) => {
    const payload: PostSelectedOrder = {
      orderid: orderid,
      userid: "4105df30-717a-4170-af97-5dd8dacd03a2",
    };
    dispatch(selectedOrder(payload));
    router.push("/home/cart");
  };
  const handleApprove = () => {
    alert("This will show if the payment method is pending");
  };
  return (
    <div className="order-list-info-main-container">
      <div className="order-list-info-customer-details">
        <div className="order-list-info-customer">Customer Name: </div>

        <div className="order-list-info-customer-info">
          {order_list_info[0]?.name}
        </div>
      </div>
      <div className="order-list-info-customer-details">
        <div className="order-list-info-customer">Address: </div>

        <div className="order-list-info-customer-info">
          {order_list_info[0]?.address}
        </div>
      </div>
      <div className="order-list-info-customer-details">
        <div className="order-list-info-customer">Contact No: </div>

        <div className="order-list-info-customer-info">
          {order_list_info[0]?.contactno}
        </div>
      </div>
      <div className="order-list-info-customer-details">
        <div className="order-list-info-customer">Order Type: </div>

        <div className="order-list-info-customer-info">
          {order_list_info[0]?.type}
        </div>
      </div>
      <IonImg className="breakline" src={breakline} />
      <div className="order-list-info-container">
        {Array.isArray(order_list_info) && order_list_info.length > 0 ? (
          order_list_info?.map((orders, index) => (
            <IonItem
              className="order-list-info-card-container"
              key={index}
              onClick={() => handleSelectOrder(orders.orderid)}
            >
              <div className="order-list-info-card-add-item-container">
                <div className="order-list-info-card-main-content">
                  <div className="order-list-info-card-content">
                    <div className="order-list-info-card-title-details">
                      {orders.item}
                    </div>

                    <div className="order-list-info-card-category-details">
                      <div className="order-list-info-card-category">
                        Brand:Omni | Category:Electrical
                      </div>
                    </div>
                    <div className="order-list-info-card-price-details">
                      <span>&#8369;</span>
                      {orders.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="order-list-info-card-content">
                    <div className="order-list-info-card-qty">
                      {" "}
                      X{orders.qty}
                    </div>
                  </div>
                </div>
              </div>
            </IonItem>
          ))
        ) : (
          <p>No order info found.</p>
        )}
      </div>
      <div className="order-list-info-footer-details">
        <div className="order-list-info-footer">Payment Method: </div>
        <div className="order-list-info-footer-info">
          {" "}
          {order_list_info[0]?.paidthru.toLocaleUpperCase()}
        </div>
      </div>
      <div className="order-list-info-footer-details">
        <div className="order-list-info-footer">Sub-Total: </div>
        <div className="order-list-info-footer-info">
          {" "}
          <span>&#8369;</span>
          {order_list_info[0]?.total.toFixed(2)}
        </div>
      </div>
      <div className="order-list-info-footer-details">
        <div className="order-list-info-footer">Discount & Vouchers: </div>

        <div className="order-list-info-footer-info">
          {" "}
          <span>&#8369;</span>
          {getDiscount}
        </div>
      </div>

      <div className="order-list-info-footer-total-details">
        <div className="order-list-info-footer-total">Total: </div>

        <div className="order-list-info-footer-total-info">
          <span>&#8369;</span>
          {(order_list_info[0]?.total - getDiscount).toFixed(2)}
        </div>
      </div>
      <div className="order-list-info-footer-total-details">
        <div className="order-list-info-footer-total"> </div>

        <div className="order-list-info-footer-total-info">
          {order_list_info[0]?.paidthru.toLowerCase() === "pending" ? (
            <IonButton color="tertiary" onClick={() => handleApprove()}>
              Approve Order
            </IonButton>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default OrderInfoComponent;
