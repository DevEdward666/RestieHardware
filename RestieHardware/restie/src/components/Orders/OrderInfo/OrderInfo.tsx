import {
  useIonRouter,
  IonCard,
  IonCardContent,
  IonItem,
  IonImg,
  IonButton,
  IonText,
} from "@ionic/react";
import { useSelector } from "react-redux";
import {
  Addtocart,
  GetDeliveryImagePath,
  PostDeliveryInfoModel,
  PostSelectedOrder,
} from "../../../Models/Request/Inventory/InventoryModel";
import {
  addToCartAction,
  getDelivery,
  getInventory,
  selectedOrder,
} from "../../../Service/Actions/Inventory/InventoryActions";
import { RootStore, useTypedDispatch } from "../../../Service/Store";
import "./OrderInfo.css";
import { useCallback, useEffect, useState } from "react";
import breakline from "../../../assets/images/breakline.png";
import { GetDeliveryImage } from "../../../Service/API/Inventory/InventoryApi";
import {
  FileResponse,
  GetDeliveryInfo,
} from "../../../Models/Response/Inventory/GetInventoryModel";
import { format } from "date-fns";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/keyboard";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/zoom";
import "@ionic/react/css/ionic-swiper.css";
import { GetLoginUser } from "../../../Service/Actions/Login/LoginActions";
const OrderInfoComponent = () => {
  const order_list_info = useSelector(
    (store: RootStore) => store.InventoryReducer.order_list_info
  );
  const get_delivery_info = useSelector(
    (store: RootStore) => store.InventoryReducer.get_delivery_info
  );

  const user_login_information = useSelector(
    (store: RootStore) => store.LoginReducer.user_login_information
  );
  const [getGetDeliveryInfo, setGetDeliveryInfo] = useState<GetDeliveryInfo>({
    deliveryid: "",
    deliveredby: "",
    deliverydate: 0,
    path: "",
  });

  const [getFile, setFile] = useState<FileResponse>();
  const [getDiscount, setDiscount] = useState<number>(0.0);
  const [elapsedTime, setElapsedTime] = useState({
    hour: 0,
    minute: 0,
  });
  const [getOrderDate, setOrderDate] = useState("");
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

  const handleClose = useCallback(() => {
    dispatch(
      getInventory({
        page: 1,
        offset: 0,
        limit: 10,
        searchTerm: "",
      })
    );
    router.push("/home/profile");
  }, [dispatch]);
  useEffect(() => {
    const initialize = async () => {
      const res = await dispatch(GetLoginUser());
      const payload: PostDeliveryInfoModel = {
        orderid: order_list_info[0]?.orderid,
      };
      const orderdate = format(
        new Date(order_list_info[0]?.createdat).toISOString(),
        "MMMM dd, yyyy hh:mm a"
      );
      setOrderDate(orderdate);
      if (order_list_info[0]?.status !== "Delivered") {
        return;
      }
      const imagePath = await dispatch(getDelivery(payload));
      setGetDeliveryInfo({
        deliveredby: imagePath.result.deliveredby,
        deliverydate: imagePath.result.deliverydate,
        path: imagePath.result.path,
        deliveryid: imagePath.result.deliveryid,
      });

      if (imagePath?.statusCode === 200) {
        const imageDeliveryPayload: GetDeliveryImagePath = {
          imagePath: imagePath.result.path,
        };
        const imageFile = await GetDeliveryImage(imageDeliveryPayload);
        setFile(imageFile.result.image);
      }

      const deliveryDate = new Date(imagePath.result.deliverydate);
      const orderCreationDate = new Date(order_list_info[0]?.createdat);
      const timeDifference =
        deliveryDate.getTime() - orderCreationDate.getTime();

      // Convert milliseconds to hours and minutes
      const hours = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutes = Math.floor(
        (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
      );
      setElapsedTime({
        hour: hours,
        minute: minutes,
      });
    };
    initialize();
  }, [dispatch, order_list_info]);
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
        {order_list_info[0]?.status === "approved" ? (
          <div className="order-list-info-footer-approved-info">
            <>
              <IonButton
                size="small"
                color="tertiary"
                onClick={() => router.push("/deliveryInfo")}
              >
                Process Item Delivered
              </IonButton>
            </>
          </div>
        ) : null}
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
      <div className="order-list-info-customer-details">
        <div className="order-list-info-customer">Order Created: </div>

        <div className="order-list-info-customer-info">{getOrderDate}</div>
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
      {order_list_info[0]?.status.toLowerCase() ===
      "Delivered".toLowerCase() ? (
        <div className="delivery-image-container">
          {getFile &&
            getFile.contentType &&
            getFile.contentType.startsWith("image/") && (
              <>
                <IonText className="delivery-image-text">
                  Delivery Image
                </IonText>
                <Swiper
                  className="swiper-component"
                  autoplay={true}
                  keyboard={true}
                  pagination={true}
                  scrollbar={false}
                  zoom={true}
                >
                  <SwiperSlide>
                    <IonImg
                      src={"data:image/png;base64," + getFile.fileContents}
                    ></IonImg>
                  </SwiperSlide>
                </Swiper>
                <div className="delivered-info-container">
                  <IonText className="delivered-info-text">
                    Delivered by:{"  "}
                    {getGetDeliveryInfo.deliveredby}
                  </IonText>
                  <IonText className="delivered-info-text">
                    Delivered at:{"  "}
                    {format(
                      new Date(getGetDeliveryInfo.deliverydate).toISOString(),
                      "MMMM dd, yyyy hh:mm a"
                    )}
                  </IonText>

                  <IonText className="delivered-info-text">
                    Time Elapsed: {elapsedTime.hour} hours {elapsedTime.minute}{" "}
                    minutes
                  </IonText>
                </div>
              </>
            )}
        </div>
      ) : null}
      <IonButton
        className="order-info-close"
        expand="block"
        color="medium"
        onClick={() => handleClose()}
      >
        Close
      </IonButton>
    </div>
  );
};

export default OrderInfoComponent;
