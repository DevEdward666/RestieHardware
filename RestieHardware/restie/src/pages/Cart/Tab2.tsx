import {
  IonButton,
  IonContent,
  IonFooter,
  IonHeader,
  IonPage,
  IonTitle,
  IonToast,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  PostOrder,
  addToCartAction,
  getOrderInfo,
  saveOrder,
} from "../../Service/Actions/Inventory/InventoryActions";
import { GetLoginUser } from "../../Service/Actions/Login/LoginActions";
import { RootStore, useTypedDispatch } from "../../Service/Store";
import restielogo from "../../assets/images/Icon@3.png";
import CartComponent from "../../components/Cart/CartComponent";
import ImageToInventoryText from "../../components/ImageToInventoryText";
import "./Tab2.css";
import { Addtocart, PostSelectedOrder } from "../../Models/Request/Inventory/InventoryModel";
import { ResponseModel } from "../../Models/Response/Commons/Commons";
import { AddCustomerInformation } from "../../Service/Actions/Customer/CustomerActions";
import { ParsedInventoryRow } from "../../utils/inventoryTextParser";
import { v4 as uuidv4 } from "uuid";

const Tab2: React.FC = () => {
  const dispatch = useTypedDispatch();
  const router = useIonRouter();
  const selectedItemselector =
    useSelector((store: RootStore) => store.InventoryReducer.add_to_cart) || [];
  const inventoryList =
    useSelector((store: RootStore) => store.InventoryReducer.list_of_items) || [];
  const [getTotal, setTotal] = useState<number>(0);
  const [getTotalDiscount, setTotalDiscount] = useState<number>(0);
  const [existingOrder, setExistingOrder] = useState<boolean>(false);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const customer_information = useSelector(
    (store: RootStore) => store.CustomerReducer.customer_information
  );
  const user_login_information = useSelector(
    (store: RootStore) => store.LoginReducer.user_login_information
  );
  const [isOpenToast, setIsOpenToast] = useState({
    toastMessage: "",
    isOpen: false,
    type: "",
  });
  useEffect(() => {
    const getTotal = () => {
      let totalPrice = 0; // Initialize total price
      let totalDiscount = 0;
      // Check if selectedItemselector is an array
      if (Array.isArray(selectedItemselector)) {
        // Iterate over each item in the cart
        selectedItemselector.forEach((item) => {
          const discount = item.qty * (item.discount ?? 0);
          const itemTotal = (item.price - (item.discount ?? 0)) * item.qty;
          totalDiscount += discount;
          totalPrice += itemTotal; // Add item total to overall total
        });
      }

      setTotalDiscount(totalDiscount);
      setTotal(totalPrice); // Set the total price
      const existingOrder = selectedItemselector.findIndex(
        (item) => item.orderid?.length! > 0
      );
      if (existingOrder > -1) {
        setExistingOrder(true);
        dispatch(
          AddCustomerInformation({
            name: "",
            address: "",
            contactno: "0",
            ordertype: "",
            newUser: false,
          })
        );
      }
    };

    getTotal(); // Calculate total when selectedItemselector changes
  }, [dispatch, selectedItemselector]);
  const formattedNumber = (number: number) => {
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // ---------------------------------------------------------------------------
  // OCR import → cart wiring
  // Maps ParsedInventoryRow (matched_code) → Addtocart and merges into cart state.
  // No DB insertion occurs here — rows are staged locally for checkout.
  // ---------------------------------------------------------------------------
  const handleImportReady = useCallback(
    (importedRows: ParsedInventoryRow[]) => {
      const validRows = importedRows.filter(
        (r) => r.matched_code && r.qty !== null && r.qty > 0
      );
      if (!validRows.length) return;

      const cartId =
        selectedItemselector.length > 0
          ? selectedItemselector[0].cartid
          : uuidv4();

      const existingOrderId =
        selectedItemselector.length > 0
          ? selectedItemselector[0].orderid ?? ""
          : "";

      const updatedCart: Addtocart[] = [...selectedItemselector];

      for (const row of validRows) {
        const inventoryMatch = inventoryList.find(
          (inv) => inv.code === row.matched_code
        );
        const existingIdx = updatedCart.findIndex(
          (c) => c.code === row.matched_code
        );

        if (existingIdx !== -1) {
          // Increment qty of existing cart entry
          updatedCart[existingIdx] = {
            ...updatedCart[existingIdx],
            qty: updatedCart[existingIdx].qty + Math.max(1, row.qty ?? 1),
          };
        } else {
          // Append new cart entry
          const newEntry: Addtocart = {
            cartid: cartId,
            code: row.matched_code!,
            item: inventoryMatch?.item ?? row.description,
            qty: Math.max(1, row.qty ?? 1),
            price: inventoryMatch?.price ?? 0,
            onhandqty: inventoryMatch?.qty ?? undefined,
            image: inventoryMatch?.image ?? "",
            createdAt: new Date().getTime(),
            status: "pending",
            orderid: existingOrderId,
            discount: 0,
          };
          updatedCart.push(newEntry);
        }
      }

      dispatch(addToCartAction(updatedCart));
      setShowScanner(false);
      setIsOpenToast({
        toastMessage: `${validRows.length} item(s) added to cart from scanned list.`,
        isOpen: true,
        type: "toast",
      });
    },
    [dispatch, selectedItemselector, inventoryList]
  );

  const handleSaveOrder = useCallback(async () => {
    try {
      const res = await dispatch(GetLoginUser());
      if (res?.name.length! <= 0 || res === undefined) {
        router.push("/login");
      } else {
        const date = new Date().getTime();
        if (existingOrder) {
          if (
            (selectedItemselector.length > 0 &&
              selectedItemselector[0].status === "quotation") ||
            selectedItemselector[0].status === "pending" ||
            selectedItemselector[0].status === "cancel"
          ) {
            const updatedCartItems = selectedItemselector.map((item, index) => {
              const updatedDiscount = item.discount ?? 0;
              const updatedVoucherCode = item.voucher_code ?? "";

              return {
                ...item,
                discount: updatedDiscount,
                voucher_code: updatedVoucherCode,
                voucher: item.voucher,
                voucher_id: item.voucher_id ?? 0,
                total_discount: getTotalDiscount,
              };
            });
            // if (getTotalDiscount > 0) {
            //   setIsOpenToast({
            //     toastMessage:
            //       "You can't save an order as draft if it has a voucher",
            //     isOpen: true,
            //     type: "toast",
            //   });
            //   return;
            // }
            let status =
              selectedItemselector[0].status === "cancel"
                ? "pending"
                : selectedItemselector[0].status;
            // const addedOrder: ResponseModel = await dispatch(
            //   PostOrder(
            //     selectedItemselector[0].orderid!,
            //     updatedCartItems,
            //     customer_information,
            //     new Date().getTime(),
            //     status,
            //     0.0,
            //     user_login_information.name
            //   )
            // );
            // if (addedOrder) {
            //   const payload: PostSelectedOrder = {
            //     orderid: addedOrder.result?.orderid!,
            //     userid: "",
            //     cartid: addedOrder.result?.cartid!,
            //   };
            //   dispatch(getOrderInfo(payload));
            //   router.push(
            //     `/orderInfo?orderid=${addedOrder.result
            //       ?.orderid!}&return=false&notification=false`
            //   );
            // }
            router.push("/customerInformation");
          }
        } else {
          // await dispatch(saveOrder(selectedItemselector, date));
          console.log(existingOrder);
          router.push("/customerInformation");
        }
      }
    } catch (error) {
      console.log("User Not logged in");
    }
  }, [
    dispatch,
    user_login_information,
    selectedItemselector,
    customer_information,
    existingOrder,
    getTotalDiscount,
  ]);
  return (
    <IonPage className="home-page-container">
      <IonHeader className="home-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonTitle>Cart</IonTitle>
        </IonToolbar>
        {/* <IonToolbar
          mode="ios"
          color="tertiary"
          className="home-toolbar-logo-container"
        >
          <div
            className={` ${
              platform.includes("mobileweb") && !platform.includes("tablet")
                ? ""
                : "web"
            }`}
          >
            <IonImg src={restielogo} className="home-toolbar-logo"></IonImg>
          </div>
        </IonToolbar> */}
      </IonHeader>
      <IonToast
        isOpen={isOpenToast.type === "toast" ? isOpenToast?.isOpen : false}
        message={isOpenToast.toastMessage}
        color="medium"
        position="middle"
        duration={3000}
        onDidDismiss={() => setIsOpenToast({ toastMessage: "", isOpen: false, type: "" })}
      />
      <IonContent fullscreen className="tab-cart-content">
        <IonButton
          expand="block"
          fill="outline"
          color="tertiary"
          style={{ margin: "8px 12px 0" }}
          onClick={() => setShowScanner((v) => !v)}
        >
          {showScanner ? "Hide Scanner" : "📷 Scan Materials List"}
        </IonButton>

        {showScanner && (
          <div style={{ padding: "0 8px" }}>
            <ImageToInventoryText
              inventoryItems={inventoryList.map((inv) => ({
                code: inv.code,
                item: inv.item,
                category: inv.category,
                brand: inv.brand,
              }))}
              onImportReady={handleImportReady}
            />
          </div>
        )}

        <CartComponent />
      </IonContent>
      <IonFooter>
        <IonToolbar className="t2-footer-toolbar">
          <div className="t2-footer-bar">
            <div className="t2-total-block">
              <span className="t2-total-label">Total</span>
              <span className="t2-total-amount">₱{formattedNumber(getTotal)}</span>
            </div>
            {selectedItemselector.length > 0 && (
              <IonButton className="t2-proceed-btn" onClick={() => handleSaveOrder()}>
                Proceed
              </IonButton>
            )}
          </div>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Tab2;
