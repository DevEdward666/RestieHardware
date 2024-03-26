import {
  useIonRouter,
  IonCard,
  IonCardContent,
  IonItem,
  IonImg,
  IonIcon,
  IonLabel,
  IonNote,
  IonAccordion,
  IonAccordionGroup,
  IonInput,
  IonText,
  IonButton,
  IonToast,
  InputChangeEventDetail,
} from "@ionic/react";
import { useSelector } from "react-redux";
import { PostSelectedOrder } from "../../../Models/Request/Inventory/InventoryModel";
import {
  PostOrder,
  getOrderInfo,
  selectedOrder,
} from "../../../Service/Actions/Inventory/InventoryActions";
import { RootStore, useTypedDispatch } from "../../../Service/Store";
import "./PaymentOptionsComponent.css";
import { useCallback, useEffect, useState } from "react";
import breakline from "../../../assets/images/breakline.png";
import { listCircle } from "ionicons/icons";
import card from "../../../assets/images/icons/card.png";
import ewallets from "../../../assets/images/icons/E-Wallets.png";
import cash from "../../../assets/images/icons/Cash.png";
import draft from "../../../assets/images/icons/draft.png";
import {
  GetCustomerInformation,
  GetPaymentInfo,
  PostCustomer,
} from "../../../Models/Response/Customer/GetCustomerModel";
import { GetOneCustomer } from "../../../Service/Actions/Customer/CustomerActions";
import { ResponseModel } from "../../../Models/Response/Commons/Commons";
const PaymentOptionsComponent = () => {
  const add_to_cart = useSelector(
    (store: RootStore) => store.InventoryReducer.add_to_cart
  );
  const order_list = useSelector(
    (store: RootStore) => store.InventoryReducer.order_list
  );
  const customer_information = useSelector(
    (store: RootStore) => store.CustomerReducer.customer_information
  );
  const [getTotal, setTotal] = useState<number>(0.0);
  const dispatch = useTypedDispatch();
  const router = useIonRouter();
  const [isOpenToast, setIsOpenToast] = useState({
    toastMessage: "",
    isOpen: false,
  });
  const [customerPayemntInfo, setCustomerPaymentInfo] =
    useState<GetPaymentInfo>({
      cash: 0,
      voucher: "",
    });
  console.log(add_to_cart);
  const handlePay = useCallback(
    async (type: string) => {
      if (
        customerPayemntInfo.cash < getTotal &&
        type.toLowerCase() === "cash"
      ) {
        setIsOpenToast({
          toastMessage: "Not enough cash",
          isOpen: true,
        });
      } else {
        const addedOrder: ResponseModel = await dispatch(
          PostOrder(
            add_to_cart,
            customer_information,
            new Date().getTime(),
            type,
            type.toLowerCase() === "cash" ? customerPayemntInfo.cash : 0.0
          )
        );
        if (addedOrder) {
          const payload: PostSelectedOrder = {
            orderid: addedOrder.result?.orderid!,
            userid: "",
            cartid: addedOrder.result?.cartid!,
          };
          dispatch(getOrderInfo(payload));
          router.push("/orderInfo");
        }
      }
    },
    [dispatch, add_to_cart, customer_information, customerPayemntInfo, getTotal]
  );
  useEffect(() => {
    let totalAmount = 0;
    add_to_cart.forEach((val: any) => {
      totalAmount += val.qty * val.price;
    });
    setTotal(totalAmount);
  }, [add_to_cart]);
  const handleInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCustomerPaymentInfo((prevState) => ({
      ...prevState,
      [name]: name === "cash" ? parseInt(value, 10) : value,
    }));

    console.log(e.target.value);
  };
  return (
    <div className="payment-info-main-container">
      <div className="payment-info-container">
        <div
          className="payment-info-card-container"
          //   onClick={() => handleSelectOrder(orders.orderid)}
        >
          <div className="payment-info-card-add-item-container">
            <div className="payment-info-card-main-content">
              <IonAccordionGroup>
                <IonAccordion value="first">
                  <IonItem slot="header" color="light">
                    <div className="payment-info-card-content">
                      <div className="payment-info-card-title-details">
                        <IonImg
                          color="danger"
                          slot="start"
                          className="payment-info-icon-img"
                          src={cash}
                        ></IonImg>
                        <IonLabel>Cash</IonLabel>
                      </div>
                    </div>
                  </IonItem>
                  <div className="payment-info-cash" slot="content">
                    <IonItem className="payment-info-item">
                      <IonInput
                        name="cash"
                        onIonInput={(e: any) => handleInfoChange(e)}
                        className="payment-info-input"
                        label="Cash"
                        type="number"
                        labelPlacement="floating"
                        placeholder="Enter Cash"
                      ></IonInput>
                    </IonItem>
                    <IonItem className="payment-info-item">
                      <IonInput
                        disabled
                        name="voucher"
                        onIonInput={(e: any) => handleInfoChange(e)}
                        className="payment-info-input"
                        label="Voucher"
                        labelPlacement="floating"
                        placeholder="Enter Voucher"
                      ></IonInput>
                    </IonItem>
                    <IonButton color="medium" onClick={() => handlePay("Cash")}>
                      Pay now
                    </IonButton>
                  </div>
                </IonAccordion>
                <IonAccordion value="second" disabled>
                  <IonItem slot="header" color="light">
                    <div className="payment-info-card-content">
                      <div className="payment-info-card-title-details">
                        <IonImg
                          color="danger"
                          slot="start"
                          className="payment-info-icon-img"
                          src={ewallets}
                        ></IonImg>
                        <IonLabel>E-Wallet</IonLabel>
                      </div>
                    </div>
                  </IonItem>
                  <div className="payment-info-cash" slot="content">
                    <IonItem className="payment-info-item"></IonItem>
                    <IonItem className="payment-info-item"></IonItem>
                  </div>
                </IonAccordion>
                <IonAccordion value="third" disabled>
                  <IonItem slot="header" color="light">
                    <div className="payment-info-card-content">
                      <div className="payment-info-card-title-details">
                        <IonImg
                          color="danger"
                          slot="start"
                          className="payment-info-icon-img"
                          src={card}
                        ></IonImg>
                        <IonLabel>Card</IonLabel>
                      </div>
                    </div>
                  </IonItem>
                  <div className="payment-info-cash" slot="content">
                    <IonItem className="payment-info-item"></IonItem>
                    <IonItem className="payment-info-item"></IonItem>
                  </div>
                </IonAccordion>
              </IonAccordionGroup>
              {/* <IonCard
                className="payment-info-card-content"
                onClick={() => handlePay("Cash")}
              >
                <div className="payment-info-card-title-details">
                  <IonImg
                    color="danger"
                    slot="start"
                    className="payment-info-icon-img"
                    src={cash}
                  ></IonImg>
                  <IonLabel>Cash</IonLabel>
                </div>
              </IonCard>
              <IonCard className="payment-info-card-content" disabled>
                <div className="payment-info-card-title-details">
                  <IonImg
                    color="danger"
                    slot="start"
                    className="payment-info-icon-img"
                    src={ewallets}
                  ></IonImg>
                  <IonLabel>E-Wallets</IonLabel>
                </div>
              </IonCard>
              <IonCard className="payment-info-card-content" disabled>
                <div className="payment-info-card-title-details">
                  <IonImg
                    color="danger"
                    slot="start"
                    className="payment-info-icon-img"
                    src={card}
                  ></IonImg>
                  <IonLabel>Card</IonLabel>
                </div>
              </IonCard> */}
              <IonCard
                className="payment-info-card-content-draft"
                onClick={() => handlePay("Pending")}
              >
                <div className="payment-info-card-draft-details">
                  <IonImg
                    color="danger"
                    slot="start"
                    className="payment-info-icon-img"
                    src={draft}
                  ></IonImg>
                  <IonLabel>Save as Draft</IonLabel>
                </div>
              </IonCard>
            </div>
          </div>
        </div>
      </div>

      <div className="payment-info-footer-total-details">
        <div className="payment-info-footer-total">
          Total amount to be paid:{" "}
        </div>

        <div className="payment-info-footer-total-info">
          <span>&#8369;</span>
          {getTotal?.toFixed(2)}
        </div>
      </div>
      <IonToast
        isOpen={isOpenToast?.isOpen}
        message={isOpenToast.toastMessage}
        duration={3000}
        onDidDismiss={() => setIsOpenToast({ toastMessage: "", isOpen: false })}
      ></IonToast>
    </div>
  );
};

export default PaymentOptionsComponent;
