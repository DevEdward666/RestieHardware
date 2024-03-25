import {
  useIonRouter,
  IonCard,
  IonCardContent,
  IonItem,
  IonImg,
  IonIcon,
  IonLabel,
  IonNote,
} from "@ionic/react";
import { useSelector } from "react-redux";
import { PostSelectedOrder } from "../../../Models/Request/Inventory/InventoryModel";
import {
  PostOrder,
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
  const handlePay = useCallback(
    async (type: string) => {
      const addedOrder = await dispatch(
        PostOrder(add_to_cart, customer_information, new Date().getTime(), type)
      );
      if (addedOrder) {
        router.push("/home/profile");
      }
    },
    [add_to_cart, customer_information]
  );
  console.log(add_to_cart, customer_information);
  useEffect(() => {
    let totalAmount = 0;
    add_to_cart.forEach((val: any) => {
      totalAmount += val.qty * val.price;
    });
    setTotal(totalAmount);
  }, [add_to_cart]);
  return (
    <div className="payment-info-main-container">
      <div className="payment-info-container">
        <div
          className="payment-info-card-container"
          //   onClick={() => handleSelectOrder(orders.orderid)}
        >
          <div className="payment-info-card-add-item-container">
            <div className="payment-info-card-main-content">
              <IonCard
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
              </IonCard>
              <IonCard
                className="payment-info-card-content"
                onClick={() => handlePay("Pending")}
              >
                <div className="payment-info-card-title-details">
                  <IonLabel>Proceed without payment</IonLabel>
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
    </div>
  );
};

export default PaymentOptionsComponent;
