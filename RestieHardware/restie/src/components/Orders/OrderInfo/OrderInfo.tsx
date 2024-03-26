import {
  useIonRouter,
  IonCard,
  IonCardContent,
  IonItem,
  IonImg,
  IonButton,
} from "@ionic/react";
import { useSelector } from "react-redux";
import {
  Addtocart,
  PostSelectedOrder,
} from "../../../Models/Request/Inventory/InventoryModel";
import {
  addToCartAction,
  selectedOrder,
} from "../../../Service/Actions/Inventory/InventoryActions";
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
  const handleSelectOrder = (orderid: string, cartid: string) => {
    const payload: PostSelectedOrder = {
      orderid: orderid,
      userid: "",
    };
    dispatch(selectedOrder(payload));
    router.push("/home/cart");
  };
  const handleApprove = () => {
    let payload: Addtocart[] = []; // Initialize payload as an empty array
    order_list_info.map((val) => {
      const newItem: Addtocart = {
        orderid: val.orderid,
        cartid: val.cartid,
        onhandqty: val.onhandqty,
        code: val.code,
        item: val.item,
        qty: val.qty,
        price: val.price,
        createdAt: val.createdat,
        status: val.status,
      };
      payload.push(newItem);
    });

    dispatch(addToCartAction(payload));
    router.push("/paymentoptions");
  };
  const handleEdit = () => {
    let payload: Addtocart[] = []; // Initialize payload as an empty array
    order_list_info.map((val) => {
      const newItem: Addtocart = {
        onhandqty: val.onhandqty,
        orderid: val.orderid,
        cartid: val.cartid,
        code: val.code,
        item: val.item,
        qty: val.qty,
        price: val.price,
        createdAt: val.createdat,
        status: val.status,
      };
      payload.push(newItem);
    });

    dispatch(addToCartAction(payload));
    router.push("/home/cart");
  };

  console.log(order_list_info);
  return (
    <div className="order-list-info-main-container">
      <div className="order-list-info-footer-approved-details">
        <div className="order-list-info-footer-approved"> </div>

        <div className="order-list-info-footer-approved-info">
          {order_list_info[0]?.paidthru.toLowerCase() === "pending" ? (
            <>
              <IonButton
                size="small"
                color="tertiary"
                onClick={() => handleEdit()}
              >
                Edit Order
              </IonButton>
              <IonButton
                size="small"
                color="tertiary"
                onClick={() => handleApprove()}
              >
                Process Order
              </IonButton>
            </>
          ) : null}
        </div>
      </div>
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
              onClick={() => handleSelectOrder(orders.orderid, orders.cartid)}
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
      <IonImg className="breakline" src={breakline} />
      <div className="order-list-info-footer-total-main">
        <div className="order-list-info-footer-total-details">
          <div className="order-list-info-footer-total">Total: </div>

          <div className="order-list-info-footer-total-info">
            <span>&#8369;</span>
            {(order_list_info[0]?.total - getDiscount).toFixed(2)}
          </div>
        </div>
        {order_list_info[0]?.paidcash > 0 ? (
          <>
            <div className="order-list-info-footer-total-details">
              <div className="order-list-info-footer-total">Cash: </div>

              <div className="order-list-info-footer-total-info">
                <span>&#8369;</span>
                {(order_list_info[0]?.paidcash).toFixed(2)}
              </div>
            </div>
            <div className="order-list-info-footer-total-details">
              <div className="order-list-info-footer-total">Change: </div>

              <div className="order-list-info-footer-total-info">
                <span>&#8369;</span>
                {(
                  order_list_info[0]?.paidcash - order_list_info[0]?.total
                ).toFixed(2)}
              </div>
            </div>
          </>
        ) : null}
      </div>

      <IonButton
        className="order-info-close"
        expand="block"
        color="tertiary"
        onClick={() => router.push("/home/profile")}
      >
        Close
      </IonButton>
    </div>
  );
};

export default OrderInfoComponent;
