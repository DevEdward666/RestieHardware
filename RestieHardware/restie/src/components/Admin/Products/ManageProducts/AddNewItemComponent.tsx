import {
  IonButtons,
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSearchbar,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import { chevronForwardOutline, saveOutline } from "ionicons/icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import attachmentDeleteIcon from "../../../../assets//images/icons/cross_screenshot_button.svg";

import {
  PostInventoryModel,
  PostNewItemInventoryModel,
} from "../../../../Models/Request/Admin/AdminRequestModel";
import {
  InventoryModel,
  PostDeliveryImage,
} from "../../../../Models/Request/Inventory/InventoryModel";
import { SearchInventoryModel } from "../../../../Models/Request/searchInventory";
import { SuppliersModel } from "../../../../Models/Response/Admin/AdminModelResponse";
import {
  PostInventory,
  PostNewItemInventory,
  searchAdminInventoryList,
  searchSupplier,
} from "../../../../Service/Actions/Admin/AdminActions";
import { set_toast } from "../../../../Service/Actions/Commons/CommonsActions";
import { RootStore, useTypedDispatch } from "../../../../Service/Store";
import "./AddNewItemComponent.css";
import attachmentIcon from "../../../../assets//images/icons/attchment-icon.svg";
import { usePhotoGallery } from "../../../../Hooks/usePhotoGallery";
import { UploadDeliveryImages } from "../../../../Service/API/Inventory/InventoryApi";
import { base64toFile, productFilename } from "./ProductComponentsService";
const AddNewItemComponent = () => {
  const admin_list_of_items =
    useSelector((store: RootStore) => store.AdminReducer.admin_list_of_items) ||
    [];
  const admin_list_of_supplier =
    useSelector(
      (store: RootStore) => store.AdminReducer.admin_list_of_supplier
    ) || [];
  const user_login_information = useSelector(
    (store: RootStore) => store.LoginReducer.user_login_information
  );
  const fileInput = useRef(null);
  const modal = useRef<HTMLIonModalElement>(null);
  const dispatch = useTypedDispatch();
  const router = useIonRouter();
  const [openSearchModal, setOpenSearchModal] = useState({
    isOpen: false,
    modal: "",
  });
  const [fetchList, setFetchList] = useState<SearchInventoryModel>({
    page: 1,
    offset: 0, // Assuming offset starts from 0
    limit: 50,
    searchTerm: "",
  });
  const [base64Image, setBase64Image] = useState("");
  const [getFile, setFile] = useState<File>();
  const { file, takePhoto } = usePhotoGallery();
  const [productInfo, setProductInfo] = useState<PostNewItemInventoryModel>({
    code: "",
    item: "",
    category: "",
    brand: "",
    onhandqty: 0,
    addedqty: 0,
    supplierid: "",
    supplierName: "",
    image: "",
    cost: 0,
    price: 0.0,
    createdat: 0,
    status: "Active",
    updatedAt: 0,
  });
  const initialize = () => {
    dispatch(
      searchSupplier({
        page: 1,
        offset: 0,
        limit: 50,
        searchTerm: "",
      })
    );
  };
  useEffect(() => {
    initialize();
  }, [dispatch]);
  useEffect(() => {
    const searchSuppliers = () => {
      dispatch(searchSupplier(fetchList));
    };
    if (openSearchModal.modal === "supplier") {
      searchSuppliers();
    }
  }, [dispatch, fetchList, openSearchModal]);
  const handleSearch = (ev: Event) => {
    let query = "";
    const target = ev.target as HTMLIonSearchbarElement;
    if (target) query = target.value!.toLowerCase();
    setFetchList({
      page: 1,
      offset: 1,
      limit: 50,
      searchTerm: query,
    });
  };
  const handleInfoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setProductInfo((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    []
  );

  const handleSelectedSupplier = (val: SuppliersModel) => {
    setOpenSearchModal({ isOpen: false, modal: "" });
    setProductInfo((prev) => ({
      ...prev,
      supplierid: val.supplierid,
      supplierName: val.company,
    }));
  };
  const handleSaveProduct = useCallback(async () => {
    const payload: PostNewItemInventoryModel = {
      item: productInfo.item,
      category: productInfo.category,
      brand: productInfo.brand,

      code: productInfo.code,
      onhandqty: productInfo.onhandqty,
      addedqty: productInfo.addedqty,
      supplierid: productInfo.supplierid,
      supplierName: productInfo.supplierName,
      image: productInfo.image,

      cost: productInfo.cost,
      price: productInfo.price,
      createdat: productInfo.createdat,
      status: productInfo.status,
      updatedAt: productInfo.updatedAt,
    };
    if (payload.addedqty > 0 && payload.supplierid.length <= 0) {
      dispatch(
        set_toast({
          isOpen: true,
          message: "Please Select Supplier",
          position: "middle",
          color: "#125B8C",
        })
      );
      return;
    }
    if (
      payload.addedqty < 0 ||
      payload.cost < 0 ||
      payload.price < 0 ||
      payload.item.length <= 0
    ) {
      dispatch(
        set_toast({
          isOpen: true,
          message: "Please fill out all neccessary field",
          position: "middle",
          color: "#125B8C",
        })
      );
      return;
    } else {
      const imageName = productFilename(payload.code, "png");
      const fileImage = base64toFile(base64Image, imageName, "image/png");
      const imagePayload: PostDeliveryImage = {
        FileName: imageName,
        FolderName: "Inventory",
        FormFile: fileImage!,
      };
      const uploaded = await UploadDeliveryImages(imagePayload);
      if (uploaded.status !== 201) {
        dispatch(
          set_toast({
            isOpen: true,
            message: "Image not uploaded",
            position: "top",
            color: "#125B8C",
          })
        );
      }
      const res = await PostNewItemInventory(payload);
      if (res.status === 200) {
        dispatch(
          set_toast({
            isOpen: true,
            message: "Successfully Added",
            position: "middle",
            color: "#125B8C",
          })
        );
        initialize();
        setProductInfo({
          code: "",
          item: "",
          category: "",
          brand: "",
          onhandqty: 0,
          addedqty: 0,
          supplierid: "",
          supplierName: "",
          image: "",

          cost: 0,
          price: 0.0,
          createdat: 0,
          status: "",
          updatedAt: 0,
        });
      }
    }
  }, [dispatch, productInfo]);
  const onSelectFile = (e: any) => {
    const selectedFiles = e.target.files;
    const newFiles = selectedFiles[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      if (typeof reader.result === "string") {
        setBase64Image(reader.result);
      }
    };
    reader.readAsDataURL(newFiles);

    setFile(newFiles);
  };
  const handleTakePhoto = async () => {
    await takePhoto();
  };
  const deleteAttachment = (e: File) => {
    setFile(undefined);
  };

  return (
    <IonContent className="ani-content">
      {/* ── Supplier picker modal ── */}
      <IonModal
        isOpen={openSearchModal.isOpen}
        onDidDismiss={() => setOpenSearchModal({ isOpen: false, modal: "" })}
        initialBreakpoint={1}
        breakpoints={[0, 0.25, 0.5, 0.75, 1]}
      >
        <IonHeader>
          <IonToolbar color="tertiary">
            <IonButtons slot="start">
              <IonButton onClick={() => setOpenSearchModal({ isOpen: false, modal: "" })}>Close</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonSearchbar
            placeholder="Search supplier"
            onIonInput={(e) => handleSearch(e)}
            autocapitalize="words"
            debounce={1500}
          />
          <IonList>
            {admin_list_of_supplier.map((val, index) => (
              <IonItem button onClick={() => handleSelectedSupplier(val)} key={index}>
                <IonLabel>
                  <h2>{val.company}</h2>
                  <p>{val.address}</p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </IonModal>

      <div className="ani-container">
        <div className="ani-inner">

          {/* ── Image card ── */}
          <div className="ani-image-card">
            <p className="ani-card-title">Product Image</p>
            {getFile ? (
              <div style={{ position: "relative" }}>
                <img
                  className="ani-image-preview"
                  src={URL.createObjectURL(getFile)}
                  alt="Product"
                />
                <button
                  onClick={() => deleteAttachment(getFile)}
                  style={{
                    position: "absolute", top: 8, right: 8,
                    background: "rgba(0,0,0,0.5)", color: "#fff",
                    border: "none", borderRadius: "50%", width: 28, height: 28,
                    cursor: "pointer", fontSize: 14
                  }}
                >✕</button>
              </div>
            ) : (
              <div className="ani-image-placeholder">
                <span className="ani-image-placeholder-text">
                  Select an image from your library or take a photo
                </span>
              </div>
            )}
            <div className="ani-image-buttons">
              <button className="ani-image-btn" onClick={handleTakePhoto}>
                <IonIcon icon={attachmentIcon} /> Camera
              </button>
              <button className="ani-image-btn" onClick={() => (fileInput as any)?.current?.click()}>
                <IonIcon icon={attachmentIcon} /> Attach Image
              </button>
            </div>
            <input ref={fileInput} hidden type="file" accept="image/*" onChange={(e) => onSelectFile(e)} />
          </div>

          {/* ── Product info card ── */}
          <div className="ani-card">
            <p className="ani-card-title">Product Info</p>
            <div className="ani-field">
              <span className="ani-label">Product Code</span>
              <IonInput className="ani-input" name="code" type="text" placeholder="e.g. PRD-001"
                onIonInput={(e: any) => handleInfoChange(e)} value={productInfo.code} />
            </div>
            <div className="ani-field">
              <span className="ani-label">Product Name</span>
              <IonInput className="ani-input" name="item" type="text" placeholder="Product name"
                onIonInput={(e: any) => handleInfoChange(e)} value={productInfo.item} />
            </div>
            <div className="ani-field">
              <span className="ani-label">Category</span>
              <IonInput className="ani-input" name="category" type="text" placeholder="e.g. Plumbing"
                onIonInput={(e: any) => handleInfoChange(e)} value={productInfo.category} />
            </div>
            <div className="ani-field">
              <span className="ani-label">Brand</span>
              <IonInput className="ani-input" name="brand" type="text" placeholder="e.g. Unipipe"
                onIonInput={(e: any) => handleInfoChange(e)} value={productInfo.brand} />
            </div>
            <div className="ani-field">
              <span className="ani-label">Supplier</span>
              <div
                className="ani-picker-row"
                onClick={() => setOpenSearchModal({ isOpen: true, modal: "supplier" })}
              >
                {productInfo.supplierName ? (
                  <span className="ani-picker-value">{productInfo.supplierName}</span>
                ) : (
                  <span className="ani-picker-placeholder">Tap to select supplier</span>
                )}
                <IonIcon icon={chevronForwardOutline} className="ani-picker-icon" />
              </div>
            </div>
          </div>

          {/* ── Stock & pricing card ── */}
          <div className="ani-card">
            <p className="ani-card-title">Stock & Pricing</p>
            <div className="ani-field">
              <span className="ani-label">On-Hand Qty</span>
              <IonInput className="ani-input" name="onhandqty" type="number" placeholder="0"
                onIonInput={(e: any) => handleInfoChange(e)} value={productInfo.onhandqty} />
            </div>
            <div className="ani-field">
              <span className="ani-label">Cost (₱)</span>
              <IonInput className="ani-input" name="cost" type="number" placeholder="0.00"
                onIonInput={(e: any) => handleInfoChange(e)} value={productInfo.cost} />
            </div>
            <div className="ani-field">
              <span className="ani-label">Price (₱)</span>
              <IonInput className="ani-input" name="price" type="number" placeholder="0.00"
                onIonInput={(e: any) => handleInfoChange(e)} value={productInfo.price} />
            </div>
          </div>

        </div>
      </div>

      {/* ── Sticky submit bar ── */}
      <div className="ani-action-bar">
        <button className="ani-submit-btn" onClick={handleSaveProduct}>
          <IonIcon icon={saveOutline} />
          Add Product
        </button>
      </div>
    </IonContent>
  );
};

export default AddNewItemComponent;
