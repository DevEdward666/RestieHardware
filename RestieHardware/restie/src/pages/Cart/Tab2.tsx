import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonMenuButton,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import ExploreContainer from "../../components/ExploreContainer";
import "./Tab2.css";
import restielogo from "../../assets/images/Icon@3.png";
import CartComponent from "../../components/Cart/CartComponent";
import { useSelector } from "react-redux";
import { RootStore, useTypedDispatch } from "../../Service/Store";
import { useEffect, useState } from "react";
import { card, removeCircle } from "ionicons/icons";
import { saveOrder } from "../../Service/Actions/Inventory/InventoryActions";
import { ResponseModel } from "../../Models/Response/Commons/Commons";

const Tab2: React.FC = () => {
  const dispatch = useTypedDispatch();
  const selectedItemselector =
    useSelector((store: RootStore) => store.InventoryReducer.add_to_cart) || [];
  const [getTotal, setTotal] = useState<number>(0);
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
    };

    getTotal(); // Calculate total when selectedItemselector changes
  }, [selectedItemselector]);
  const formattedNumber = (number: number) => {
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  const handleSaveOrder = async () => {
    const date = new Date().getTime();
    await dispatch(saveOrder(selectedItemselector, date));
  };
  return (
    <IonPage className="home-page-container">
      <IonHeader className="home-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonButtons slot="start">
            <IonMenuButton autoHide={false}></IonMenuButton>
          </IonButtons>
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
            <IonButton color="medium" onClick={() => handleSaveOrder()}>
              Save Order
            </IonButton>
          </div>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Tab2;
