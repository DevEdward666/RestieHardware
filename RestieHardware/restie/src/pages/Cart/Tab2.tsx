import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonImg,
  IonMenuButton,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  PostOrder,
  getOrderInfo,
  saveOrder,
} from "../../Service/Actions/Inventory/InventoryActions";
import { GetLoginUser } from "../../Service/Actions/Login/LoginActions";
import { RootStore, useTypedDispatch } from "../../Service/Store";
import restielogo from "../../assets/images/Icon@3.png";
import CartComponent from "../../components/Cart/CartComponent";
import "./Tab2.css";
import { PostSelectedOrder } from "../../Models/Request/Inventory/InventoryModel";
import { ResponseModel } from "../../Models/Response/Commons/Commons";
import { AddCustomerInformation } from "../../Service/Actions/Customer/CustomerActions";

const Tab2: React.FC = () => {
  const dispatch = useTypedDispatch();
  const router = useIonRouter();
  const selectedItemselector =
    useSelector((store: RootStore) => store.InventoryReducer.add_to_cart) || [];
  const [getTotal, setTotal] = useState<number>(0);
  const [existingOrder, setExistingOrder] = useState<boolean>(false);
  const customer_information = useSelector(
    (store: RootStore) => store.CustomerReducer.customer_information
  );
  const user_login_information = useSelector(
    (store: RootStore) => store.LoginReducer.user_login_information
  );
  useEffect(() => {
    const getTotal = () => {
      let totalPrice = 0; // Initialize total price

      // Check if selectedItemselector is an array
      if (Array.isArray(selectedItemselector)) {
        // Iterate over each item in the cart
        selectedItemselector.forEach((item) => {
          const itemTotal = item.price * item.qty; // Calculate total price for the item
          totalPrice += itemTotal; // Add item total to overall total
        });
      }

      setTotal(totalPrice); // Set the total price
      const existingOrder = selectedItemselector.findIndex(
        (item) => item.orderid?.length! > 0
      );
      console.log(existingOrder);
      if (existingOrder > -1) {
        setExistingOrder(true);
        dispatch(
          AddCustomerInformation({
            name: "",
            address: "",
            contactno: 0,
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
  const handleSaveOrder = useCallback(async () => {
    try {
      const res = await dispatch(GetLoginUser());
      if (res?.name.length! <= 0 || res === undefined) {
        router.push("/login");
      } else {
        const date = new Date().getTime();
        if (existingOrder) {
          console.log(existingOrder);
          if (
            (selectedItemselector.length > 0 &&
              selectedItemselector[0].status === "quotation") ||
            selectedItemselector[0].status === "pending" ||
            selectedItemselector[0].status === "cancel"
          ) {
            let status =
              selectedItemselector[0].status === "cancel"
                ? "pending"
                : selectedItemselector[0].status;
            const addedOrder: ResponseModel = await dispatch(
              PostOrder(
                selectedItemselector[0].orderid!,
                selectedItemselector,
                customer_information,
                new Date().getTime(),
                status,
                0.0,
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
              router.push(`/orderInfo?orderid=${addedOrder.result?.orderid!}`);
            }
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
  ]);
  console.log(selectedItemselector);
  return (
    <IonPage className="home-page-container">
      <IonHeader className="home-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonTitle>Cart</IonTitle>
        </IonToolbar>
        <IonToolbar
          mode="ios"
          color="tertiary"
          className="home-toolbar-logo-container"
        >
          <IonImg src={restielogo} className="home-toolbar-logo"></IonImg>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="tab-cart-content">
        <CartComponent />
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <div className="tab-cart-footer">
            <IonText className="tab-cart-total">
              Total - <span>&#8369;</span>
              {formattedNumber(getTotal)}
            </IonText>
            {selectedItemselector.length > 0 ? (
              <IonButton color="medium" onClick={() => handleSaveOrder()}>
                Proceed
              </IonButton>
            ) : null}
          </div>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Tab2;
