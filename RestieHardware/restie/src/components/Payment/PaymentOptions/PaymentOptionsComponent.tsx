import {
  IonContent,
  IonImg,
  IonInput,
  IonLoading,
  IonSelect,
  IonSelectOption,
  IonToast,
  useIonRouter,
} from "@ionic/react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  GetVoucherType,
  PostSelectedOrder,
  PostVoucherInfoModel,
} from "../../../Models/Request/Inventory/InventoryModel";
import { ResponseModel } from "../../../Models/Response/Commons/Commons";
import { GetPaymentInfo } from "../../../Models/Response/Customer/GetCustomerModel";
import {
  PostOrder,
  getOrderInfo,
  get_all_voucher_actions,
  get_list_of_voucher_actions,
  get_voucher_actions,
  remove_voucher_actions,
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
  const get_list_voucher =
    useSelector(
      (store: RootStore) => store.InventoryReducer.get_list_voucher
    ) || [];
  const [getOverallTotal, setOverallTotal] = useState<number>(0.0);

  const [getDiscount, setDiscount] = useState<number>(0.0);
  const [getDiscountPerItem, setDiscountPerItem] = useState<number>(0.0);

  const dispatch = useTypedDispatch();
  const router = useIonRouter();

  const [isOpenToast, setIsOpenToast] = useState({
    toastMessage: "",
    isOpen: false,
    type: "",
  });
  const [customerPayemntInfo, setCustomerPaymentInfo] =
    useState<GetPaymentInfo>({
      cash: 0.0,
      voucher: "",
    });

  const saveOrder = async (type: string) => {
    await handlePostOrder(type);
  };

  const handlePay = useCallback(
    async (type: string) => {
      const totalAmountToPay = getOverallTotal;
      const customerCash = Math.round(customerPayemntInfo.cash * 100);
      const totalCashRequired = Math.round(totalAmountToPay * 100);
      if (type.toLowerCase() === "cash" && customerCash < totalCashRequired) {
        setIsOpenToast({
          toastMessage: "Not enough cash",
          isOpen: true,
          type: "toast",
        });
      } else if (type.toLowerCase() === "pending" && getDiscountPerItem > 0) {
        setIsOpenToast({
          toastMessage: "You can't save an order as Draft if it has a voucher",
          isOpen: true,
          type: "toast",
        });
      } else if (type.toLowerCase() === "quotation" && getDiscountPerItem > 0) {
        setIsOpenToast({
          toastMessage: "You can't Create a Quoatation if it has a voucher",
          isOpen: true,
          type: "toast",
        });
      } else if (type.toLowerCase() === "debt" && getDiscountPerItem > 0) {
        setIsOpenToast({
          toastMessage: "You can't save an order as Terms if it has a voucher",
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
        setCustomerPaymentInfo({
          cash: 0,
          voucher: "",
        });
      }
    },
    [getOverallTotal, customerPayemntInfo.cash, getDiscountPerItem]
  );

  const handlePostOrder = useCallback(
    async (type: string) => {
      const updatedCartItems = add_to_cart.map((item, index) => {
        const updatedDiscount = item.discount;
        const updatedVoucherCode = item.voucher_code;
        return {
          ...item,
          discount: updatedDiscount ?? 0,
          voucher_code: updatedVoucherCode,
          voucher: item.voucher,
          order_voucher: customerPayemntInfo.voucher ?? "",
          voucher_id: item.voucher?.id ?? 0,
          total_discount: getDiscount ?? 0,
        };
      });
      const addedOrder: ResponseModel = await dispatch(
        PostOrder(
          add_to_cart[0].orderid!,
          updatedCartItems,
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
          `/orderInfo?orderid=${addedOrder.result
            ?.orderid!}&return=false&notification=false`
        );
      }
    },
    [
      dispatch,
      add_to_cart,
      customer_information,
      customerPayemntInfo,
      getDiscount,
    ]
  );
  useEffect(() => {
    const handleGetAllVoucehers = () => {
      const payload: GetVoucherType = {
        voucher_for: "all",
      };
      dispatch(get_list_of_voucher_actions(payload));
    };
    handleGetAllVoucehers();
  }, [dispatch]);
  useEffect(() => {
    let totalAmount = 0;
    let totalDiscount: number = 0;
    let OverAllTotal: number = 0;
    let OverAllDiscount: number = 0;

    add_to_cart.forEach((val: any) => {
      totalDiscount += val.qty * (val.discount ?? 0);
      totalAmount += val.price * val.qty;
    });
    OverAllDiscount = (totalDiscount ?? 0);

    OverAllTotal = totalAmount - OverAllDiscount;
    setDiscountPerItem(OverAllDiscount);
    setOverallTotal(OverAllTotal);
  }, [add_to_cart]);
  const handleInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCustomerPaymentInfo((prevState) => ({
      ...prevState,
      [name]: name === "cash" ? parseFloat(value) : value,
    }));
  };
  // useEffect(() => {
  //   const initialize = async () => {
  //     const payload: PostVoucherInfoModel = {
  //       vouchercode: customerPayemntInfo.voucher!,
  //     };
  //     if (
  //       customerPayemntInfo.voucher &&
  //       customerPayemntInfo.voucher.length > 0
  //     ) {
  //       const res = await dispatch(get_voucher_actions(payload));
  //       const totalDiscount = res.discount * getTotal;
  //       setDiscount(totalDiscount);
  //       setOverallTotalWithDiscount(getTotal - totalDiscount);
  //     }
  //   };
  //   initialize();
  // }, [customerPayemntInfo.voucher, dispatch]);
  const handleSelectVoucher = useCallback(
    async (val: CustomEvent<HTMLIonSelectElement>) => {
      const { value } = val.detail;
      if (value) {
        const selectedVoucher = value;
        let totalAmount = 0;
        let totalDiscount: number = 0;
        let OverAllTotal: number = 0;
        let OverAllDiscount: number = 0;

        add_to_cart.forEach((val: any) => {
          totalDiscount += val.qty * (val.discount ?? 0);
          totalAmount += val.price * val.qty;
        });
        OverAllDiscount = ((totalAmount - totalDiscount) * JSON.parse(selectedVoucher).discount);
        OverAllTotal = totalAmount - totalDiscount - OverAllDiscount;

        setDiscountPerItem(totalDiscount + OverAllDiscount);
        setOverallTotal(OverAllTotal);

        //-----//
        // const totalDiscount =
        //   JSON.parse(selectedVoucher).discount * getOverallTotal;

        setDiscount(OverAllDiscount);
      }
    },
    [getOverallTotal, add_to_cart]
  );
  // const handleRemoveVoucher = useCallback(() => {
  //   dispatch(remove_voucher_actions());
  //   let totalAmount = 0;
  //   add_to_cart.forEach((val: any) => {
  //     totalAmount += val.qty * val.price;
  //   });
  //   setTotal(totalAmount);
  //   setDiscount(0);
  //   setOverallTotalWithDiscount(0);
  // }, [dispatch, add_to_cart]);

  return (
    <IonContent className="po-content">
      <IonLoading
        isOpen={isOpenToast.type === "loader" ? isOpenToast?.isOpen : false}
        message="Loading"
        duration={1000}
        spinner="circles"
        onDidDismiss={() =>
          setIsOpenToast((prev) => ({ ...prev, isOpen: false }))
        }
      />

      <div className="po-container">
        <div className="po-inner">

          {/* ── Total summary card ── */}
          <div className="po-total-card">
            <div>
              <p className="po-total-label">Total to Pay</p>
              <p className="po-total-amount">&#8369;{getOverallTotal.toFixed(2)}</p>
            </div>
            {getDiscountPerItem > 0 && (
              <div className="po-discount-badge">
                <p className="po-discount-label">Discount</p>
                <p className="po-discount-amount">-&#8369;{getDiscountPerItem.toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* ── Payment methods ── */}
          <div className="po-methods-card">
            <p className="po-card-section-title">Payment Method</p>

            {/* Cash (active) */}
            <div className="po-method-row">
              <div className="po-method-header">
                <IonImg className="po-method-icon" src={cash} />
                <span className="po-method-label">Cash</span>
                <span className="po-method-badge">Active</span>
              </div>
              <div className="po-cash-body">
                <div className="po-field">
                  <span className="po-label">Cash Amount</span>
                  <IonInput
                    className="po-input"
                    name="cash"
                    type="number"
                    placeholder="Enter cash amount"
                    onIonInput={(e: any) => handleInfoChange(e)}
                  />
                </div>
                <div className="po-field">
                  <span className="po-label">Voucher</span>
                  <IonSelect
                    className="po-select"
                    name="Voucher"
                    aria-label="Voucher"
                    placeholder="Select voucher (optional)"
                    onIonChange={(e: any) => handleSelectVoucher(e)}
                  >
                    {get_list_voucher?.map((val, index) => (
                      <IonSelectOption key={index} value={JSON.stringify(val)}>
                        {val.vouchercode} - {val.description}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </div>
                <button className="po-pay-now-btn" onClick={() => handlePay("Cash")}>
                  Pay Now
                </button>
              </div>
            </div>

            {/* E-Wallet (coming soon) */}
            <div className="po-method-row">
              <div className="po-method-header po-method-disabled">
                <IonImg className="po-method-icon" src={ewallets} />
                <span className="po-method-label">E-Wallet</span>
                <span className="po-method-badge po-method-badge-soon">Coming Soon</span>
              </div>
            </div>

            {/* Card (coming soon) */}
            <div className="po-method-row">
              <div className="po-method-header po-method-disabled">
                <IonImg className="po-method-icon" src={card} />
                <span className="po-method-label">Card</span>
                <span className="po-method-badge po-method-badge-soon">Coming Soon</span>
              </div>
            </div>
          </div>

          {/* ── Other actions ── */}
          <div className="po-actions-card">
            <p className="po-card-section-title">Other Options</p>
            <div className="po-action-row">
              <button className="po-action-btn" onClick={() => handlePay("Pending")}>
                Save as Draft
              </button>
              <button className="po-action-btn" onClick={() => handlePay("Debt")}>
                Save as Terms
              </button>
            </div>
            <button className="po-action-btn" onClick={() => handlePay("Quotation")}>
              Create a Quotation
            </button>
          </div>

        </div>
      </div>

      <IonToast
        isOpen={isOpenToast.type === "toast" ? isOpenToast?.isOpen : false}
        message={isOpenToast.toastMessage}
        color="medium"
        position="middle"
        duration={3000}
        onDidDismiss={() =>
          setIsOpenToast({ toastMessage: "", isOpen: false, type: "" })
        }
      />
    </IonContent>
  );
};

export default PaymentOptionsComponent;
