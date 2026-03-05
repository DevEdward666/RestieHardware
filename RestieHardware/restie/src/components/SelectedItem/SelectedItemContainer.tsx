import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonModal,
  IonTitle,
  IonToast,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import "./SelectedItemContainer.css";
import { useSelector } from "react-redux";
import { RootStore, useTypedDispatch } from "../../Service/Store";
import { useCallback, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import attachmentIcon from "../../assets/images/icons/attchment-icon.svg";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/keyboard";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/zoom";
import "@ionic/react/css/ionic-swiper.css";
import sample from "../../assets/images/Sample.png";
import stock from "../../assets/images/Image_not_available.png";

import {
  addCircle,
  removeCircle,
  arrowBack,
  personCircle,
  card,
} from "ionicons/icons";
import {
  addToCartAction,
  selectedItem,
} from "../../Service/Actions/Inventory/InventoryActions";
import { v4 as uuidv4 } from "uuid";
import {
  SelectedItemToCart,
  Addtocart,
  PostDeliveryImage,
  FileMetadata,
  PostMultipleImage,
} from "../../Models/Request/Inventory/InventoryModel";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import { usePhotoGallery } from "../../Hooks/usePhotoGallery";
import {
  productFilename,
  base64toFile,
} from "../Admin/Products/ManageProducts/ProductComponentsService";
import {
  GetMultipleimage,
  UploadDeliveryImages,
  UploadMultipleImages,
} from "../../Service/API/Inventory/InventoryApi";
const SelectedItemContainer: React.FC = () => {
  const [getcartid, setCartId] = useState<string>("");
  const [addedQty, setAddedQty] = useState<number>(1);
  const [isOpenToast, setIsOpenToast] = useState({
    toastMessage: "",
    isOpen: false,
    type: "",
  });
  const dispatch = useTypedDispatch();
  const getSelectedItem = useSelector(
    (store: RootStore) => store.InventoryReducer.selected_item
  );

  const SelectedItemselector = useSelector(
    (store: RootStore) => store.InventoryReducer.add_to_cart
  );
  const modal = useRef<HTMLIonModalElement>(null);
  const user_login_information = useSelector(
    (store: RootStore) => store.LoginReducer.user_login_information
  );
  const router = useIonRouter();
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedImage, setselectedImage] = useState("");
  const [isZoomed, setIsZoomed] = useState(false);
  const fileInput = useRef(null);
  const [getFile, setFile] = useState<File>();
  const { file, takePhoto } = usePhotoGallery();
  const [base64Image, setBase64Image] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imageData, setImageData] = useState<FileMetadata[]>([]);
  const handleDoubleClick = () => {
    setIsZoomed((prevState) => !prevState); // Toggle the zoom state
  };
  const fetchImages = async () => {
    if (!getSelectedItem?.code) return;
    try {
      const folderPath = `Resources/Images/${getSelectedItem.code}`;
      const response = await GetMultipleimage(folderPath);
      if (response.status === 200) {
        setImageData(response.result.images.$values);
      }
    } catch (error) {
      console.warn(error)
    }

  };
  useEffect(() => {
    fetchImages();
  }, [getSelectedItem]);
  const dismiss = () => {
    setOpenModal(false);
  };
  const Controls = () => {
    const { zoomIn, zoomOut, resetTransform } = useControls();

    return (
      <div className="tools">
        <IonButton color="medium" size="small" onClick={() => zoomIn()}>
          Zoom in +
        </IonButton>
        <IonButton color="medium" size="small" onClick={() => zoomOut()}>
          Zoom out -
        </IonButton>
        <IonButton color="medium" size="small" onClick={() => resetTransform()}>
          Reset x
        </IonButton>
      </div>
    );
  };
  const handleAddToCart = useCallback(async () => {
    let cartid = localStorage.getItem("cartid");

    if (!cartid) {
      // Generate a new cartid if it doesn't exist
      cartid = uuidv4();
      localStorage.setItem("cartid", cartid);
    }
    const qtyAdded = SelectedItemselector.filter(
      (e) => e.code === getSelectedItem.code
    );
    const alreadyInCart = qtyAdded[0]?.qty ?? 0;
    const availableStock = getSelectedItem.onhandqty ?? getSelectedItem.qty ?? 0;
    if (alreadyInCart + addedQty > availableStock) {
      setIsOpenToast({
        toastMessage: "Not Enough Stocks",
        isOpen: true,
        type: "warning",
      });
      return;
    }

    const addeditems = addItem(
      addedQty,
      getSelectedItem,
      SelectedItemselector,
      cartid
    );
    await dispatch(addToCartAction(addeditems));
    setIsOpenToast({
      toastMessage: "Added to cart",
      isOpen: true,
      type: "info",
    });
  }, [dispatch, SelectedItemselector, getSelectedItem, addedQty]);

  const addItem = (
    qtyChange: number,
    getSelectedItem: SelectedItemToCart,
    cartItems: Addtocart[] | undefined,
    cartId: string
  ) => {
    // Ensure cartItems is initialized as an array if it's not provided
    if (!Array.isArray(cartItems)) {
      cartItems = [];
    }

    // Find existing item index
    const existingItemIndex = cartItems.findIndex(
      (item) => item.code === getSelectedItem.code
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
        ...getSelectedItem,
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
  useEffect(() => {
    const InitializeDefault = async () => {
      const params = new URLSearchParams(location.search);
      const itemcode = params.get("itemcode");
      const res = await dispatch(selectedItem(itemcode ?? ""));
      if (res.qty > 0) {
        setAddedQty(1);
        setIsLoading(false);
      }
    };
    InitializeDefault();
  }, [dispatch]);
  useEffect(() => {
    const initalize = async () => {
      if (!isLoading) {
        if (addedQty !== undefined && addedQty! > getSelectedItem.qty!) {
          setIsOpenToast({
            toastMessage: "Not enough stocks",
            isOpen: true,
            type: "warning",
          });
          setAddedQty(getSelectedItem.qty!);
        }
      }
    };
    initalize();
  }, [addedQty, getSelectedItem, isLoading]);
  const handleOpenImage = (selected_image: string) => {
    setselectedImage(selected_image !== null ? selected_image : stock);
    setOpenModal(true);
  };
  const handleDismiss = () => {
    setOpenModal(false);
  };
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []); // Ensure files are not null
    if (selectedFiles.length === 0) return; // No files selected

    // Create a FormData object for the request
    const formData = new FormData();

    const filesPayload: PostMultipleImage = {
      FolderName: getSelectedItem.code, // Make sure getSelectedItem is defined
      FileName: "", // We'll set the FileName once we know the unique name for all files
      FormFile: [], // Array to hold all file objects
    };

    selectedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string; // This will be base64-encoded string
        setBase64Image(base64String); // Optionally update state with base64 string (for preview or other logic)

        // Generate a unique image GUID and filename for each file
        const imageGuid = uuidv4();
        const imageName = productFilename(imageGuid, "jpg");

        // Convert the base64 string back to a file (assuming base64toFile is a helper function)
        const fileImage = base64toFile(base64String, imageName, "image/jpg");

        // Add each file to the FormFile array for the payload
        filesPayload.FormFile.push(fileImage!); // Ensure fileImage is not null

        // Append the file to the FormData object with the correct field name
        formData.append("FormFiles", fileImage!); // Ensure "FormFiles" is used as the field name

        // We can set the FileName to the first image GUID (or combine GUIDs for all files if needed)
        if (index === 0) {
          filesPayload.FileName = imageGuid;
        }

        // If all files have been processed, upload them
        if (filesPayload.FormFile.length === selectedFiles.length) {
          // Use the UploadMultipleImages function with the correct payload
          const uploaded = await UploadMultipleImages(formData, filesPayload);
          if (uploaded.status === 201) {
            await fetchImages();
          }
        }
      };

      // Read each selected file as a data URL (base64 string)
      reader.readAsDataURL(file);
    });
  };

  const handleTakePhoto = async () => {
    await takePhoto();
  };
  const isSoldOut = (getSelectedItem?.qty ?? 0) <= 0;

  return (
    <IonContent className="si-content">
      <IonToast
        isOpen={isOpenToast?.isOpen}
        message={isOpenToast.toastMessage}
        position={isOpenToast?.type === "warning" ? "middle" : "top"}
        duration={3000}
        color={isOpenToast?.type === "warning" ? "danger" : "success"}
        className="warning-toast"
        onDidDismiss={() =>
          setIsOpenToast({ toastMessage: "", isOpen: false, type: "" })
        }
      />

      {/* Header */}
      <IonHeader className="si-header">
        <IonToolbar mode="md" color="tertiary">
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => router.goBack()}>
              <IonIcon slot="icon-only" icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle className="si-header-title">{getSelectedItem.item}</IonTitle>
        </IonToolbar>
      </IonHeader>

      {/* Image swiper */}
      <div className="si-swiper-wrap">
        <Swiper
          className="si-swiper"
          autoplay={true}
          keyboard={true}
          pagination={true}
          scrollbar={false}
          zoom={true}
        >
          {imageData.length > 0 ? (
            imageData.map((val, index) => (
              <SwiperSlide key={index}>
                <div className="si-slide">
                  <IonImg
                    className="si-img"
                    src={`data:${val.contentType};base64,${val.fileContents}`}
                    onClick={() =>
                      handleOpenImage(
                        `data:${val.contentType};base64,${val.fileContents}`
                      )
                    }
                  />
                </div>
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide>
              <div className="si-slide">
                <IonImg
                  className="si-img"
                  src={getSelectedItem.image ?? stock}
                  onClick={() => handleOpenImage(getSelectedItem.image ?? stock)}
                />
              </div>
            </SwiperSlide>
          )}
        </Swiper>

        {/* Admin upload button */}
        {user_login_information?.role.trim().toLowerCase() === "admin" && (
          <div className="si-upload-row">
            <input
              ref={fileInput}
              hidden
              type="file"
              accept="image/*"
              multiple
              onChange={onSelectFile}
            />
            <button
              className="si-upload-btn"
              onClick={() => (fileInput as any)?.current?.click()}
            >
              <IonIcon icon={attachmentIcon} className="si-upload-icon" />
              Add Product Images
            </button>
          </div>
        )}
      </div>

      {/* Product info card */}
      <div className="si-info-card">
        {/* Name */}
        <h2 className="si-product-name">{getSelectedItem.item}</h2>

        {/* Category & Brand chips */}
        <div className="si-meta-row">
          {getSelectedItem.brand && (
            <span className="si-meta-chip">{getSelectedItem.brand}</span>
          )}
          {getSelectedItem.category && (
            <span className="si-meta-chip">{getSelectedItem.category}</span>
          )}
        </div>

        <div className="si-divider" />

        {/* Price & stock row */}
        <div className="si-price-row">
          <div>
            <p className="si-price-label">Price</p>
            <p className="si-price">
              &#8369;
              {getSelectedItem?.price?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="si-stock-wrap">
            <span className={`si-stock-badge ${isSoldOut ? "si-stock-out" : "si-stock-ok"}`}>
              {isSoldOut ? "Out of Stock" : `${getSelectedItem?.qty} pcs left`}
            </span>
          </div>
        </div>

        <div className="si-divider" />

        {/* Quantity selector */}
        {!isSoldOut && (
          <div className="si-qty-row">
            <p className="si-qty-label">Quantity</p>
            <div className="si-qty-control">
              <button
                className="si-qty-btn"
                disabled={addedQty <= 1}
                onClick={() => handleQty(false)}
              >
                <IonIcon icon={removeCircle} />
              </button>
              <span className="si-qty-value">{addedQty}</span>
              <button
                className="si-qty-btn"
                disabled={addedQty >= (getSelectedItem.qty ?? 0)}
                onClick={() => handleQty(true)}
              >
                <IonIcon icon={addCircle} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky add-to-cart bar */}
      <div className="si-action-bar">
        <button
          className={`si-cart-btn ${isSoldOut ? "si-cart-btn-disabled" : ""}`}
          disabled={isSoldOut}
          onClick={() => handleAddToCart()}
        >
          <IonIcon icon={card} className="si-cart-icon" />
          {isSoldOut ? "Sold Out" : "Add to Cart"}
        </button>
      </div>

      {/* Zoom modal */}
      <IonModal
        id="example-modal"
        isOpen={openModal}
        onDidDismiss={handleDismiss}
      >
        <div className="modal-content">
          <TransformWrapper initialScale={1}>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <Controls />
                <div className="image-content">
                  <TransformComponent>
                    <img
                      src={selectedImage}
                      alt="item image"
                      className={`modal-image ${isZoomed ? "zoomed" : ""}`}
                    />
                  </TransformComponent>
                </div>
              </>
            )}
          </TransformWrapper>
        </div>
      </IonModal>
    </IonContent>
  );
};

export default SelectedItemContainer;
