import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCheckbox,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonTextarea,
  IonToast,
  useIonRouter,
} from "@ionic/react";
import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootStore, useTypedDispatch } from "../../../../Service/Store";
import { removeCircle, addCircle } from "ionicons/icons";
import {
  CompleteReturnRefund,
  ItemReturns,
} from "../../../../Models/Request/Inventory/InventoryModel";
import stock from "../../../../assets/images/Image_not_available.png";
import "./RefundSubmitComponents.css";
import {
  completeRefund,
  complete_return_refund,
  get_item_returns,
  update_item_returns,
} from "../../../../Service/Actions/Inventory/InventoryActions";
import { PostReturnItems } from "../../../../Service/API/Inventory/InventoryApi";
const RefundSubmitComponents: React.FC = () => {
  const checked_return_refund = useSelector(
    (store: RootStore) => store.InventoryReducer.checked_return_refund
  );
  const complete = useSelector(
    (store: RootStore) => store.InventoryReducer.complete_return_refund
  );
  const [isOpenToast, setIsOpenToast] = useState({
    toastMessage: "",
    isOpen: false,
  });
  const router = useIonRouter();
  const [getRemarks, setRemarks] = useState<string>("");
  const [getTotal, setTotal] = useState<number>(0);
  const dispatch = useTypedDispatch();
  const CardList = (card: ItemReturns) => {
    return (
      <div key={card.code}>
        <IonItem className="return-submit-item-card">
          <div className="return-submit-item-card-div">
            <IonCard className="return-submit-card-container">
              <div className="return-submit-card-add-item-img">
                <img alt={card.item} src={stock} />
              </div>
              <div className="return-submit-card-add-item-container">
                <IonCardContent className="return-submit-card-main-content">
                  <div className="return-submit-card-content">
                    <div className="return-submit-card-title">{card.item}</div>
                    <div className="return-submit-card-price">
                      <span>&#8369;</span>
                      {card.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="return-submit-card-qty">{card?.qty} pcs</div>
                </IonCardContent>
              </div>
            </IonCard>
          </div>
        </IonItem>
      </div>
    );
  };
  useEffect(() => {
    const initialize = () => {
      let total = 0;
      checked_return_refund.map((val) => {
        total += val.total;
      });
      setTotal(total);
    };
    initialize();
  }, []);
  const getOrderIDFromURL = () => {
    const url = new URL(window.location.href);
    return url.searchParams.get("orderid");
  };
  useEffect(() => {
    const initialize = async () => {
      const orderId = getOrderIDFromURL();
      if (complete.complete) {
        const updatedItems = checked_return_refund.map((val) => {
          return {
            ...val,
            remarks: getRemarks, // Update the remarks property
          };
        });
        const res = await dispatch(completeRefund(updatedItems));
        if (res.status === 200) {
          setIsOpenToast({
            isOpen: true,
            toastMessage: res.message,
          });
          router.push(
            `/orderInfo?orderid=${orderId}&return=false&notification=false`
          );
        } else {
          setIsOpenToast({
            isOpen: true,
            toastMessage: res.message,
          });
        }
      }
    };
    initialize();
  }, [dispatch, complete, getRemarks]);

  const handleInfoChange = async (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    //   const addeditemsRemarks = addItemRemarks(
    //     items,
    //     get_item_returns,
    //     get_item_returns[0]?.cartid,
    //     value
    //   );
    //   await dispatch(update_item_returns(addeditemsRemarks));
    setRemarks(value);
  };
  return (
    <IonContent>
      <div>
        {checked_return_refund?.map((card, index) => (
          <div className="checkbox-container" key={index}>
            <div className="checkbox-card-container">
              {/* Your CardList component */}
              <CardList
                key={card.code}
                cartid={card.cartid}
                code={card.code}
                item={card.item}
                qty={card.qty}
                price={card.price}
                createdat={card.createdat}
                status={card.status}
                transid={card.transid}
                orderid={card.orderid}
                total={card.total}
                remarks={card.remarks}
              />
            </div>
          </div>
        ))}
        <IonCard className="return-submit-card-container-total">
          <div className="return-submit-card-add-item-container-total">
            <IonCardContent className="return-submit-card-main-content-total">
              <div className="return-submit-card-content-total">
                <div className="return-submit-card-title-total">
                  Refund Total
                </div>
                <div className="return-submit-card-total">
                  <span>&#8369;</span>
                  {getTotal.toFixed(2)}
                </div>
              </div>
            </IonCardContent>
          </div>
        </IonCard>
        <div className="return-submit-reason-content">
          <IonTextarea
            labelPlacement="floating"
            label="Reason for refund"
            name="reason"
            rows={3}
            maxlength={255}
            onIonInput={(e: any) => handleInfoChange(e)}
            className="remarks-input"
          ></IonTextarea>
        </div>
      </div>
      <IonToast
        isOpen={isOpenToast?.isOpen}
        message={isOpenToast.toastMessage}
        position="middle"
        color={"medium"}
        duration={3000}
        onDidDismiss={() => setIsOpenToast({ toastMessage: "", isOpen: false })}
      ></IonToast>
    </IonContent>
  );
};

export default RefundSubmitComponents;
