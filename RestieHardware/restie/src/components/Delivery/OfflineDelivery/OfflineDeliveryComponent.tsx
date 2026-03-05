import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonToast,
} from "@ionic/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePhotoGallery } from "../../../Hooks/usePhotoGallery";
import {
  PostDeliveryImage,
  PostDeliveryInfo,
  PostDeliveryInfoOffline,
  PostUpdateDeliveredOrder,
} from "../../../Models/Request/Inventory/InventoryModel";
import {
  UploadDeliveryImages,
  SavedDeliveryInfo,
  UpdateDelivered,
} from "../../../Service/API/Inventory/InventoryApi";
import { useTypedDispatch } from "../../../Service/Store";
import {
  createItem,
  deleteItem,
  getAllItems,
  queryItems,
} from "../../../Service/OfflineDatabase/Database";
import "./OfflineDeliveryComponent.css";
import {
  cameraOutline,
  cloudUploadOutline,
  attachOutline,
  trashOutline,
  saveOutline,
} from "ionicons/icons";
import { getOrderInfo } from "../../../Service/Actions/Inventory/InventoryActions";
import { Network } from "@capacitor/network";
import { base64toFile } from "../../Admin/Products/ManageProducts/ProductComponentsService";
const OfflineDeliveryComponent = () => {
  const fileInput = useRef(null);
  const [getFile, setFile] = useState<File>();
  const [refresh, setRefresh] = useState<boolean>(false);
  const [isOpenToast, setIsOpenToast] = useState({
    toastMessage: "",
    isOpen: false,
    type: "",
  });
  const [base64Image, setBase64Image] = useState("");
  const [displayDeliveryInfo, setDisplayDeliveryInfo] =
    useState<PostDeliveryInfoOffline[]>();
  const [DeliveryInfo, setDeliveryInfo] = useState({
    name: "",
    orderid: "",
  });
  const dispatch = useTypedDispatch();
  const { file, takePhoto } = usePhotoGallery();
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

  const deleteAttachment = (e: File) => {
    var newFiles = e;
    setFile(newFiles);
  };
  const generateRandomImageName = (extension: string) => {
    const timestamp = new Date().getTime(); // Get current timestamp
    const randomString = Math.random().toString(36).substring(2, 8); // Generate a random string

    return `${timestamp}_${randomString}.${extension}`;
  };
  const handleTakePhoto = async () => {
    await takePhoto();
  };
  const handleSubmitEmail = useCallback(
    async (e: any) => {
      if (getFile !== undefined) {
        const deliveryPayload: PostDeliveryInfoOffline = {
          deliveredby: DeliveryInfo?.name,
          deliverydate: new Date().getTime(),
          imgData: base64Image,
          createdat: new Date().getTime(),
          createdby: DeliveryInfo?.name,
          orderid: DeliveryInfo.orderid,
        };
        const getExisting = await queryItems(
          "deliveryInfo",
          "orderid",
          DeliveryInfo.orderid
        );
        if (getExisting.length <= 0) {
          await createItem("deliveryInfo", deliveryPayload);
          setDeliveryInfo({
            orderid: "",
            name: "",
          });
          setFile(undefined);
          setIsOpenToast({
            toastMessage: "Added Delivery Info",
            isOpen: true,
            type: "warning",
          });

          setRefresh(true);
        } else {
          setIsOpenToast({
            toastMessage: "Order Id already Delivered",
            isOpen: true,
            type: "warning",
          });
        }

        //   const savedDelivery = await SavedDeliveryInfo(deliveryPayload);
        //   } else {
        //     dispatch(
        //       set_toast({
        //         message: uploaded.message,
        //         isOpen: true,
        //       })
        //     );
        //   }
      } else {
        setIsOpenToast({
          toastMessage: "Missing Required Fields",
          isOpen: true,
          type: "warning",
        });
      }
    },
    [getFile, DeliveryInfo, base64Image]
  );

  useEffect(() => {
    const initialize = async () => {
      const items = await getAllItems("deliveryInfo");

      setDisplayDeliveryInfo(items);
    };
    initialize();
  }, [refresh]);

  const handleSaveToCloud = async (val: PostDeliveryInfoOffline) => {
    try {
      const status = await Network.getStatus();
      const imageName = generateRandomImageName("png");
      const fileImage = base64toFile(val.imgData, imageName, "image/png");
      const payload: PostDeliveryImage = {
        FileName: imageName,
        FolderName: "Delivery",
        FormFile: fileImage!,
      };
      const uploaded = await UploadDeliveryImages(payload);
      if (uploaded.status === 201) {
        const deliveryPayload: PostDeliveryInfo = {
          deliveredby: val?.deliveredby,
          deliverydate: val.deliverydate,
          path: uploaded.result.imagePath,
          createdat: new Date().getTime(),
          createdby: val?.deliveredby,
          orderid: val.orderid,
        };
        const savedDelivery = await SavedDeliveryInfo(deliveryPayload);
        if (savedDelivery.status === 200) {
          const order = await dispatch(
            getOrderInfo({
              orderid: val.orderid,
            })
          );

          const updatedeliveryPayload: PostUpdateDeliveredOrder = {
            transid: order.order_info?.transid!,
            orderid: order.order_info?.orderid,
            cartid: order.order_info?.cartid,
            status: "Delivered",
            updateat: new Date().getTime(),
          };
          console.log(order.order_info);
          const updatedDelivery = await UpdateDelivered(updatedeliveryPayload);
          if (updatedDelivery.status === 200) {
            setFile(undefined);
            setIsOpenToast({
              toastMessage: uploaded.message,
              isOpen: true,
              type: "warning",
            });
            await deleteItem("deliveryInfo", val.orderid);
            setRefresh(true);
          }
        }
      } else {
        setIsOpenToast({
          toastMessage: uploaded.message,
          isOpen: true,
          type: "warning",
        });
      }
    } catch (error) {
      setIsOpenToast({
        toastMessage: "No Internet Connection",
        isOpen: true,
        type: "warning",
      });
    }
  };
  return (
    <IonContent className="od-content">
      <div className="od-scroll">
        <div className="od-inner">

          {/* ── Form ── */}
          <p className="od-section-label">Delivery Info</p>
          <div className="od-card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitEmail(e);
              }}
            >
              <div className="od-field">
                <span className="od-label">Order ID</span>
                <IonInput
                  className="od-input"
                  name="orderid"
                  type="text"
                  value={DeliveryInfo.orderid}
                  onIonInput={(e) =>
                    setDeliveryInfo((prev) => ({ ...prev, orderid: e.detail.value! }))
                  }
                  placeholder="Enter order ID"
                />
              </div>

              <div className="od-field" style={{ marginTop: 12 }}>
                <span className="od-label">Delivered By</span>
                <IonInput
                  className="od-input"
                  name="name"
                  type="text"
                  value={DeliveryInfo.name}
                  onIonInput={(e) =>
                    setDeliveryInfo((prev) => ({ ...prev, name: e.detail.value! }))
                  }
                  placeholder="Enter courier name"
                />
              </div>

              {/* Image preview */}
              {getFile !== undefined ? (
                <div className="od-image-preview" style={{ marginTop: 14 }}>
                  {getFile.type.startsWith("image/") && (
                    <img
                      className="od-image-thumb"
                      src={URL.createObjectURL(getFile)}
                      alt={getFile.name}
                    />
                  )}
                  <div className="od-image-meta">
                    <span className="od-image-name">{getFile.name}</span>
                    <span className="od-image-size">{getFile.size} bytes</span>
                  </div>
                  <button
                    type="button"
                    className="od-image-delete"
                    onClick={() => setFile(undefined)}
                  >
                    <IonIcon icon={trashOutline} />
                  </button>
                </div>
              ) : (
                <p className="od-image-placeholder" style={{ marginTop: 14 }}>
                  No image selected. Use Camera or Attach to add a delivery photo.
                </p>
              )}

              {/* Action buttons */}
              <div className="od-image-buttons" style={{ marginTop: 14 }}>
                <button type="button" className="od-image-btn" onClick={() => handleTakePhoto()}>
                  <IonIcon icon={cameraOutline} />
                  Camera
                </button>
                <button
                  type="button"
                  className="od-image-btn"
                  onClick={() => {
                    // @ts-ignore
                    fileInput?.current?.click();
                  }}
                >
                  <IonIcon icon={attachOutline} />
                  Attach
                </button>
              </div>

              <input
                ref={fileInput}
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => onSelectFile(e)}
              />

              <IonButton className="od-submit-btn" type="submit" style={{ marginTop: 16 }}>
                <IonIcon slot="start" icon={saveOutline} />
                Save Delivery
              </IonButton>
            </form>
          </div>

          {/* ── Sync section ── */}
          <p className="od-section-label">Pending Sync</p>
          {displayDeliveryInfo && displayDeliveryInfo.length > 0 ? (
            displayDeliveryInfo.map((val) => (
              <div key={val.orderid} className="od-sync-card od-sync-gap">
                <div className="od-sync-info">
                  <span className="od-sync-order">Order # {val.orderid}</span>
                  <span className="od-sync-meta">By: {val.deliveredby}</span>
                  <span className="od-sync-meta">
                    Date: {new Date(val.deliverydate).toLocaleDateString()}
                  </span>
                </div>
                <IonButton
                  className="od-cloud-btn"
                  fill="clear"
                  onClick={() => handleSaveToCloud(val)}
                >
                  <IonIcon icon={cloudUploadOutline} />
                </IonButton>
              </div>
            ))
          ) : (
            <p className="od-empty">No pending deliveries to sync.</p>
          )}

        </div>
      </div>

      <IonToast
        isOpen={isOpenToast?.isOpen}
        message={isOpenToast.toastMessage}
        position="middle"
        color="medium"
        duration={3000}
        onDidDismiss={() => setIsOpenToast({ toastMessage: "", isOpen: false, type: "" })}
      />
    </IonContent>
  );
};

export default OfflineDeliveryComponent;
