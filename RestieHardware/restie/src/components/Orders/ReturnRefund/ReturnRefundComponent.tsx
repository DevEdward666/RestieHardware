import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCheckbox,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonTextarea,
  IonToast,
  useIonRouter,
} from "@ionic/react";
import { removeCircle, addCircle } from "ionicons/icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  Addtocart,
  ItemReturns,
  SelectedItemToCart,
} from "../../../Models/Request/Inventory/InventoryModel";
import {
  addToCartAction,
  submit_return_refund,
  update_item_returns,
} from "../../../Service/Actions/Inventory/InventoryActions";
import stock from "../../../assets/images/Image_not_available.png";
import { RootStore, useTypedDispatch } from "../../../Service/Store";
import { useSelector } from "react-redux";
import "./ReturnRefundComponent.css";
import { PostReturnItems } from "../../../Service/API/Inventory/InventoryApi";
const ReturnRefundComponent: React.FC = () => {
  const get_item_returns = useSelector(
    (store: RootStore) => store.InventoryReducer.get_item_returns
  );
  const return_refund = useSelector(
    (store: RootStore) => store.InventoryReducer.submit_return_refund
  );
  const dispatch = useTypedDispatch();
  const router = useIonRouter();
  const [isOpenToast, setIsOpenToast] = useState({
    toastMessage: "",
    isOpen: false,
  });
  const [checkedItems, setCheckedItems] = useState<ItemReturns[]>([]);
  const [getRemarks, setRemarks] = useState({
    itemCode: "",
    text: "",
  });
  const CardList = (card: ItemReturns) => {
    return (
      <div key={card.code}>
        <IonItem className="main-return-item-card">
          <div className="main-return-item-card-div">
            <IonCard className="main-return-card-container">
              <div className="main-return-card-add-item-img">
                <img alt={card.item} src={stock} />
              </div>
              <div className="main-return-card-add-item-container">
                <IonCardContent className="main-return-card-main-content">
                  <div className="main-return-card-content">
                    <div className="main-return-card-title">{card.item}</div>
                    <div className="main-return-card-price">
                      <span>&#8369;</span>
                      {card.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="main-return-item-added-qty-container">
                    <IonButton
                      disabled={card.qty <= 1}
                      size="large"
                      fill="clear"
                      onClick={() =>
                        handleQty(card, false, undefined, card?.qty)
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
                      debounce={1500}
                      onIonInput={(ev) =>
                        handleQty(
                          card,
                          true,
                          parseInt(ev.target.value?.toString()!),
                          card?.qty
                        )
                      }
                    ></IonInput>

                    <IonButton
                      disabled={card.qty >= card?.qty!}
                      size="large"
                      fill="clear"
                      onClick={() =>
                        handleQty(card, true, undefined, card?.qty)
                      }
                    >
                      <IonIcon
                        color="secondary"
                        slot="icon-only"
                        icon={addCircle}
                      />
                    </IonButton>
                  </div>
                  <div className="main-return-card-qty">{card?.qty} pcs</div>
                </IonCardContent>
              </div>
            </IonCard>
          </div>
        </IonItem>
      </div>
    );
  };
  const addItem = (
    qtyChange: number,
    selectedItem: ItemReturns,
    cartItems: ItemReturns[],
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
      const newItem: ItemReturns = {
        ...selectedItem,
        qty: qtyChange,
        cartid: cartId,
        createdat: new Date().getTime(),
        status: selectedItem.status,
      };
      if (existingOrder > -1) {
        newItem.orderid = String(cartItems[existingOrder]?.orderid);
      }
      return [...cartItems, newItem];
    }
  };
  const addItemRemarks = (
    selectedItem: ItemReturns,
    cartItems: ItemReturns[],
    cartId: string,
    ItemRemarks: string
  ) => {
    // Find existing item index
    const existingItemIndex = cartItems.findIndex(
      (item) => item.code === selectedItem.code
    );
    const existingOrder = cartItems.findIndex(
      (item) => item.orderid !== "" || item.orderid !== undefined
    );
    console.log(existingItemIndex);
    if (existingItemIndex !== -1) {
      // If item already exists, update its quantity
      const updatedCartItems = cartItems.map((item, index) => {
        if (index === existingItemIndex) {
          if (ItemRemarks !== undefined) {
            return { ...item, remarks: ItemRemarks };
          } else {
            return { ...item, remarks: ItemRemarks };
          }
        }
        return item;
      });
      return updatedCartItems;
    } else {
      // If item doesn't exist, add it to the cart
      const newItem: ItemReturns = {
        ...selectedItem,
        cartid: cartId,
        createdat: new Date().getTime(),
        status: selectedItem.status,
        remarks: ItemRemarks,
      };
      if (existingOrder > -1) {
        newItem.orderid = String(cartItems[existingOrder]?.orderid);
      }
      return [...cartItems, newItem];
    }
  };
  const handleQty = async (
    selectedItem: ItemReturns,
    isAdd?: boolean,
    qtyAdded?: number,
    onhand?: number
  ) => {
    let change = 0;
    if (qtyAdded !== undefined && qtyAdded! > onhand!) {
      setIsOpenToast({
        toastMessage: "Not enough stocks",
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
      get_item_returns,
      get_item_returns[0].cartid,
      qtyAdded
    );
    await dispatch(update_item_returns(addeditems));
  };

  // Function to handle checkbox change
  const handleCheckBox = useCallback(
    async (code: string, isChecked: boolean, item: ItemReturns) => {
      if (isChecked) {
        // If checked, add the item's ID to the checkedItems array
        if (getRemarks.itemCode === item.code) {
          item.remarks = getRemarks.text;
        }
        setCheckedItems([...checkedItems, item]);
      } else {
        // If unchecked, remove the item's ID from the checkedItems array
        setCheckedItems(
          checkedItems.filter((checkedItem) => checkedItem.code !== code)
        );
      }
      const addeditemsRemarks = addItemRemarks(
        item,
        get_item_returns,
        get_item_returns[0].cartid,
        getRemarks?.text
      );
      await dispatch(update_item_returns(addeditemsRemarks));
    },
    [dispatch, getRemarks, checkedItems]
  );
  useEffect(() => {
    const initialize = () => {
      console.log(checkedItems);
    };
    initialize();
  }, [checkedItems]);
  // const handleReturnRefund = useCallback(async () => {

  // }, [checkedItems]);
  const getOrderIDFromURL = () => {
    const url = new URL(window.location.href);
    return url.searchParams.get("orderid");
  };
  useEffect(() => {
    const submitRefund = async () => {
      const orderId = getOrderIDFromURL();
      if (!return_refund.submit) {
        return;
      }
      if (checkedItems.length > 0 && return_refund.submit) {
        await PostReturnItems(checkedItems);
        dispatch(submit_return_refund({ submit: false }));
        router.push(`/orderInfo?orderid=${orderId}`);
      } else {
        setIsOpenToast({
          isOpen: true,
          toastMessage: "Please check items you want to refund",
        });
      }
    };
    submitRefund();
  }, [dispatch, return_refund, checkedItems]);
  const handleInfoChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    items: ItemReturns
  ) => {
    const { value } = e.target;
    setRemarks({
      itemCode: items.code,
      text: value,
    });
  };

  return (
    <IonContent>
      <div>
        {get_item_returns?.map((card, index) => (
          <div className="checkbox-container" key={index}>
            <IonCheckbox
              className="checkbox-content"
              labelPlacement="end"
              onIonChange={(e) => {
                handleCheckBox(card.code, e.detail.checked, card);
              }}
            ></IonCheckbox>
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

              <IonTextarea
                labelPlacement="floating"
                label="Remarks"
                name="remarks"
                onIonInput={(e: any) => handleInfoChange(e, card)}
                className="remarks-input"
              ></IonTextarea>
            </div>
          </div>
        ))}
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

export default ReturnRefundComponent;
