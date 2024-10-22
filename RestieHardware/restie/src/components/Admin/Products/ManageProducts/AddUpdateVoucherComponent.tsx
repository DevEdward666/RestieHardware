import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonText,
  IonToast,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import { saveOutline } from "ionicons/icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { usePhotoGallery } from "../../../../Hooks/usePhotoGallery";
import { PostNewVoucherModel } from "../../../../Models/Request/Admin/AdminRequestModel";
import { SearchInventoryModel } from "../../../../Models/Request/searchInventory";
import { VouchersModel } from "../../../../Models/Response/Admin/AdminModelResponse";
import {
  PostNewVoucher,
  searchVouchers,
} from "../../../../Service/Actions/Admin/AdminActions";
import { set_toast } from "../../../../Service/Actions/Commons/CommonsActions";
import { UpdateVoucher } from "../../../../Service/API/Admin/AdminApi";
import { RootStore, useTypedDispatch } from "../../../../Service/Store";
import "./AddUpdateVoucherComponent.css";

const AddUpdateVoucherComponent = () => {
  const admin_list_of_items =
    useSelector((store: RootStore) => store.AdminReducer.admin_list_of_items) ||
    [];
  const admin_list_of_voucher =
    useSelector(
      (store: RootStore) => store.AdminReducer.admin_list_of_voucher
    ) || [];
  const user_login_information = useSelector(
    (store: RootStore) => store.LoginReducer.user_login_information
  );
  const [isOpenToast, setIsOpenToast] = useState({
    toastMessage: "",
    isOpen: false,
  });
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
  const [voucherInfo, setVoucherInfo] = useState<PostNewVoucherModel>({
    voucher_seq: 0,
    vouchercode: "",
    name: "",
    description: "",
    type: "",
    discount: 0,
    voucher_for: "",
    createdby: "",
  });

  const handleInfoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setVoucherInfo((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    []
  );
  useEffect(() => {
    const searchVoucher = () => {
      dispatch(searchVouchers(fetchList));
    };
    searchVoucher();
  }, [dispatch, fetchList, openSearchModal]);
  const validateForm = () => {
    const errors = [];

    if (!voucherInfo.vouchercode) {
      errors.push("Please Enter Voucher Code");
    }
    if (!voucherInfo.name) {
      errors.push("Please enter Voucher name");
    }
    if (!voucherInfo.description) {
      errors.push("Please enter Voucher description");
    }
    if (voucherInfo.discount <= 0) {
      errors.push("Please enter correct discount");
    }
    if (!voucherInfo.voucher_for) {
      errors.push("Please enter your Voucher Voucher to be use for");
    }
    if (!voucherInfo.type) {
      errors.push("Please enter your Voucher Type");
    }

    if (errors.length > 0) {
      errors.forEach((error) => {
        setIsOpenToast({
          toastMessage: error,
          isOpen: true,
        });
      });
      return false;
    }

    return true;
  };
  const handleSaveVoucher = useCallback(
    async (update: boolean) => {
      const payload: PostNewVoucherModel = {
        voucher_seq: voucherInfo.voucher_seq,
        vouchercode: voucherInfo.vouchercode,
        name: voucherInfo.name,
        description: voucherInfo.description,
        type: voucherInfo.type,
        discount: voucherInfo.discount,
        voucher_for: voucherInfo.voucher_for,
        createdby: user_login_information.name,
      };
      if (!validateForm()) {
        return;
      } else {
        let res: any = "";
        let message: string = "";
        if (update) {
          payload.voucher_seq = voucherInfo.voucher_seq;
          res = await UpdateVoucher(payload);
          message = "Successfully Updated";
        } else {
          res = await PostNewVoucher(payload);
          message = "Successfully Added";
        }

        if (res.status === 200) {
          dispatch(
            set_toast({
              isOpen: true,
              message: message,
              position: "middle",
              color: "#125B8C",
            })
          );
          setVoucherInfo({
            voucher_seq: 0,
            vouchercode: "",
            name: "",
            description: "",
            type: "",
            discount: 0,
            voucher_for: "",
            createdby: "",
          });
        }
      }
    },
    [dispatch, voucherInfo, user_login_information]
  );
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
  const handleSelectedVoucher = (val: VouchersModel) => {
    setOpenSearchModal({ isOpen: false, modal: "" });
    setVoucherInfo({
      voucher_seq: val.voucher_seq,
      vouchercode: val.vouchercode,
      name: val.name,
      description: val.description,
      type: val.type,
      discount: val.discount,
      voucher_for: val.voucher_for,
      createdby: val.createdby,
    });
  };

  return (
    <IonContent>
      <IonSearchbar
        onClick={() => setOpenSearchModal({ isOpen: true, modal: "supplier" })}
        placeholder="Search voucher"
        autocapitalize={"words"}
      ></IonSearchbar>
      <IonModal
        isOpen={openSearchModal.isOpen}
        onDidDismiss={() => setOpenSearchModal({ isOpen: false, modal: "" })}
        initialBreakpoint={1}
        breakpoints={[0, 0.25, 0.5, 0.75, 1]}
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton
                onClick={() => setOpenSearchModal({ isOpen: false, modal: "" })}
              >
                Cancel
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {openSearchModal.modal === "supplier" ? (
            <>
              <IonSearchbar
                placeholder="Search Supplier"
                onIonInput={(e) => handleSearch(e)}
                autocapitalize={"words"}
                debounce={1500}
              ></IonSearchbar>
              <IonList>
                {admin_list_of_voucher.map((val, index) => (
                  <IonItem
                    onClick={() => handleSelectedVoucher(val)}
                    key={index}
                  >
                    {/* <IonAvatar slot="start">
                     <IonImg src="https://i.pravatar.cc/300?u=b" />
                   </IonAvatar> */}
                    <IonLabel>
                      <h2>{val.vouchercode}</h2>
                      <p>{val.description}</p>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </>
          ) : null}
        </IonContent>
      </IonModal>
      <div className="add-new-product-container">
        <IonInput
          labelPlacement="floating"
          label="Voucher Code"
          name="vouchercode"
          type="text"
          onIonInput={(e: any) => handleInfoChange(e)}
          class="product-input"
          value={voucherInfo.vouchercode}
        ></IonInput>
        <IonInput
          labelPlacement="floating"
          label="Voucher name"
          name="name"
          type="text"
          onIonInput={(e: any) => handleInfoChange(e)}
          class="product-input"
          value={voucherInfo.name}
        ></IonInput>
        <IonInput
          labelPlacement="floating"
          label="Voucher Description"
          name="description"
          type="text"
          onIonInput={(e: any) => handleInfoChange(e)}
          class="product-input"
          value={voucherInfo.description}
        ></IonInput>
        <IonInput
          labelPlacement="floating"
          label="Voucher Discount"
          name="discount"
          type="text"
          onIonInput={(e: any) => handleInfoChange(e)}
          class="product-input"
          value={voucherInfo.discount}
        ></IonInput>
        <IonItem className="info-item">
          <IonText className="info-text">Voucher Type: </IonText>
          <IonSelect
            name="type"
            onIonChange={(e: any) => handleInfoChange(e)}
            aria-label="Voucher Type"
            className="info-input"
            value={voucherInfo.type}
          >
            <IonSelectOption value="percentage">Percentage</IonSelectOption>
            <IonSelectOption value="pesos">Pesos</IonSelectOption>
          </IonSelect>
        </IonItem>
        <IonItem className="info-item">
          <IonText className="info-text">Voucher to be used for: </IonText>
          <IonSelect
            name="voucher_for"
            onIonChange={(e: any) => handleInfoChange(e)}
            aria-label="Voucher to be used for"
            className="info-input"
            value={voucherInfo.voucher_for}
          >
            <IonSelectOption className="select-option" value="all">
              All
            </IonSelectOption>
            <IonSelectOption className="select-option" value="single">
              Single Items
            </IonSelectOption>
          </IonSelect>
        </IonItem>
        {voucherInfo.voucher_seq > 0 ? (
          <IonButton
            color="medium"
            expand="block"
            onClick={() => handleSaveVoucher(true)}
          >
            <IonIcon slot="start" icon={saveOutline}></IonIcon>
            Update Voucher
          </IonButton>
        ) : (
          <IonButton
            color="medium"
            expand="block"
            onClick={() => handleSaveVoucher(false)}
          >
            <IonIcon slot="start" icon={saveOutline}></IonIcon>
            Add Voucher
          </IonButton>
        )}
      </div>
      <IonToast
        isOpen={isOpenToast?.isOpen}
        message={isOpenToast.toastMessage}
        duration={3000}
        onDidDismiss={() => setIsOpenToast({ toastMessage: "", isOpen: false })}
      ></IonToast>
    </IonContent>
  );
};

export default AddUpdateVoucherComponent;
