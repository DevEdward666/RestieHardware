import {
  IonAvatar,
  IonButton,
  IonContent,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSearchbar,
  useIonRouter,
} from "@ionic/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { searchInventoryList } from "../../../../Service/Actions/Inventory/InventoryActions";
import { RootStore, useTypedDispatch } from "../../../../Service/Store";
import {
  PostInventory,
  searchAdminInventoryList,
  searchSupplier,
} from "../../../../Service/Actions/Admin/AdminActions";
import { useSelector } from "react-redux";
import { SearchInventoryModel } from "../../../../Models/Request/searchInventory";
import { mail, saveOutline } from "ionicons/icons";
import { PostInventoryModel } from "../../../../Models/Request/Admin/AdminRequestModel";
import "./ManageProductComponent.css";
import { InventoryModel } from "../../../../Models/Request/Inventory/InventoryModel";
import { IonicSelectableComponent } from "ionic-selectable";
import { SuppliersModel } from "../../../../Models/Response/Admin/AdminModelResponse";
import { set_toast } from "../../../../Service/Actions/Commons/CommonsActions";
const ManageProductComponent = () => {
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
  const [productInfo, setProductInfo] = useState<PostInventoryModel>({
    code: "",
    item: "",
    category: "",
    brand: "",
    onhandqty: 0,
    addedqty: 0,
    supplierid: "",
    supplierName: "",

    cost: 0,
    price: 0.0,
    createdat: 0,
    updatedAt: 0,
  });
  const initialize = () => {
    dispatch(
      searchAdminInventoryList({
        page: 1,
        offset: 0,
        limit: 50,
        searchTerm: "",
      })
    );
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
    const searchInventory = () => {
      dispatch(searchAdminInventoryList(fetchList));
    };
    const searchSuppliers = () => {
      dispatch(searchSupplier(fetchList));
    };
    if (openSearchModal.modal === "products") {
      searchInventory();
    } else {
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
  const handleSelectedProduct = (val: InventoryModel) => {
    setOpenSearchModal({ isOpen: false, modal: "" });
    setFetchList({
      page: 1,
      offset: 1,
      limit: 50,
      searchTerm: "",
    });
    setProductInfo({
      item: val.item,
      category: val.category,
      brand: val.brand!,
      code: val.code,
      onhandqty: val.qty,
      addedqty: 0,
      supplierid: "",
      supplierName: "",

      cost: parseInt(val.cost),
      price: val.price,
      createdat: val.createdat,
      updatedAt: new Date().getTime(),
    });
  };
  const handleSelectedSupplier = (val: SuppliersModel) => {
    setOpenSearchModal({ isOpen: false, modal: "" });
    setProductInfo((prev) => ({
      ...prev,
      supplierid: val.supplierid,
      supplierName: val.company,
    }));
  };
  const handleSaveProduct = useCallback(async () => {
    const payload: PostInventoryModel = {
      item: productInfo.item,
      category: productInfo.category,
      brand: productInfo.brand,

      code: productInfo.code,
      onhandqty: productInfo.onhandqty,
      addedqty: productInfo.addedqty,
      supplierid: productInfo.supplierid,
      supplierName: productInfo.supplierName,

      cost: productInfo.cost,
      price: productInfo.price,
      createdat: productInfo.createdat,
      updatedAt: productInfo.updatedAt,
    };
    if (payload.addedqty > 0 && payload.supplierid.length <= 0) {
      dispatch(set_toast({ isOpen: true, message: "Please Select Supplier" }));
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
        })
      );
      return;
    } else {
      const res = await PostInventory(payload);
      if (res.status === 200) {
        dispatch(set_toast({ isOpen: true, message: "Successfully updated" }));
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

          cost: 0,
          price: 0.0,
          createdat: 0,
          updatedAt: 0,
        });
      }
    }
  }, [dispatch, productInfo]);
  return (
    <IonContent>
      <IonSearchbar
        onClick={() => setOpenSearchModal({ isOpen: true, modal: "products" })}
        placeholder="Search Product"
        autocapitalize={"words"}
      ></IonSearchbar>
      <IonModal
        isOpen={openSearchModal.isOpen}
        onDidDismiss={() => setOpenSearchModal({ isOpen: false, modal: "" })}
        initialBreakpoint={1}
        breakpoints={[0, 0.25, 0.5, 0.75, 1]}
      >
        <IonContent className="ion-padding">
          {openSearchModal.modal === "products" ? (
            <>
              <IonSearchbar
                placeholder="Search Product"
                onIonInput={(e) => handleSearch(e)}
                autocapitalize={"words"}
                debounce={1500}
              ></IonSearchbar>
              <IonList>
                {admin_list_of_items.map((val, index) => (
                  <IonItem
                    onClick={() => handleSelectedProduct(val)}
                    key={index}
                  >
                    {/* <IonAvatar slot="start">
                  <IonImg src="https://i.pravatar.cc/300?u=b" />
                </IonAvatar> */}
                    <IonLabel>
                      <h2>{val.item}</h2>
                      <p>QTY {val.qty}</p>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </>
          ) : (
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
          )}
        </IonContent>
      </IonModal>
      <div className="manage-product-input-container">
        <IonInput
          labelPlacement="floating"
          label="Product Name"
          name="name"
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
          readonly
          labelPlacement="floating"
          label="Quantity"
          name="qty"
          type="number"
          onIonInput={(e: any) => handleInfoChange(e)}
          class="product-input"
          value={productInfo.onhandqty}
        ></IonInput>
        <IonInput
          labelPlacement="floating"
          label="Add Quantity"
          name="addedqty"
          type="number"
          onIonInput={(e: any) => handleInfoChange(e)}
          class="product-input"
          value={productInfo.addedqty}
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
          Update Product
        </IonButton>
      </div>
    </IonContent>
  );
};

export default ManageProductComponent;
