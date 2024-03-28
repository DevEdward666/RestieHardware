import {
  IonButton,
  IonContent,
  IonIcon,
  IonText,
  useIonRouter,
} from "@ionic/react";
import { useCallback, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  PostDeliveryImage,
  PostDeliveryInfo,
  PostUpdateDeliveredOrder,
} from "../../../Models/Request/Inventory/InventoryModel";
import {
  SavedDeliveryInfo,
  UpdateDelivered,
  UploadDeliveryImages,
} from "../../../Service/API/Inventory/InventoryApi";
import { set_toast } from "../../../Service/Actions/Commons/CommonsActions";
import { RootStore, useTypedDispatch } from "../../../Service/Store";
import attachmentIcon from "../../../assets//images/icons/attchment-icon.svg";
import attachmentDeleteIcon from "../../../assets//images/icons/cross_screenshot_button.svg";
import "./DeliveryInfoComponent.css";
const DeliveryInfoComponent = () => {
  const user_login_information = useSelector(
    (store: RootStore) => store.LoginReducer.user_login_information
  );
  const order_list_info = useSelector(
    (store: RootStore) => store.InventoryReducer.order_list_info
  );
  const get_delivery_info = useSelector(
    (store: RootStore) => store.InventoryReducer.get_delivery_info
  );

  const fileInput = useRef(null);
  const [getFile, setFile] = useState<File>();
  const router = useIonRouter();
  const dispatch = useTypedDispatch();
  const onSelectFile = (e: any) => {
    const selectedFiles = e.target.files;
    const newFiles = selectedFiles[0];

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
  const handleSubmitEmail = useCallback(async () => {
    if (getFile !== undefined) {
      const imageName = generateRandomImageName(getFile?.type.split("/")[1]);

      const payload: PostDeliveryImage = {
        FileName: imageName,
        FolderName: "Delivery",
        FormFile: getFile,
      };
      const uploaded = await UploadDeliveryImages(payload);
      if (uploaded.status === 201) {
        const deliveryPayload: PostDeliveryInfo = {
          deliveredby: user_login_information.name,
          deliverydate: new Date().getTime(),
          path: uploaded.result.imagePath,
          createdat: new Date().getTime(),
          createdby: user_login_information.name,
          orderid: order_list_info[0].orderid,
        };
        const savedDelivery = await SavedDeliveryInfo(deliveryPayload);
        if (savedDelivery.status === 200) {
          const updatedeliveryPayload: PostUpdateDeliveredOrder = {
            orderid: order_list_info[0].orderid,
            cartid: order_list_info[0].cartid,
            status: "Delivered",
            updateat: new Date().getTime(),
          };
          const updatedDelivery = await UpdateDelivered(updatedeliveryPayload);
          if (updatedDelivery.status === 200) {
            setFile(undefined);
            dispatch(
              set_toast({
                message: uploaded.message,
                isOpen: true,
              })
            );
            router.push("/home/profile");
          }
        }
      } else {
        dispatch(
          set_toast({
            message: uploaded.message,
            isOpen: true,
          })
        );
      }

      //   sendEmail(emailContent.message, emailContent.email, getFile)
      //     .then(async (value) => {
      //       if (value?.res.status === 200) {
      //         const info = await Device.getId();
      //         createItem("user_event_table", {
      //           id: randomUUID(),
      //           user_id: get_user_profile.id.toString(),
      //           event_type: "NOTIFICATION",
      //           eventTitle: "NOSA Concerns",
      //           eventDescription: `Your ticket no. is ${value.data}`,
      //           event_device_id: info.identifier,
      //           event_timestamp: new Date().toISOString(),
      //           lastSynced: -1,
      //         });
      //         router.push("/support/message-sent");
      //       } else if (value?.res.statusText === undefined) {
      //         dispatch(
      //           set_toast({
      //             message: "Invalid Email",
      //             isOpen: true,
      //           })
      //         );
      //       } else {
      //         dispatch(
      //           set_toast({
      //             message: "Connection timed out",
      //             isOpen: true,
      //           })
      //         );
      //       }
      //     })
      //     .catch((err: any) => {
      //       if (err.message.includes(undefined)) {
      //         dispatch(
      //           set_toast({ message: translate("INVALID_EMAIL"), isOpen: true })
      //         );
      //       } else {
      //         dispatch(
      //           set_toast({
      //             message: translate("CONNECTION_TIMED_OUT"),
      //             isOpen: true,
      //           })
      //         );
      //       }
      //     });
    } else {
      dispatch(
        set_toast({
          message: "Missing Required Fields",
          isOpen: true,
        })
      );
    }
  }, [getFile, user_login_information, order_list_info]);

  return (
    <IonContent>
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitEmail();
          }}
        >
          <div className="attchment-container">
            {getFile && (
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
                        <IonText className="file-name">{getFile!.name}</IonText>
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
            )}
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
              className="need-help-attachment-button"
              onClick={() => {
                // @ts-ignore
                fileInput?.current?.click();
                // setBackgroundOption(BackgroundOptionType.Gradient);
              }}
            >
              <IonIcon
                className="need-help-attachment-button-icon"
                icon={attachmentIcon}
              ></IonIcon>
              Attach Image
            </div>
          </>
          <IonButton className="need-help-send-button" type="submit">
            Upload
          </IonButton>
        </form>
      </div>
    </IonContent>
  );
};

export default DeliveryInfoComponent;
