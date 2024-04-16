import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonIcon,
  IonInput,
  IonText,
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
import { set_toast } from "../../../Service/Actions/Commons/CommonsActions";
import { useTypedDispatch } from "../../../Service/Store";
import attachmentDeleteIcon from "../../../assets//images/icons/cross_screenshot_button.svg";
import attachmentIcon from "../../../assets//images/icons/attchment-icon.svg";
import {
  createItem,
  deleteItem,
  getAllItems,
  queryItems,
} from "../../../Service/OfflineDatabase/Database";
import "./OfflineDeliveryComponent.css";
import { cloud, cloudUpload, save, sync } from "ionicons/icons";
import { getOrderInfo } from "../../../Service/Actions/Inventory/InventoryActions";
import { Network } from "@capacitor/network";
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
  const base64toFile = (
    base64String: string,
    filename: string,
    mimeType: string
  ) => {
    try {
      // Remove data URI prefix if present
      const base64Data = base64String.replace(/^data:\w+\/\w+;base64,/, "");

      // Decode base64 string to binary data
      const binaryString = atob(base64Data);

      // Create ArrayBuffer directly from binary string
      const arrayBuffer = new ArrayBuffer(binaryString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }

      // Create Blob directly from ArrayBuffer
      const blob = new Blob([uint8Array], {
        type: mimeType,
      });

      // Create File object from Blob
      return new File([blob], filename, { type: mimeType });
    } catch (error) {
      console.error("Error converting base64 to File:", error);
      // Handle the error by returning null or throwing it
      throw error;
    }
  };

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
    <IonContent>
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitEmail(e);
          }}
        >
          <div className="attchment-container">
            <IonInput
              labelPlacement="floating"
              label="Order ID"
              name="name"
              type="text"
              class="product-input"
              value={DeliveryInfo.orderid}
              onIonInput={(e) =>
                setDeliveryInfo((prev) => ({
                  ...prev,
                  orderid: e.detail.value!,
                }))
              }
            ></IonInput>
            <IonInput
              labelPlacement="floating"
              label="Delivered By"
              name="name"
              type="text"
              class="product-input"
              value={DeliveryInfo.name}
              onIonInput={(e) =>
                setDeliveryInfo((prev) => ({
                  ...prev,
                  name: e.detail.value!,
                }))
              }
            ></IonInput>
            {getFile !== undefined ? (
              getFile && (
                <div className="selected-files-list">
                  <div className="selected-file">
                    <div className="file-thumbnail">
                      {/* You can render a thumbnail of the file here */}
                      {getFile &&
                        getFile.type &&
                        getFile.type.startsWith("image/") && (
                          <img
                            className="support-image"
                            src={URL.createObjectURL(getFile)}
                            alt={`Thumbnail ${getFile.name}`}
                          />
                        )}
                    </div>
                    {getFile &&
                      getFile.name !== undefined &&
                      getFile.size !== undefined && (
                        <div className="file-details">
                          <IonText className="file-name">
                            {getFile!.name}
                          </IonText>
                          <IonText className="file-size">
                            {getFile!.size} bytes
                          </IonText>
                        </div>
                      )}
                    {getFile && (
                      <div
                        className="file-delete"
                        onClick={() => deleteAttachment(getFile!)}
                      >
                        <IonIcon
                          className="file-delete-icon"
                          icon={attachmentDeleteIcon}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : (
              <IonText className="file-info-text">
                To select image choose attach image. If you want to capture
                image choose open camera
              </IonText>
            )}
          </div>
          <div className="capture-images-buttons">
            <div
              className="offline-delivery-attachment-button"
              onClick={() => handleTakePhoto()}
            >
              <IonIcon
                className="offline-delivery-attachment-button-icon"
                icon={attachmentIcon}
              ></IonIcon>
              Open Camera
            </div>
            <>
              <input
                ref={fileInput}
                hidden
                type="file"
                accept="image/*"
                onChange={(e) => onSelectFile(e)}
              />

              <div
                className="offline-delivery-attachment-button"
                onClick={() => {
                  // @ts-ignore
                  fileInput?.current?.click();
                  // setBackgroundOption(BackgroundOptionType.Gradient);
                }}
              >
                <IonIcon
                  className="offline-delivery-attachment-button-icon"
                  icon={attachmentIcon}
                ></IonIcon>
                Attach Image
              </div>
            </>
          </div>
          <IonButton className="offline-delivery-send-button" type="submit">
            Save
          </IonButton>
        </form>
      </div>
      <div className="offline-delivery-text-sync-container">
        <IonText className="offline-delivery-text-sync">
          Sync to Cloud delivery details
        </IonText>
        {displayDeliveryInfo?.map((val) => (
          <IonCard key={val.orderid}>
            <IonCardContent className="offline-delivery-main-card-content">
              <div className="offline-delivery-card-content">
                <div className="offline-delivery-card-container">
                  <IonText>Order ID: {val.orderid}</IonText>
                  <IonText>Delivered By: {val.deliveredby}</IonText>
                  <IonText>Delivery Date: {val.deliverydate}</IonText>
                </div>
                <IonButton color="light" onClick={() => handleSaveToCloud(val)}>
                  <IonIcon src={cloudUpload}></IonIcon>
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        ))}
      </div>
      <IonToast
        isOpen={isOpenToast?.isOpen}
        message={isOpenToast.toastMessage}
        position="middle"
        color={"medium"}
        duration={3000}
        onDidDismiss={() =>
          setIsOpenToast({ toastMessage: "", isOpen: false, type: "" })
        }
      ></IonToast>
    </IonContent>
  );
};

export default OfflineDeliveryComponent;
