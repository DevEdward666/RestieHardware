import {
  useIonRouter,
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
        paidThru:
          filter.filter.status.trim().toLowerCase() === "debt" ? "debt" : "",
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
        router.push(
          `/orderInfo?orderid=${payload.orderid}&return=false&notification=false`
        );
      } else {
        dispatch(getOrderInfo(payload));
        if (return_status === "returns") {
          router.push(
            `/orderInfo?orderid=${payload.orderid}&return=true&notification=false`
          );
        } else {
          router.push(
            `/orderInfo?orderid=${payload.orderid}&return=false&notification=false`
          );
        }
      }
    },
    [dispatch]
  );
  const getStatusKey = (orders: any): string => {
    if (filter.filter.status.toLowerCase() === "returns") return "returns";
    if (orders?.paidthru?.toLowerCase() === "debt") return "debt";
    return orders?.status?.trim().toLowerCase() ?? "";
  };

  const getStatusLabel = (orders: any): string => {
    if (filter.filter.status.toLowerCase() === "returns") return "Return/Refund";
    if (orders?.status?.toLowerCase() === "approved") {
      return orders?.paidthru?.toLowerCase() === "debt" ? "Receivable" : "Completed";
    }
    return orders?.status ?? "";
  };

  const badgeClass = (key: string) => {
    switch (key) {
      case "pending": return "badge-pending";
      case "approved":
      case "completed": return "badge-completed";
      case "cancelled": return "badge-cancelled";
      case "returns": return "badge-returns";
      case "debt": return "badge-debt";
      case "quotation": return "badge-quotation";
      default: return "badge-pending";
    }
  };

  return (
    <div className="ol-wrapper">
      {isLoading ? (
        <div className="ol-loader">
          <IonSpinner name="lines-sharp" />
        </div>
      ) : (
        <div className="ol-inner">
          {Array.isArray(order_list) && order_list.length > 0 ? (
            order_list.map((orders, index) => {
              const statusKey = getStatusKey(orders);
              const statusLabel = getStatusLabel(orders);
              return (
                <div
                  key={index}
                  className={`ol-card status-${statusKey}`}
                  onClick={() =>
                    handleSelectOrder(
                      orders.orderid,
                      orders.status,
                      orders.cartid,
                      filter.filter.status
                    )
                  }
                >
                  <div className="ol-card-body">
                    <div className="ol-card-top">
                      <span className="ol-order-id">#{orders.orderid}</span>
                      <span className={`ol-status-badge ${badgeClass(statusKey)}`}>
                        {statusLabel.toUpperCase()}
                      </span>
                    </div>
                    <p className="ol-date">{formatDate(orders.createdat)}</p>
                    <div className="ol-amounts">
                      <div className="ol-amount-block">
                        <p className="ol-amount-label">Total</p>
                        <p className="ol-amount-value">
                          &#8369;{(orders.total - (orders.totaldiscount ?? 0)).toFixed(2)}
                        </p>
                      </div>
                      <div className="ol-amount-block">
                        <p className="ol-amount-label">Discount</p>
                        <p className="ol-amount-value discount">
                          &#8369;{(orders.totaldiscount ?? 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="ol-amount-block">
                        <p className="ol-amount-label">Paid</p>
                        <p className="ol-amount-value">
                          &#8369;{orders.paidcash.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="ol-empty">No orders found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderListComponent;
