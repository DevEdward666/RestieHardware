import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  useIonRouter,
} from "@ionic/react";
import { v4 as uuidv4 } from "uuid";
import "./ExploreContainer.css";
import stock from "../assets/images/stock.png";
import { useCallback, useEffect, useState } from "react";
import { RootStore, useTypedDispatch } from "../Service/Store";
import {
  addToCartAction,
  getInventory,
  searchInventoryList,
  selectedItem,
} from "../Service/Actions/Inventory/InventoryActions";
import {
  Addtocart,
  InventoryModel,
  SelectedItemToCart,
} from "../Models/Request/Inventory/InventoryModel";
import { addCircle, cart } from "ionicons/icons";
import { useSelector } from "react-redux";
import { SearchInventoryModel } from "../Models/Request/searchInventory";
interface ContainerProps {
  data: any;
  searchItem: SearchInventoryModel;
  category: string;
}

interface SelectedItem {
  code: string;
  item: string;
  price: number;
}

const ExploreContainer: React.FC<ContainerProps> = ({
  data,
  searchItem,
  category,
}) => {
  const dispatch = useTypedDispatch();
  const router = useIonRouter();
  const [getcartid, setCartId] = useState<string>("");
  const [items, setItems] = useState(data);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const selectedItemselector = useSelector(
    (store: RootStore) => store.InventoryReducer.add_to_cart
  );
  useEffect(() => {
    const checkCartId = () => {
      if (selectedItemselector.length <= 0) {
        localStorage.removeItem("cartid");
      }
    };
    checkCartId();
  }, [selectedItemselector]);
  const handleSelectedItem = useCallback((payload: SelectedItemToCart) => {
    payload.qty = 1;
    dispatch(selectedItem(payload));
    router.push("/selectedItem");
  }, []);
  const handleAddToCart = async (selectedItem: SelectedItemToCart) => {
    let cartid = localStorage.getItem("cartid");

    if (!cartid && selectedItemselector[0]?.cartid === undefined) {
      // Generate a new cartid if it doesn't exist
      cartid = uuidv4();
      localStorage.setItem("cartid", cartid);
    } else {
      cartid = selectedItemselector[0]?.cartid;
    }

    const addeditems = addItem(
      selectedItem,
      selectedItemselector || [],
      cartid
    );
    await dispatch(addToCartAction(addeditems));
  };
  const addItem = (
    selectedItem: SelectedItemToCart,
    cartItems: Addtocart[],
    cartId: string
  ) => {
    // Ensure cartItems is initialized as an array if it's not provided
    if (!Array.isArray(cartItems)) {
      cartItems = [];
    }

    let existingItemIndex = -1;
    let existingOrder = -1;
    if (cartItems.length > 0) {
      existingItemIndex = cartItems.findIndex(
        (item) => item.code === selectedItem.code
      );
      existingOrder = cartItems.findIndex((item) => {
        return item.orderid !== "" || item.orderid !== null;
      });
    }

    if (existingItemIndex !== -1) {
      // If item already exists, update its quantity
      const updatedCartItems = cartItems.map((item, index) => {
        if (index === existingItemIndex) {
          // Create a deep copy of the item before modifying it
          return {
            ...item,
            qty: item.qty + 1,
          };
        }
        return item;
      });
      return updatedCartItems;
    } else {
      // If item doesn't exist, add it to the cart
      const newItem: Addtocart = {
        cartid: cartId,
        code: selectedItem.code,
        item: selectedItem.item,
        onhandqty: selectedItem.onhandqty,
        orderid: "",
        qty: 1,
        price: selectedItem.price,
        createdAt: new Date().getTime(),
        status: "pending",
      };
      // if (existingOrder > -1) {
      //   newItem.orderid = String(cartItems[existingOrder]?.orderid);
      // }
      return [...cartItems, newItem];
    }
  };
  const CardList = (card: InventoryModel) => {
    const payload: SelectedItemToCart = {
      code: card.code,
      item: card.item,
      onhandqty: card.qty,
      price: card.price,
      category: card.category,
      brand: card.brand,
    };
    return (
      <IonCard className="inventory-card-main">
        <div className="inventory-card-add-item-img">
          <img alt={card?.item} src={stock} />
        </div>
        <div className="inventory-card-add-item-container">
          <IonCardContent
            onClick={() => handleSelectedItem(payload)}
            key={card.code}
            className="inventory-card-main-content"
          >
            <div className="inventory-card-content">
              <div className="inventory-card-title">{card?.item}</div>
              <div className="inventory-card-price">
                <span>&#8369;</span>
                {card?.price.toFixed(2)}
              </div>
            </div>
          </IonCardContent>
          <div className="inventory-card-addtocart">
            <IonButton color="medium" onClick={() => handleAddToCart(payload)}>
              Add to cart
              <IonIcon color="light" slot="icon-only" icon={cart}></IonIcon>
            </IonButton>
          </div>
        </div>
      </IonCard>
    );
  };

  const getMoreInventory = useCallback(async () => {
    let res = [];
    let isSearch = false;
    if (searchItem.searchTerm.length <= 0) {
      res = await dispatch(
        getInventory({
          page: page,
          offset: (page - 1) * limit,
          limit: limit,
          searchTerm: "",
        })
      );
    } else {
      res = await dispatch(
        searchInventoryList({
          page: page,
          offset: (page - 1) * limit,
          limit: limit,
          searchTerm: searchItem.searchTerm,
        })
      );
      isSearch = true;
    }

    return { response: res, isSearch: isSearch };
  }, [dispatch, searchItem, page, limit]);

  const loadMoreItems = async () => {
    const newItems = await getMoreInventory();
    setItems([...items, ...newItems.response]);
    setPage(page);
    setLimit((prev) => prev + 10);
  };

  useEffect(() => {
    const initializeItems = async () => {
      const newItems = await getMoreInventory();
      setItems(newItems.response);
    };
    initializeItems();
  }, [getMoreInventory]);
  useEffect(() => {
    const initializeItems = async () => {
      const newItems = await getMoreInventory();
      if (newItems.isSearch) {
        setItems(newItems.response);
      } else {
        setItems([...items, ...newItems.response]);
      }
    };
    initializeItems();
  }, [searchItem]);
  return (
    <>
      <div className="container">
        {items?.map((res: InventoryModel, index: number) => (
          <div key={index}>
            <CardList
              code={res.code}
              item={res.item}
              price={res.price}
              qty={res.qty}
              category={res.category}
              reorderqty={res.reorderqty}
              cost={res.cost}
              status={res.status}
              brand={res.brand}
              createdat={res.createdat}
              updatedAt={res.updatedAt}
            />
          </div>
        ))}
      </div>
      <IonButton expand="block" fill="clear" onClick={loadMoreItems}>
        Load More
      </IonButton>
    </>
  );
};

export default ExploreContainer;
