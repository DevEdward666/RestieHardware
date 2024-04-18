import {
  useIonRouter,
  IonCard,
  IonCardContent,
  IonItem,
  IonImg,
  IonButton,
  IonText,
  IonContent,
  IonLabel,
  IonList,
  IonModal,
  IonSearchbar,
  IonHeader,
  IonTitle,
  IonIcon,
  IonButtons,
  IonToolbar,
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
  getOrderInfo,
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
import { Clipboard } from "@capacitor/clipboard";
import { copy } from "ionicons/icons";
import { set_toast } from "../../../Service/Actions/Commons/CommonsActions";

const OrderInfoComponent = () => {
  const order_list_info = useSelector(
    (store: RootStore) => store.InventoryReducer.order_list_info
  );
  const get_voucher = useSelector(
    (store: RootStore) => store.InventoryReducer.get_voucher
  );
  const [getGetDeliveryInfo, setGetDeliveryInfo] = useState<GetDeliveryInfo>({
    deliveryid: "",
    deliveredby: "",
    deliverydate: 0,
    path: "",
  });
  const [openSearchModal, setOpenSearchModal] = useState({
    isOpen: false,
    modal: "",
  });

  const [getFile, setFile] = useState<FileResponse>();
  const [getDiscount, setDiscount] = useState<number>(0.0);
  const [getTotalAmount, setTotalAmount] = useState<number>(0.0);

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
  useEffect(() => {
    const initialize = () => {
      if (get_voucher && get_voucher.description?.length > 0) {
        const totalDiscount =
          order_list_info.order_info?.total -
          order_list_info.order_info?.total * get_voucher.discount;
        setDiscount(get_voucher.discount * 100);
        setTotalAmount(totalDiscount);
      } else {
        setTotalAmount(order_list_info.order_info?.total);
      }
    };
    initialize();
  }, [get_voucher, order_list_info]);
  const handleSelectOrder = (orderid: string, cartid: string) => {
    const payload: PostSelectedOrder = {
      orderid: orderid,
      userid: "",
    };
    dispatch(selectedOrder(payload));
    router.push("/home/cart");
  };
  const handleApprove = () => {
    let newItem: Addtocart;
    let payload: Addtocart[] = [];
    order_list_info.order_item.map((val) => {
      newItem = {
        onhandqty: val?.onhandqty!,
        code: val.code,
        item: val.item,
        qty: val.qty,
        price: val.price,
        image: "",
        orderid: order_list_info.order_info.orderid,
        cartid: order_list_info.order_info.cartid,
        createdAt: order_list_info.order_info.createdat,
        status: order_list_info.order_info.status,
      };
      payload.push(newItem);
    });

    dispatch(addToCartAction(payload));
    router.push("/paymentoptions");
  };
  const handleEdit = () => {
    // let payload: Addtocart[] = []; // Initialize payload as an empty array
    // order_list_info.map((val) => {
    //   const newItem: Addtocart = {
    //     onhandqty: val.onhandqty,
    //     orderid: val.orderid,
    //     cartid: val.cartid,
    //     code: val.code,
    //     item: val.item,
    //     qty: val.qty,
    //     price: val.price,
    //     createdAt: val.createdat,
    //     status: val.status,
    //   };
    //   payload.push(newItem);
    // });
    let newItem: Addtocart;
    let payload: Addtocart[] = [];
    order_list_info.order_item.map((val) => {
      newItem = {
        onhandqty: val?.onhandqty!,
        code: val.code,
        item: val.item,
        qty: val.qty,
        price: val.price,
        image: "",
        orderid: order_list_info.order_info.orderid,
        cartid: order_list_info.order_info.cartid,
        transid: order_list_info.order_info.transid,
        createdAt: order_list_info.order_info.createdat,
        status: order_list_info.order_info.status,
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
  const getOrderIDFromURL = () => {
    const url = new URL(window.location.href);
    return url.searchParams.get("orderid");
  };
  useEffect(() => {
    const initialize = async () => {
      const orderid = getOrderIDFromURL();
      await dispatch(getOrderInfo({ orderid: orderid! }));
    };
    initialize();
  }, [dispatch]);
  useEffect(() => {
    const initialize = async () => {
      const orderid = getOrderIDFromURL();
      await dispatch(GetLoginUser());
      const payload: PostDeliveryInfoModel = {
        orderid: order_list_info.order_info?.orderid
          ? order_list_info.order_info?.orderid
          : orderid!,
      };
      const orderdate = format(
        new Date(order_list_info.order_info?.createdat).toISOString(),
        "MMMM dd, yyyy hh:mm a"
      );
      setOrderDate(orderdate);
      if (order_list_info.order_info?.status !== "Delivered") {
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
      const orderCreationDate = new Date(order_list_info.order_info?.createdat);
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
  const copyOrderId = async (orderId: string) => {
    await Clipboard.write({
      string: orderId,
    });
  };
  const handleCopy = async (orderId: string) => {
    await copyOrderId(orderId);
    dispatch(
      set_toast({
        isOpen: true,
        message: "Copy Order ID",
        position: "middle",
        color: "#125B8C",
      })
    );
  };
  return (
    <div className="order-list-info-main-container">
      <div className="order-list-info-footer-approved-details">
        <div className="order-list-info-footer-approved"> </div>

        <div className="order-list-info-footer-approved-info">
          {order_list_info.order_info?.paidthru?.toLowerCase() === "pending" ? (
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

        {order_list_info.order_info?.status.toLowerCase() === "delivered" ? (
          <div className="order-list-info-footer-approved-info">
            <>
              <IonButton
                size="small"
                color="tertiary"
                onClick={() =>
                  setOpenSearchModal({ isOpen: true, modal: "receipt" })
                }
              >
                Print Invoice
              </IonButton>
              <IonButton
                size="small"
                color="tertiary"
                onClick={() => setOpenSearchModal({ isOpen: true, modal: "" })}
              >
                Open Delivery Info
              </IonButton>
            </>
          </div>
        ) : null}
        {order_list_info.order_info?.status === "approved" ? (
          <div className="order-list-info-footer-approved-info">
            <>
              <IonButton
                size="small"
                color="tertiary"
                onClick={() =>
                  setOpenSearchModal({ isOpen: true, modal: "receipt" })
                }
              >
                Print Invoice
              </IonButton>
              <IonButton
                size="small"
                color="tertiary"
                onClick={() =>
                  router.push(
                    `/deliveryInfo?orderid=${order_list_info.order_info.orderid}&transid=${order_list_info.order_info.transid}&cartid=${order_list_info.order_info.cartid}`
                  )
                }
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
          {order_list_info.order_info?.name}
        </div>
      </div>
      <div className="order-list-info-customer-details">
        <div className="order-list-info-customer">Address: </div>

        <div className="order-list-info-customer-info">
          {order_list_info.order_info?.address}
        </div>
      </div>
      <div className="order-list-info-customer-details">
        <div className="order-list-info-customer">Contact No: </div>

        <div className="order-list-info-customer-info">
          {order_list_info.order_info?.contactno}
        </div>
      </div>
      <div className="order-list-info-customer-details">
        <div className="order-list-info-customer">Order Type: </div>

        <div className="order-list-info-customer-info">
          {order_list_info.order_info?.type}
        </div>
      </div>
      <div className="order-list-info-customer-details">
        <div className="order-list-info-customer">Order Created: </div>

        <div className="order-list-info-customer-info">{getOrderDate}</div>
      </div>
      <div className="order-list-info-customer-details">
        <div className="order-list-info-customer">Cashier: </div>

        <div className="order-list-info-customer-info">
          {order_list_info.order_info.createdby}
        </div>
      </div>
      <div className="order-list-info-customer-details">
        <div className="order-list-info-customer">Order ID: </div>

        <div className="order-list-info-customer-info">
          {order_list_info.order_info?.orderid}
        </div>
        <IonButton
          color={"light"}
          onClick={() => handleCopy(order_list_info.order_info?.orderid)}
        >
          <IonIcon src={copy}></IonIcon>
        </IonButton>
      </div>
      <IonImg className="breakline" src={breakline} />
      <div className="order-list-info-container">
        {Array.isArray(order_list_info.order_item) &&
        order_list_info.order_item.length > 0 ? (
          order_list_info.order_item?.map((items, index) => (
            <IonItem
              className="order-list-info-card-container"
              key={index}
              onClick={() =>
                handleSelectOrder(
                  order_list_info.order_info.orderid,
                  order_list_info.order_info.cartid
                )
              }
            >
              <div className="order-list-info-card-add-item-container">
                <div className="order-list-info-card-main-content">
                  <div className="order-list-info-card-content">
                    <div className="order-list-info-card-title-details">
                      {items.item}
                    </div>

                    <div className="order-list-info-card-category-details">
                      <div className="order-list-info-card-category">
                        Brand: {items.brand} | Category:{items.category}
                      </div>
                    </div>
                    <div className="order-list-info-card-price-details">
                      <span>&#8369;</span>
                      {items.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="order-list-info-card-content">
                    <div className="order-list-info-card-qty">
                      {" "}
                      X{items.qty}
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
          {order_list_info.order_info?.paidthru.toLocaleUpperCase()}
        </div>
      </div>
      <div className="order-list-info-footer-details">
        <div className="order-list-info-footer">Sub-Total: </div>
        <div className="order-list-info-footer-info">
          {" "}
          <span>&#8369;</span>
          {order_list_info.order_info?.total.toFixed(2)}
        </div>
      </div>
      <div className="order-list-info-footer-details">
        <div className="order-list-info-footer">Discount & Vouchers: </div>

        <div className="order-list-info-footer-info">{`${
          getDiscount > 0 ? getDiscount + "%" : 0
        }`}</div>
      </div>
      <IonImg className="breakline" src={breakline} />
      <div className="order-list-info-footer-total-main">
        <div className="order-list-info-footer-total-details">
          <div className="order-list-info-footer-total">Total: </div>

          <div className="order-list-info-footer-total-info">
            <span>&#8369;</span>
            {getTotalAmount?.toFixed(2)}
          </div>
        </div>
        {order_list_info.order_info?.paidcash > 0 ? (
          <>
            <div className="order-list-info-footer-total-details">
              <div className="order-list-info-footer-total">Cash: </div>

              <div className="order-list-info-footer-total-info">
                <span>&#8369;</span>
                {(order_list_info.order_info?.paidcash).toFixed(2)}
              </div>
            </div>
            <div className="order-list-info-footer-total-details">
              <div className="order-list-info-footer-total">Change: </div>

              <div className="order-list-info-footer-total-info">
                <span>&#8369;</span>
                {(
                  order_list_info.order_info?.paidcash - getTotalAmount
                ).toFixed(2)}
              </div>
            </div>
          </>
        ) : null}
      </div>

      <IonButton
        className="order-info-close"
        expand="block"
        color="medium"
        onClick={() => handleClose()}
      >
        Close
      </IonButton>
      <IonModal
        isOpen={
          openSearchModal.modal !== "receipt" ? openSearchModal.isOpen : false
        }
        onDidDismiss={() => setOpenSearchModal({ isOpen: false, modal: "" })}
        initialBreakpoint={1}
        breakpoints={[0, 0.25, 0.5, 0.75, 1]}
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton
                onClick={() =>
                  setOpenSearchModal({ isOpen: false, modal: "receipt" })
                }
              >
                Close
              </IonButton>
            </IonButtons>
            <IonTitle className="delivery-info-title">
              {" "}
              Delivery Information
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <>
            {order_list_info.order_info?.status.toLowerCase() ===
            "Delivered".toLowerCase() ? (
              <div className="delivery-image-container">
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
                {getFile &&
                  getFile.contentType &&
                  getFile.contentType.startsWith("image/") && (
                    <>
                      <IonText className="delivery-image-text">
                        Delivery Image
                      </IonText>
                      <IonImg
                        className="swiper-component"
                        src={"data:image/png;base64," + getFile.fileContents}
                      ></IonImg>
                    </>
                  )}
              </div>
            ) : null}
          </>
        </IonContent>
      </IonModal>
      <IonModal
        isOpen={
          openSearchModal.modal === "receipt" ? openSearchModal.isOpen : false
        }
        onDidDismiss={() => setOpenSearchModal({ isOpen: false, modal: "" })}
        initialBreakpoint={1}
        breakpoints={[0, 0.25, 0.5, 0.75, 1]}
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton
                onClick={() =>
                  setOpenSearchModal({ isOpen: false, modal: "receipt" })
                }
              >
                Close
              </IonButton>
            </IonButtons>
            <IonTitle className="delivery-info-title"> Invoice</IonTitle>
            <IonButtons slot="end">
              <IonButton
                onClick={() =>
                  setOpenSearchModal({ isOpen: false, modal: "receipt" })
                }
              >
                Print
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <>
            <div className="order-list-info-customer-details">
              <div className="order-list-info-customer">Customer Name: </div>

              <div className="order-list-info-customer-info">
                {order_list_info.order_info?.name}
              </div>
            </div>
            <div className="order-list-info-customer-details">
              <div className="order-list-info-customer">Address: </div>

              <div className="order-list-info-customer-info">
                {order_list_info.order_info?.address}
              </div>
            </div>
            <div className="order-list-info-customer-details">
              <div className="order-list-info-customer">Contact No: </div>

              <div className="order-list-info-customer-info">
                {order_list_info.order_info?.contactno}
              </div>
            </div>
            <div className="order-list-info-customer-details">
              <div className="order-list-info-customer">Order Type: </div>

              <div className="order-list-info-customer-info">
                {order_list_info.order_info?.type}
              </div>
            </div>
            <div className="order-list-info-customer-details">
              <div className="order-list-info-customer">Order Created: </div>

              <div className="order-list-info-customer-info">
                {getOrderDate}
              </div>
            </div>
            <div className="order-list-info-customer-details">
              <div className="order-list-info-customer">Cashier: </div>

              <div className="order-list-info-customer-info">
                {order_list_info.order_info.createdby}
              </div>
            </div>
            <IonImg className="breakline" src={breakline} />
            <div className="order-list-info-container">
              {Array.isArray(order_list_info.order_item) &&
              order_list_info.order_item.length > 0 ? (
                order_list_info?.order_item?.map((items, index) => (
                  <IonItem
                    className="order-list-info-card-container"
                    key={index}
                    onClick={() =>
                      handleSelectOrder(
                        order_list_info.order_info.orderid,
                        order_list_info.order_info.cartid
                      )
                    }
                  >
                    <div className="order-list-info-card-add-item-container">
                      <div className="order-list-info-card-main-content">
                        <div className="order-list-info-card-content">
                          <div className="order-list-info-card-title-details">
                            {items.item}
                          </div>

                          <div className="order-list-info-card-category-details">
                            <div className="order-list-info-card-category">
                              Brand: {items.brand} | Category:{items.category}
                            </div>
                          </div>
                          <div className="order-list-info-card-price-details">
                            <span>&#8369;</span>
                            {items.price.toFixed(2)}
                          </div>
                        </div>
                        <div className="order-list-info-card-content">
                          <div className="order-list-info-card-qty">
                            {" "}
                            X{items.qty}
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
                {order_list_info.order_info.paidthru.toLocaleUpperCase()}
              </div>
            </div>
            <div className="order-list-info-footer-details">
              <div className="order-list-info-footer">Sub-Total: </div>
              <div className="order-list-info-footer-info">
                {" "}
                <span>&#8369;</span>
                {order_list_info.order_info.total.toFixed(2)}
              </div>
            </div>
            <div className="order-list-info-footer-details">
              <div className="order-list-info-footer">
                Discount & Vouchers:{" "}
              </div>

              <div className="order-list-info-footer-info">{`${
                getDiscount > 0 ? getDiscount + "%" : 0
              }`}</div>
            </div>
            <IonImg className="breakline" src={breakline} />
            <div className="order-list-info-footer-total-main">
              <div className="order-list-info-footer-total-details">
                <div className="order-list-info-footer-total">Total: </div>

                <div className="order-list-info-footer-total-info">
                  <span>&#8369;</span>
                  {getTotalAmount.toFixed(2)}
                </div>
              </div>
              {order_list_info.order_info?.paidcash > 0 ? (
                <>
                  <div className="order-list-info-footer-total-details">
                    <div className="order-list-info-footer-total">Cash: </div>

                    <div className="order-list-info-footer-total-info">
                      <span>&#8369;</span>
                      {order_list_info.order_info.paidcash.toFixed(2)}
                    </div>
                  </div>
                  <div className="order-list-info-footer-total-details">
                    <div className="order-list-info-footer-total">Change: </div>

                    <div className="order-list-info-footer-total-info">
                      <span>&#8369;</span>
                      {(
                        order_list_info.order_info.paidcash - getTotalAmount
                      ).toFixed(2)}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </>
        </IonContent>
      </IonModal>
    </div>
  );
};

export default OrderInfoComponent;
