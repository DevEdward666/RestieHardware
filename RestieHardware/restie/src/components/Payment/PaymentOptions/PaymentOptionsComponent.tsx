import {
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonChip,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonLoading,
  IonToast,
  getPlatforms,
  useIonRouter,
} from "@ionic/react";
import { close } from "ionicons/icons";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  PostSelectedOrder,
  PostVoucherInfoModel,
} from "../../../Models/Request/Inventory/InventoryModel";
import { ResponseModel } from "../../../Models/Response/Commons/Commons";
import { GetPaymentInfo } from "../../../Models/Response/Customer/GetCustomerModel";
import {
  PostOrder,
  getOrderInfo,
  get_voucher_actions,
} from "../../../Service/Actions/Inventory/InventoryActions";
import { RootStore, useTypedDispatch } from "../../../Service/Store";
import cash from "../../../assets/images/icons/Cash.png";
import ewallets from "../../../assets/images/icons/E-Wallets.png";
import card from "../../../assets/images/icons/card.png";
import "./PaymentOptionsComponent.css";
const PaymentOptionsComponent = () => {
  const add_to_cart = useSelector(
    (store: RootStore) => store.InventoryReducer.add_to_cart
  );
  const get_voucher = useSelector(
    (store: RootStore) => store.InventoryReducer.get_voucher
  );
  const customer_information = useSelector(
    (store: RootStore) => store.CustomerReducer.customer_information
  );
  const user_login_information = useSelector(
    (store: RootStore) => store.LoginReducer.user_login_information
  );
  const [getTotal, setTotal] = useState<number>(0.0);
  const [getOverallTotal, setOverallTotal] = useState<number>(0.0);

  const [getDiscount, setDiscount] = useState<number>(0.0);

  const dispatch = useTypedDispatch();
  const router = useIonRouter();
  const platform = getPlatforms();
  const [isOpenToast, setIsOpenToast] = useState({
    toastMessage: "",
    isOpen: false,
    type: "",
  });
  const [customerPayemntInfo, setCustomerPaymentInfo] =
    useState<GetPaymentInfo>({
      cash: 0,
      voucher: "",
    });

  const saveOrder = async (type: string) => {
    await handlePostOrder(type);
  };

  const handlePay = useCallback(
    async (type: string) => {
      const totalAmountToPay = getOverallTotal > 0 ? getOverallTotal : getTotal;

      if (
        type.toLowerCase() === "cash" &&
        customerPayemntInfo.cash < totalAmountToPay
      ) {
        setIsOpenToast({
          toastMessage: "Not enough cash",
          isOpen: true,
          type: "toast",
        });
      } else {
        setIsOpenToast({
          toastMessage: "Loading",
          isOpen: true,
          type: "loader",
        });

        await saveOrder(type);
      }
    },
    [getOverallTotal, getTotal]
  );

  const handlePostOrder = useCallback(
    async (type: string) => {
      const addedOrder: ResponseModel = await dispatch(
        PostOrder(
          add_to_cart[0].orderid!,
          add_to_cart,
          customer_information,
          new Date().getTime(),
          type,
          type.toLowerCase() === "cash" ? customerPayemntInfo.cash : 0.0,
          user_login_information.name
        )
      );

      if (addedOrder) {
        const payload: PostSelectedOrder = {
          orderid: addedOrder.result?.orderid!,
          userid: "",
          cartid: addedOrder.result?.cartid!,
        };

        dispatch(getOrderInfo(payload));

        router.push(
          `/orderInfo?orderid=${addedOrder.result?.orderid!}&return=false`
        );
      }
    },
    [dispatch, add_to_cart, customer_information, customerPayemntInfo]
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
  };
  useEffect(() => {
    const initialize = async () => {
      const payload: PostVoucherInfoModel = {
        vouchercode: customerPayemntInfo.voucher!,
      };
      if (
        customerPayemntInfo.voucher &&
        customerPayemntInfo.voucher.length > 0
      ) {
        const res = await dispatch(get_voucher_actions(payload));
        const totalWithDiscount = getTotal - res.discount * getTotal;
        setDiscount(res.discount * getTotal);
        setOverallTotal(totalWithDiscount);
      }
    };
    initialize();
  }, [customerPayemntInfo, dispatch]);

  const handleRemoveVoucher = useCallback(() => {
    dispatch(get_voucher_actions({ vouchercode: "" }));
    let totalAmount = 0;
    add_to_cart.forEach((val: any) => {
      totalAmount += val.qty * val.price;
    });
    setTotal(totalAmount);
    setDiscount(0);
  }, [dispatch, add_to_cart]);

  return (
    <div className="payment-info-card-main">
      <div
        className={`payment-info-main-container ${
          platform.includes("mobileweb") && !platform.includes("tablet")
            ? "mobile"
            : "desktop"
        }`}
      >
        <IonLoading
          isOpen={isOpenToast.type === "loader" ? isOpenToast?.isOpen : false}
          message="Loading"
          duration={1000}
          spinner="circles"
          onDidDismiss={() =>
            setIsOpenToast((prev) => ({
              ...prev,
              isOpen: false,
            }))
          }
        />
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
                          name="voucher"
                          onIonInput={(e: any) => handleInfoChange(e)}
                          className="payment-info-input"
                          label="Voucher"
                          debounce={1500}
                          labelPlacement="floating"
                          placeholder="Enter Voucher"
                        ></IonInput>
                      </IonItem>
                      {get_voucher?.description !== null &&
                      get_voucher?.description !== "" ? (
                        <div>
                          <IonChip>
                            <IonLabel>{get_voucher.description}</IonLabel>
                            <IonIcon
                              icon={close}
                              onClick={() => handleRemoveVoucher()}
                            ></IonIcon>
                          </IonChip>
                        </div>
                      ) : null}
                      <IonButton
                        color="medium"
                        onClick={() => handlePay("Cash")}
                      >
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
                <div className="save-button-container">
                  <IonButton
                    color={"medium"}
                    className="payment-info-card-content-draft"
                    onClick={() => handlePay("Pending")}
                  >
                    Save as Draft
                  </IonButton>
                  <IonButton
                    color={"medium"}
                    className="payment-info-card-content-draft"
                    onClick={() => handlePay("Debt")}
                  >
                    Save as Terms
                  </IonButton>
                </div>
                {user_login_information?.role.trim().toLowerCase() ===
                  "admin" ||
                user_login_information?.role.trim().toLowerCase() ===
                  "super admin" ? (
                  <IonButton
                    color={"medium"}
                    className="payment-info-card-content-draft"
                    onClick={() => handlePay("Quotation")}
                  >
                    Create a Quotation
                  </IonButton>
                ) : null}
                {/* <IonButton
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
              </IonButton> */}
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
            {getOverallTotal > 0
              ? getOverallTotal.toFixed()
              : getTotal.toFixed()}
          </div>
        </div>
        {getDiscount > 0 ? (
          <div className="payment-info-footer-total-details">
            <div className="payment-info-footer-total">Total Discount: </div>

            <div className="payment-info-footer-total-info">
              <span>&#8369;</span>
              {getDiscount.toFixed()}
            </div>
          </div>
        ) : null}

        <IonToast
          isOpen={isOpenToast.type === "toast" ? isOpenToast?.isOpen : false}
          message={isOpenToast.toastMessage}
          color={"medium"}
          position="middle"
          duration={3000}
          onDidDismiss={() =>
            setIsOpenToast({ toastMessage: "", isOpen: false, type: "" })
          }
        ></IonToast>
      </div>
    </div>
  );
};

export default PaymentOptionsComponent;
