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
const SelectedItemContainer: React.FC = () => {
  const [addedQty, setAddedQty] = useState<number>(1);
  const dispatch = useTypedDispatch();
  const selectedItem = useSelector(
    (store: RootStore) => store.InventoryReducer.selected_item
  );
  const router = useIonRouter();
  useEffect(() => {
    console.log(selectedItem);
  }, [selectedItem]);
  const handleQty = (isAdd: boolean) => {
    if (isAdd) {
      setAddedQty((prevQty) => prevQty + 1);
    } else {
      setAddedQty((prevQty) => (prevQty > 0 ? prevQty - 1 : 0));
    }
  };
  const handleAddToCart = useCallback(async () => {
    const res = await dispatch(
      addToCartAction({
        cartid: "95d85cf5-fc9a-4a0e-b54d-48aead385847",
        code: selectedItem.code,
        item: selectedItem.item,
        onhandqty: selectedItem.qty,
        qty: addedQty,
        price: selectedItem.price,
        createdAt: new Date().getTime(),
        status: "pending",
      })
    );
    if (res && res.status === 1) {
      alert("added to cart");
    }
  }, [dispatch]);
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

              <IonInput class="qty" type="number" value={addedQty}></IonInput>
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
            <IonText className="selected-item-name-brand">Brand: Omni</IonText>{" "}
            |
            <IonText className="selected-item-name-category">
              Category: Electrical
            </IonText>
          </div>
          <IonItem className="selected-item-break-line"></IonItem>
        </div>
      </div>
      <div className="button-container">
        <IonButton color={"light"} onClick={() => handleAddToCart()}>
          {" "}
          Add to Cart
        </IonButton>
      </div>
    </IonContent>
  );
};

export default SelectedItemContainer;
