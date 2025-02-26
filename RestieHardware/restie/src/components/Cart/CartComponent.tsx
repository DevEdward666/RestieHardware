import {
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonInput,
  IonItemSliding,
  IonList,
  IonItemOption,
  IonItemOptions,
  IonItem,
  IonFooter,
  IonTitle,
  IonToolbar,
  IonContent,
  IonToast,
  IonText,
  IonImg,
  getPlatforms,
  IonLabel,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { removeCircle, addCircle, card } from "ionicons/icons";
import { useSelector } from "react-redux";
import {
  SelectedItemToCart,
  Addtocart,
  GetVoucherType,
} from "../../Models/Request/Inventory/InventoryModel";
import {
  addToCartAction,
  get_all_voucher_actions,
  selectedItem,
} from "../../Service/Actions/Inventory/InventoryActions";
import { RootStore, useTypedDispatch } from "../../Service/Store";
import stock from "../../assets/images/Image_not_available.png";
import "./CartComponent.css";
import { useEffect, useState } from "react";
import emptyCart from "../../assets/images/icons/empty_cart.webp";
import { FileResponse } from "../../Models/Response/Inventory/GetInventoryModel";
import { GetItemImage } from "../../Service/API/Inventory/InventoryApi";
const CartComponent: React.FC = () => {
  const selectedItemselector =
    useSelector((store: RootStore) => store.InventoryReducer.add_to_cart) || [];
  const voucher_list =
    useSelector(
      (store: RootStore) => store.InventoryReducer.get_voucher_list
    ) || [];
  const dispatch = useTypedDispatch();
  const [getItem, setItem] = useState<SelectedItemToCart>();
  const [getOnhand, setOnhand] = useState<number>(0);
  const platform = getPlatforms();
  const [isOpenToast, setIsOpenToast] = useState({
    toastMessage: "",
    isOpen: false,
  });
  const updateItem = (
    selectedItem: SelectedItemToCart,
    cartItems: Addtocart[]
  ) => {
    const existingItemIndex = cartItems.findIndex(
      (item) => item.code === selectedItem.code
    );
    const updatedCartItems = cartItems.map((item, index) => {
      if (index === existingItemIndex) {
        return {
          ...item,
          discount: selectedItem.discount,
          voucher_code: selectedItem.voucher_code,
          voucher: selectedItem.voucher,
        };
      }
      return item;
    });
    return updatedCartItems;
  };
  const addItem = (
    qtyChange: number,
    selectedItem: SelectedItemToCart,
    cartItems: Addtocart[],
    cartId: string,
    qtyAdded?: number
  ) => {
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
          if (qtyAdded !== undefined) {
            return { ...item, qty: qtyAdded };
          } else {
            return { ...item, qty: item.qty + qtyChange };
          }
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
  const handleRemoveItem = async (
    codeToRemove: string,
    cartItems: Addtocart[]
  ) => {
    // Filter out the item with the provided code
    const updatedCartItems = cartItems.filter(
      (item) => item.code !== codeToRemove
    );
    await dispatch(addToCartAction(updatedCartItems));
  };
  const handleQty = async (
    selectedItem: SelectedItemToCart,
    isAdd?: boolean,
    qtyAdded?: number,
    onhand?: number,
    input?:boolean
  ) => {
    setOnhand(onhand!);
    let change = 0;
    if (qtyAdded !== undefined && qtyAdded! > onhand!) {
      setIsOpenToast({
        toastMessage: "Not enough stocks",
        isOpen: true,
      });
      qtyAdded = 1;
    }
    if ((qtyAdded !== undefined && qtyAdded <= 0) || isNaN(qtyAdded!) && input) {
      setIsOpenToast({
        toastMessage: "Must be atleast 1 qty",
        isOpen: true,
      });
      qtyAdded = 1;
    }
    change = isAdd ? (qtyAdded !== undefined ? qtyAdded : 1) : -1;
    let totalchange = change + selectedItem.qty!;
    if (totalchange > onhand!) {
      setIsOpenToast({
        toastMessage: "Not enough stocks",
        isOpen: true,
      });
      qtyAdded = 1;
    }
    if (totalchange <= 0) {
      setIsOpenToast({
        toastMessage: "Quantity too low",
        isOpen: true,
      });
      qtyAdded = 1;
    }
    const addeditems = addItem(
      change,
      selectedItem,
      selectedItemselector,
      selectedItemselector[0].cartid,
      qtyAdded
    );
    await dispatch(addToCartAction(addeditems));
  };
  useEffect(() => {
    const handleGetAllVoucehers = async () => {
      const payload: GetVoucherType = {
        voucher_for: "single",
      };
      await dispatch(get_all_voucher_actions(payload));
    };
    handleGetAllVoucehers();
  }, [dispatch]);
  const toPercentage = (value: number) => {
    return value + "%";
  };
  const toDecimal = (percentage: string) => {
    return parseFloat(percentage) / 100;
  };
  const handleSelectVoucher = async (
    e: CustomEvent<HTMLIonSelectElement>,
    selectedItem: SelectedItemToCart
  ) => {
    const { value } = e.detail;
    if (value) {
      const selectedVoucher = value;
      let totalDiscount = 0;
      if (JSON.parse(selectedVoucher).type === "percentage") {
        const discount = toPercentage(
          parseInt(JSON.parse(selectedVoucher).discount)
        );
        let discountDecimal = toDecimal(discount);
        totalDiscount = selectedItem.price * discountDecimal;
      } else {
        totalDiscount = JSON.parse(selectedVoucher).discount;
      }
      const updatedItem = {
        ...selectedItem,
        discount: totalDiscount,
        voucher_code: JSON.parse(selectedVoucher).vouchercode,
        voucher: selectedVoucher,
      };

      const updateItems = updateItem(updatedItem, selectedItemselector);

      await dispatch(addToCartAction(updateItems));
    }
  };
  const CardList = (card: Addtocart) => {
    console.log(card);
    return (
      <div>
        <IonItemSliding>
          <div className="main-cart-item-container">
            <IonItem className="main-cart-item-card">
              <IonCard
                className={`main-cart-card-container ${
                  platform.includes("mobileweb") && !platform.includes("tablet")
                    ? "cart-mobile"
                    : "cart-desktop"
                }`}
              >
                <div className="main-cart-card-add-item-img">
                  <img
                    alt={card.item}
                    src={card.image.length <= 0 ? stock : `${card?.image}`}
                  />
                </div>
                <div className="main-cart-card-add-item-container">
                  <IonCardContent className="main-cart-card-main-content">
                    <div className="main-cart-card-content">
                      <div className="main-cart-card-title">{card.item}</div>
                      <div className="main-cart-card-price">
                        <span>&#8369;</span>
                        {card.price.toFixed(2)}
                      </div>
                    </div>
                    <div className="main-cart-item-added-qty-container">
                      <IonButton
                        disabled={card.qty <= 1}
                        size="large"
                        fill="clear"
                        onClick={() =>
                          handleQty(card, false, undefined, card?.onhandqty,false)
                        }
                      >
                        <IonIcon
                          color="danger"
                          slot="icon-only"
                          icon={removeCircle}
                        />
                      </IonButton>

                      <IonInput
                        class="main-cart-qty"
                        type="number"
                        value={card.qty}
                        debounce={500}
                        onIonInput={(ev) =>
                          handleQty(
                            card,
                            true,
                            parseInt(ev.target.value?.toString()!),
                            card?.onhandqty,
                            true
                          )
                        }
                      ></IonInput>

                      <IonButton
                        disabled={card.qty >= card?.onhandqty!}
                        size="large"
                        fill="clear"
                        onClick={() =>
                          handleQty(card, true, undefined, card?.onhandqty,false)
                        }
                      >
                        <IonIcon
                          color="secondary"
                          slot="icon-only"
                          icon={addCircle}
                        />
                      </IonButton>
                    </div>
                    <div className="main-cart-card-qty">
                      {card?.onhandqty} pcs
                    </div>
                    <IonItem>
                      <IonLabel>Voucher</IonLabel>
                      <IonSelect
                        name="Voucher"
                        onIonChange={(e: any) => handleSelectVoucher(e, card)}
                        aria-label="Voucher"
                        className="info-input"
                        placeholder="Select Voucher"
                        value={card.voucher}
                      >
                        {voucher_list?.map((val, index) => (
                          <IonSelectOption
                            key={index}
                            value={JSON.stringify(val)}
                            className="voucher-description"
                          >
                            {val.vouchercode} - {val.description}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                  </IonCardContent>
                </div>
              </IonCard>
            </IonItem>
          </div>
          <IonItemOptions>
            <IonItemOption
              color="danger"
              onClick={() => handleRemoveItem(card.code, selectedItemselector)}
            >
              Delete
            </IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      </div>
    );
  };

  return (
    <>
      <IonContent>
        {Array.isArray(selectedItemselector) &&
        selectedItemselector.length > 0 ? (
          selectedItemselector?.map((card) => (
            <CardList
              key={card.code}
              cartid={card.cartid}
              code={card.code}
              item={card.item}
              qty={card.qty}
              price={card.price}
              createdAt={card.createdAt}
              status={card.status}
              image={card.image}
              onhandqty={card.onhandqty}
              voucher_code={card.voucher_code}
              discount={card.discount}
              voucher={card.voucher}
            />
          ))
        ) : (
          <div className="empty-cart-container">
            <IonImg className="empty-cart-img" src={emptyCart}></IonImg>
            <IonText className="empty-cart-text">No items in the cart.</IonText>
          </div>
        )}
        <IonToast
          isOpen={isOpenToast?.isOpen}
          message={isOpenToast.toastMessage}
          position="middle"
          color={"medium"}
          duration={3000}
          onDidDismiss={() =>
            setIsOpenToast({ toastMessage: "", isOpen: false })
          }
        ></IonToast>
      </IonContent>
    </>
  );
};

export default CartComponent;
