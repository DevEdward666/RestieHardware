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
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import { saveOutline } from "ionicons/icons";
import React, { useCallback, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { usePhotoGallery } from "../../../../Hooks/usePhotoGallery";
import { PostNewSupplierModel } from "../../../../Models/Request/Admin/AdminRequestModel";
import { SearchInventoryModel } from "../../../../Models/Request/searchInventory";
import { SuppliersModel } from "../../../../Models/Response/Admin/AdminModelResponse";
import {
  PostNewSupplier,
  PostUpdateSupplier,
} from "../../../../Service/Actions/Admin/AdminActions";
import { set_toast } from "../../../../Service/Actions/Commons/CommonsActions";
import { RootStore, useTypedDispatch } from "../../../../Service/Store";
import "./AddNewItemComponent.css";

const AddNewSupplierComponent = () => {
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
  const [supplierInfo, setSupplierInfo] = useState<PostNewSupplierModel>({
    company: "",
    contactno: 0,
    address: "",
    createdat: 0,
  });

  const handleInfoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setSupplierInfo((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    []
  );
  const handleSaveSupplier = useCallback(
    async (update: boolean) => {
      const payload: PostNewSupplierModel = {
        company: supplierInfo.company,
        contactno: supplierInfo.contactno,
        address: supplierInfo.address,
        createdat: new Date().getTime(),
      };
      if (payload.company.length <= 0 || payload.address.length <= 0) {
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
        let res: any = "";
        let message: string = "";
        if (update) {
          payload.supplierid = supplierInfo.supplierid;
          res = await PostUpdateSupplier(payload);
          message = "Successfully Updated";
        } else {
          res = await PostNewSupplier(payload);
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
          setSupplierInfo({
            company: "",
            contactno: 0,
            address: "",
            createdat: 0,
          });
        }
      }
    },
    [dispatch, supplierInfo]
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
  const handleSelectedSupplier = (val: SuppliersModel) => {
    setOpenSearchModal({ isOpen: false, modal: "" });
    setSupplierInfo({
      supplierid: val.supplierid,
      company: val.company,
      contactno: parseInt(val.contactno),
      address: val.address,
      createdat: val.createdat,
    });
  };
  return (
    <IonContent>
      <IonSearchbar
        onClick={() => setOpenSearchModal({ isOpen: true, modal: "supplier" })}
        placeholder="Search supplier"
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
                {admin_list_of_supplier.map((val, index) => (
                  <IonItem
                    onClick={() => handleSelectedSupplier(val)}
                    key={index}
                  >
                    {/* <IonAvatar slot="start">
                   <IonImg src="https://i.pravatar.cc/300?u=b" />
                 </IonAvatar> */}
                    <IonLabel>
                      <h2>{val.company}</h2>
                      <p>{val.address}</p>
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
          label="Company Name"
          name="company"
          type="text"
          onIonInput={(e: any) => handleInfoChange(e)}
          class="product-input"
          value={supplierInfo.company}
        ></IonInput>
        <IonInput
          labelPlacement="floating"
          label="Contact No."
          name="contactno"
          type="number"
          onIonInput={(e: any) => handleInfoChange(e)}
          class="product-input"
          value={supplierInfo.contactno}
        ></IonInput>
        <IonInput
          labelPlacement="floating"
          label="Address"
          name="address"
          type="text"
          onIonInput={(e: any) => handleInfoChange(e)}
          class="product-input"
          value={supplierInfo.address}
        ></IonInput>

        {supplierInfo.supplierid?.length! > 0 ? (
          <IonButton
            color="medium"
            expand="block"
            onClick={() => handleSaveSupplier(true)}
          >
            <IonIcon slot="start" icon={saveOutline}></IonIcon>
            Update Supplier
          </IonButton>
        ) : (
          <IonButton
            color="medium"
            expand="block"
            onClick={() => handleSaveSupplier(false)}
          >
            <IonIcon slot="start" icon={saveOutline}></IonIcon>
            Add Supplier
          </IonButton>
        )}
      </div>
    </IonContent>
  );
};

export default AddNewSupplierComponent;
