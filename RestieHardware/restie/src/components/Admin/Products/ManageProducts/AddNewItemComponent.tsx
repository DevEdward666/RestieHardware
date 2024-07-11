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
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  PostInventoryModel,
  PostNewItemInventoryModel,
} from "../../../../Models/Request/Admin/AdminRequestModel";
import { InventoryModel } from "../../../../Models/Request/Inventory/InventoryModel";
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
import "./ManageProductComponent.css";
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
  return (
    <IonContent>
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
      <div className="manage-product-input-container">
        <IonInput
          labelPlacement="floating"
          label="Product code"
          name="code"
          type="text"
          onIonInput={(e: any) => handleInfoChange(e)}
          class="product-input"
          value={productInfo.code}
        ></IonInput>
        <IonInput
          labelPlacement="floating"
          label="Product Name"
          name="item"
          type="text"
          onIonInput={(e: any) => handleInfoChange(e)}
          class="product-input"
          value={productInfo.item}
        ></IonInput>
        <IonInput
          labelPlacement="floating"
          label="Category"
          name="category"
          type="text"
          onIonInput={(e: any) => handleInfoChange(e)}
          class="product-input"
          value={productInfo.category}
        ></IonInput>
        <IonInput
          labelPlacement="floating"
          label="Brand"
          name="brand"
          type="text"
          onIonInput={(e: any) => handleInfoChange(e)}
          class="product-input"
          value={productInfo.brand}
        ></IonInput>
        <IonInput
          required
          onClick={() =>
            setOpenSearchModal({ isOpen: true, modal: "supplier" })
          }
          labelPlacement="floating"
          label="Supplier"
          name="supplier"
          type="text"
          class="product-input"
          value={productInfo.supplierName}
        ></IonInput>
        <IonInput
          labelPlacement="floating"
          label="Quantity"
          name="onhandqty"
          type="number"
          onIonInput={(e: any) => handleInfoChange(e)}
          class="product-input"
          value={productInfo.onhandqty}
        ></IonInput>
        <IonInput
          labelPlacement="floating"
          label="Cost"
          name="cost"
          type="number"
          onIonInput={(e: any) => handleInfoChange(e)}
          class="product-input"
          value={productInfo.cost}
        ></IonInput>
        <IonInput
          labelPlacement="floating"
          label="Price"
          name="price"
          type="number"
          onIonInput={(e: any) => handleInfoChange(e)}
          class="product-input"
          value={productInfo.price}
        ></IonInput>
        <IonButton
          color="medium"
          expand="block"
          onClick={() => handleSaveProduct()}
        >
          <IonIcon slot="start" icon={saveOutline}></IonIcon>
          Add Product
        </IonButton>
      </div>
    </IonContent>
  );
};

export default AddNewItemComponent;
