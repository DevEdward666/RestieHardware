import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonMenuButton,
  IonSearchbar,
  IonText,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import "./SelectedItemContainer.css";
import { useSelector } from "react-redux";
import { RootStore, useTypedDispatch } from "../../Service/Store";
import { useCallback, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/keyboard";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/zoom";
import "@ionic/react/css/ionic-swiper.css";
import sample from "../../assets/images/Sample.png";
import { addCircle, removeCircle, arrowBack } from "ionicons/icons";
import { addToCartAction } from "../../Service/Actions/Inventory/InventoryActions";
import { v4 as uuidv4 } from "uuid";
import {
  SelectedItemToCart,
  Addtocart,
} from "../../Models/Request/Inventory/InventoryModel";
const SelectedItemContainer: React.FC = () => {
  const [getcartid, setCartId] = useState<string>("");
  const [addedQty, setAddedQty] = useState<number>(1);
  const dispatch = useTypedDispatch();
  const selectedItem = useSelector(
    (store: RootStore) => store.InventoryReducer.selected_item
  );

  const selectedItemselector = useSelector(
    (store: RootStore) => store.InventoryReducer.add_to_cart
  );
  const router = useIonRouter();
  useEffect(() => {
    console.log(selectedItem);
    console.log("selectedItemselector", selectedItemselector);
  }, [selectedItem]);

  const handleAddToCart = useCallback(async () => {
    let cartid = localStorage.getItem("cartid");

    if (!cartid) {
      // Generate a new cartid if it doesn't exist
      cartid = uuidv4();
      localStorage.setItem("cartid", cartid);
    }

    const addeditems = addItem(
      addedQty,
      selectedItem,
      selectedItemselector,
      cartid
    );
    await dispatch(addToCartAction(addeditems));
  }, [dispatch, selectedItemselector, selectedItem, addedQty]);

  const addItem = (
    qtyChange: number,
    selectedItem: SelectedItemToCart,
    cartItems: Addtocart[] | undefined,
    cartId: string
  ) => {
    // Ensure cartItems is initialized as an array if it's not provided
    if (!Array.isArray(cartItems)) {
      cartItems = [];
    }

    // Find existing item index
    const existingItemIndex = cartItems.findIndex(
      (item) => item.code === selectedItem.code
    );
    const existingOrder = cartItems.findIndex(
      (item) => item.orderid !== "" || item.orderid !== undefined
    );
    if (existingItemIndex !== -1) {
      // If item already exists, update its quantity
      const updatedCartItems = cartItems.map((item, index) => {
        if (index === existingItemIndex) {
          return { ...item, qty: item.qty + qtyChange };
        }
        return item;
      });
      return updatedCartItems;
    } else {
      // If item doesn't exist, add it to the cart
      const newItem: Addtocart = {
        ...selectedItem,
        qty: qtyChange,
        cartid: cartId,
        createdAt: new Date().getTime(),
        status: "pending",
      };
      if (existingOrder > -1) {
        newItem.orderid = String(cartItems[existingOrder]?.orderid);
      }
      return [...cartItems, newItem];
    }
  };
  const handleQty = (isAdd: boolean) => {
    if (isAdd) {
      setAddedQty((prevQty) => prevQty + 1);
    } else {
      setAddedQty((prevQty) => (prevQty > 0 ? prevQty - 1 : 0));
    }
  };
  return (
    <IonContent className="selected-item-main-content">
      <IonHeader className="home-page-header">
        <IonToolbar mode={"md"} color="tertiary">
          <IonButtons slot="start" onClick={() => router.goBack()}>
            <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
          </IonButtons>
          <IonTitle>{selectedItem.item}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <div className="selected-item-container">
        <div className="swiper-container">
          <Swiper
            className="swiper-component"
            autoplay={true}
            keyboard={true}
            pagination={true}
            scrollbar={false}
            zoom={true}
          >
            <SwiperSlide>
              <IonImg src={sample}></IonImg>
            </SwiperSlide>
            <SwiperSlide>
              <IonImg src={sample}></IonImg>
            </SwiperSlide>
            <SwiperSlide>
              <IonImg src={sample}></IonImg>
            </SwiperSlide>
          </Swiper>
          <div className="selected-item-information-container">
            <div className="selected-item-price-qty-container">
              <IonText className="selected-item-current-price">
                <span>&#8369;</span>
                {selectedItem.price.toFixed(2)}
              </IonText>
              <IonText className="selected-item-current-qty">
                {selectedItem.qty} pcs left
              </IonText>
            </div>
            <div className="selected-item-added-qty-container">
              <IonButton fill="clear" onClick={() => handleQty(false)}>
                <IonIcon
                  color="danger"
                  slot="icon-only"
                  icon={removeCircle}
                ></IonIcon>
              </IonButton>

              <IonInput
                class="qty"
                type="number"
                disabled
                value={addedQty}
                onIonInput={(ev) => handleQty(true)}
              ></IonInput>
              <IonButton fill="clear" onClick={() => handleQty(true)}>
                <IonIcon
                  color="secondary"
                  slot="icon-only"
                  icon={addCircle}
                ></IonIcon>
              </IonButton>
            </div>
          </div>
        </div>
        <div className="selected-item-information-details-content">
          <IonText className="selected-item-name">{selectedItem.item}</IonText>
          <div className="selected-item-information-details-content-category-brand">
            <IonText className="selected-item-name-brand">
              Brand: {selectedItem.brand}
            </IonText>{" "}
            |
            <IonText className="selected-item-name-category">
              Category: {selectedItem.category}
            </IonText>
          </div>
          <IonItem className="selected-item-break-line"></IonItem>
        </div>
      </div>
      <div className="button-container">
        <IonButton color={"light"} onClick={() => handleAddToCart()}>
          Add to Cart
        </IonButton>
      </div>
    </IonContent>
  );
};

export default SelectedItemContainer;
