import {
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  useIonRouter,
} from "@ionic/react";
import { add, cart, close, cloudUpload } from "ionicons/icons";
import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import {
  Addtocart,
  InventoryModel,
  PostDeliveryImage,
  PutInventoryImage,
  SelectedItemToCart,
} from "../Models/Request/Inventory/InventoryModel";
import { SearchInventoryModel } from "../Models/Request/searchInventory";
import {
  addToCartAction,
  getInventory,
  searchInventoryList,
  selectedItem,
  set_category_and_brand,
} from "../Service/Actions/Inventory/InventoryActions";
import { RootStore, useTypedDispatch } from "../Service/Store";
import stock from "../assets/images/Image_not_available.png";

import "./ExploreContainer.css";
import {
  GetItemImage,
  UpdateInventoryImage,
  UploadDeliveryImages,
} from "../Service/API/Inventory/InventoryApi";
import { FileResponse } from "../Models/Response/Inventory/GetInventoryModel";
import {
  productFilename,
  base64toFile,
} from "./Admin/Products/ManageProducts/ProductComponentsService";
interface ContainerProps {
  data: any;
  searchItem: SearchInventoryModel;
}

interface SelectedItem {
  code: string;
  item: string;
  price: number;
}

const ExploreContainer: React.FC<ContainerProps> = ({ data, searchItem }) => {
  const dispatch = useTypedDispatch();
  const cardRef = useRef(null);
  const router = useIonRouter();
  const [isOpenToast, setIsOpenToast] = useState({
    toastMessage: "",
    isOpen: false,
    type: "",
  });
  const [items, setItems] = useState(data);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const selectedItemselector = useSelector(
    (store: RootStore) => store.InventoryReducer.add_to_cart
  );
  const get_category_and_brand = useSelector(
    (store: RootStore) => store.InventoryReducer.set_category_and_brand
  );
  const user_login_information = useSelector(
    (store: RootStore) => store.LoginReducer.user_login_information
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
  const handleAddToCart = async (
    selectedItem: SelectedItemToCart,
    event: MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation();
    let cartid = localStorage.getItem("cartid");

    if (!cartid && selectedItemselector[0]?.cartid === undefined) {
      // Generate a new cartid if it doesn't exist
      cartid = uuidv4();
      localStorage.setItem("cartid", cartid);
    } else {
      cartid = selectedItemselector[0]?.cartid;
    }
    const qtyAdded = selectedItemselector.filter(
      (e) => e.code === selectedItem.code
    );

    if (qtyAdded && qtyAdded[0]?.qty >= selectedItem.onhandqty!) {
      setIsOpenToast({
        toastMessage: "Not Enough Stocks",
        isOpen: true,
        type: "warning",
      });
      return;
    }

    const addeditems = addItem(
      selectedItem,
      selectedItemselector || [],
      cartid
    );
    await dispatch(addToCartAction(addeditems));
    setIsOpenToast({
      toastMessage: "Added to cart",
      isOpen: true,
      type: "warning",
    });
    scrollToElement(cardRef);
  };
  const handleAddQty = (
    selectedItem: SelectedItemToCart,
    event: MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    router.push(`/admin/manageproduct?itemcode=${selectedItem.code}`);
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
        image: selectedItem.image.length > 0 ? selectedItem.image : "",
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
  const CardList = ({ card }: { card: InventoryModel }) => {
    const [getItemImage, setImage] = useState<FileResponse>();
    const [canUpload, setCanUpload] = useState<boolean>(false);
    const fileInput = useRef<HTMLInputElement | null>(null);

    // Function to handle file selection and upload
    const onSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const imageName = productFilename(card.code, "jpg");
        const fileImage = base64toFile(base64String, imageName, "image/jpg");

        const imagePayload: PostDeliveryImage = {
          FileName: imageName,
          FolderName: "Inventory",
          FormFile: fileImage!,
        };

        const uploaded = await UploadDeliveryImages(imagePayload);
        if (uploaded.status === 201) {
          const updateInventoryImage: PutInventoryImage = {
            image: uploaded.result.imagePath,
            code: card.code,
          };
          await UpdateInventoryImage(updateInventoryImage);
        }
      };
      reader.readAsDataURL(selectedFile);
    };

    // Payload setup for selected item
    const payload: SelectedItemToCart = {
      code: card.code,
      item: card.item,
      onhandqty: card.qty,
      price: card.price,
      category: card.category,
      brand: card.brand,
      image:
        card.image.length > 0
          ? `data:${getItemImage?.contentType};base64,${getItemImage?.fileContents}`
          : stock,
    };

    // Effect to fetch the item image and set upload permission
    useEffect(() => {
      if (location.pathname === "/home/main" && card.image.length > 0) {
        GetItemImage({ imagePath: card.image }).then((res: any) => {
          setImage(res.result.image);
        });
      }
      setCanUpload(
        ["admin", "super admin"].includes(
          user_login_information?.role.trim().toLowerCase()
        )
      );
    }, [card.image, user_login_information]);

    // Click handler for the image
    const handleClickImage = useCallback(() => {
      if (canUpload) {
        fileInput.current?.click();
      } else {
        handleSelectedItem(payload);
      }
    }, [canUpload, payload]);

    return (
      <div className="inventory-card-main-div">
        <IonCard className="inventory-card-main">
          <div className="inventory-card-add-item-img">
            <input
              ref={fileInput}
              hidden
              type="file"
              accept="image/*"
              onChange={onSelectFile}
            />
            <img
              alt={card?.item}
              src={payload.image}
              onClick={handleClickImage}
            />
          </div>
          <div className="inventory-card-add-item-container">
            <IonCardContent
              onClick={() => handleSelectedItem(payload)}
              className="inventory-card-main-content"
            >
              <div className="inventory-card-content">
                <div className="inventory-card-title">{card?.item}</div>
                <div className="inventory-card-price">
                  <span>
                    &#8369;
                    {card?.price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <div className="inventory-qty">QTY: {card?.qty}</div>
                </div>
              </div>
            </IonCardContent>
          </div>
          <div className="inventory-card-button-container">
            <div className="inventory-card-addtocart">
              <IonButton
                fill="clear"
                className="inventory-card-addtocart-button"
                disabled={card?.qty <= 0}
                onClick={(event: any) => handleAddToCart(payload, event)}
              >
                <span className="addtocart-btn-text">
                  {card?.qty > 0 ? "Add to cart" : "Sold Out"}
                </span>
                <IonIcon
                  color="light"
                  slot="icon-only"
                  size="small"
                  icon={cart}
                />
              </IonButton>
            </div>
            <div className="inventory-card-addtocart-qty">
              <IonButton
                size="small"
                fill="clear"
                className="inventory-card-addtocart-button"
                onClick={(event: any) => handleAddQty(payload, event)}
              >
                <IonIcon
                  color="light"
                  slot="icon-only"
                  size="small"
                  icon={add}
                />
              </IonButton>
            </div>
          </div>
        </IonCard>
      </div>
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
          category:
            get_category_and_brand.category.length > 0
              ? get_category_and_brand.category
              : "",
          brand:
            get_category_and_brand.brand.length > 0
              ? get_category_and_brand.brand
              : "",
          filter:
            get_category_and_brand.filter.length > 0
              ? get_category_and_brand.filter
              : "",
        })
      );
    } else {
      res = await dispatch(
        searchInventoryList({
          page: page,
          offset: (page - 1) * limit,
          limit: limit,
          searchTerm: searchItem.searchTerm,
          category:
            get_category_and_brand.category.length > 0
              ? get_category_and_brand.category
              : "",
          brand:
            get_category_and_brand.brand.length > 0
              ? get_category_and_brand.brand
              : "",
          filter:
            get_category_and_brand.filter.length > 0
              ? get_category_and_brand.filter
              : "",
        })
      );
      isSearch = true;
    }

    return { response: res, isSearch: isSearch };
  }, [dispatch, searchItem, page, limit, get_category_and_brand]);

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
  const handleRemove = useCallback(
    (newCategory: string, newBrand: string) => {
      const { filter } = get_category_and_brand;
      dispatch(
        set_category_and_brand({
          category: newCategory,
          brand: newBrand,
          filter,
        })
      );
    },
    [dispatch, get_category_and_brand]
  );

  const handleRemoveCategory = useCallback(() => {
    handleRemove("", get_category_and_brand.brand);
  }, [get_category_and_brand.brand]);

  const handleRemoveBrand = useCallback(() => {
    handleRemove(get_category_and_brand.category, "");
  }, [get_category_and_brand.category]);
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    const newItems = await getMoreInventory();
    setItems(newItems.response);
    event.detail.complete();
  };
  const scrollToElement = (elementRef: any) => {
    if (elementRef && elementRef.current) {
      elementRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <IonContent>
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent refreshingText="Fetching data"></IonRefresherContent>
      </IonRefresher>
      {get_category_and_brand.category.length > 0 ? (
        <div>
          <IonChip>
            <IonLabel>Category: {get_category_and_brand.category}</IonLabel>
            <IonIcon
              icon={close}
              onClick={() => handleRemoveCategory()}
            ></IonIcon>
          </IonChip>
        </div>
      ) : null}
      {get_category_and_brand.brand.length > 0 ? (
        <div>
          <IonChip>
            <IonLabel>Brand: {get_category_and_brand.brand}</IonLabel>
            <IonIcon icon={close} onClick={() => handleRemoveBrand()}></IonIcon>
          </IonChip>
        </div>
      ) : null}
      <IonLoading
        isOpen={isOpenToast?.isOpen}
        message="Add to Cart"
        duration={100}
        spinner="circles"
        onDidDismiss={() =>
          setIsOpenToast((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
      />{" "}
      <IonList className="container" lines="none">
        {items?.map((res: InventoryModel, index: number) => (
          <IonItem className="Item-Card" key={index}>
            <CardList card={res} />
          </IonItem>
        ))}
      </IonList>
      <IonButton expand="block" fill="clear" onClick={loadMoreItems}>
        Load More
      </IonButton>
      {/* <IonToast
        isOpen={isOpenToast?.isOpen}
        message={isOpenToast.toastMessage}
        position={isOpenToast?.type === "warning" ? "middle" : "top"}
        duration={3000}
        color={"medium"}
        className="warning-toast"
        onDidDismiss={() =>
          setIsOpenToast({ toastMessage: "", isOpen: false, type: "" })
        }
      ></IonToast> */}
    </IonContent>
  );
};

export default ExploreContainer;
