import {
  useIonRouter,
  IonCard,
  IonCardContent,
  IonSpinner,
} from "@ionic/react";
import { useSelector } from "react-redux";
import {
  OrderListFilter,
  PostSelectedOrder,
  PostdOrderList,
} from "../../../Models/Request/Inventory/InventoryModel";
import {
  getOrderInfo,
  getOrderList,
  selectedOrder,
} from "../../../Service/Actions/Inventory/InventoryActions";
import { RootStore, useTypedDispatch } from "../../../Service/Store";
import "./OrderListComponent.css";
import { useCallback, useEffect, useState } from "react";

const OrderListComponent: React.FC<OrderListFilter> = (filter) => {
  const order_list = useSelector(
    (store: RootStore) => store.InventoryReducer.order_list
  );
  const dispatch = useTypedDispatch();
  const router = useIonRouter();
  const [isLoading, setisLoading] = useState<boolean>(false);
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
  useEffect(() => {
    const initialize = async () => {
      setisLoading(true);
      const user_id = localStorage.getItem("user_id");
      const payload: PostdOrderList = {
        limit: 100,
        offset: 0,
        userid: user_id!,
        status: filter.filter.status.trim().toLowerCase(),
        searchdate: filter.filter.date,
        orderid: filter.filter.search,
      };
      const loaded = await dispatch(getOrderList(payload));
      if (loaded) {
        setisLoading(false);
      } else {
        setisLoading(false);
      }
    };
    initialize();
  }, [filter]);
  const handleSelectOrder = useCallback(
    (
      orderid: string,
      status: string,
      cartid: string,
      return_status: string
    ) => {
      const statusList = {
        pending: "pending",
        approved: "approved",
        cancelled: "cancelled",
      };
      const payload: PostSelectedOrder = {
        orderid: orderid,
        userid: "",
        cartid: cartid,
      };
      if (status.toLowerCase() === statusList.pending.toLowerCase()) {
        dispatch(getOrderInfo(payload));
        router.push(`/orderInfo?orderid=${payload.orderid}&return=false`);
      } else {
        dispatch(getOrderInfo(payload));
        if (return_status === "returns") {
          router.push(`/orderInfo?orderid=${payload.orderid}&return=true`);
        } else {
          router.push(`/orderInfo?orderid=${payload.orderid}&return=false`);
        }
      }
    },
    [dispatch]
  );
  return (
    <div>
      {isLoading ? (
        <IonSpinner className="loader" name="lines-sharp"></IonSpinner>
      ) : null}

      {Array.isArray(order_list) && order_list.length > 0 ? (
        order_list?.map((orders) => (
          <IonCard
            className="order-list-card-container"
            key={orders.orderid}
            onClick={() =>
              handleSelectOrder(
                orders.orderid,
                orders.status,
                orders.cartid,
                filter.filter.status
              )
            }
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
                    className={`order-list-card-qty ${
                      filter.filter.status.toLowerCase() === "returns"
                        ? "returns"
                        : orders?.status.trim().toLowerCase()
                    }`}
                  >
                    Status:{" "}
                    {filter.filter.status.toLowerCase() === "returns"
                      ? "Return/Refund".toUpperCase()
                      : orders?.status.toLowerCase() === "approved"
                      ? "Completed".toUpperCase()
                      : orders?.status.toUpperCase()}
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
