import {
  IonAlert,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonRadio,
  IonRadioGroup,
  IonSearchbar,
  IonText,
  IonTitle,
  IonToolbar,
  RadioGroupChangeEventDetail,
  useIonRouter,
} from "@ionic/react";
import { addCircleOutline, closeCircle, cubeOutline, saveOutline, storefrontOutline, trashOutline } from "ionicons/icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  PostDeliveryReceipt,
  PostInventoryModel,
  ProductInfo,
} from "../../../../Models/Request/Admin/AdminRequestModel";
import { InventoryModel } from "../../../../Models/Request/Inventory/InventoryModel";
import { SearchInventoryModel } from "../../../../Models/Request/searchInventory";
import { SuppliersModel } from "../../../../Models/Response/Admin/AdminModelResponse";
import {
  PostInventory,
  PostMultipleInventory,
  searchAdminInventoryList,
  searchSupplier,
} from "../../../../Service/Actions/Admin/AdminActions";
import { set_toast } from "../../../../Service/Actions/Commons/CommonsActions";
import { RootStore, useTypedDispatch } from "../../../../Service/Store";
import "./ManageProductComponent.css";
import { TypeOfDeliveryReceipt } from "../../../../Models/Response/Commons/Commons";
import { IonRadioGroupCustomEvent } from "@ionic/core";
interface Product {
  item: string;
  quantity: number;
}
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
  const DRtype: TypeOfDeliveryReceipt[] = [
    {
      id: 1,
      name: "Update",
      type: "single",
    },
    {
      id: 2,
      name: "Received",
      type: "multiple",
    },
  ];
  const modal = useRef<HTMLIonModalElement>(null);
  const dispatch = useTypedDispatch();
  const router = useIonRouter();
  const [getdrType, setdrType] = useState<string>("single");
  const [openSearchModal, setOpenSearchModal] = useState({
    isOpen: false,
    modal: "",
  });
  const [fetchList, setFetchList] = useState<SearchInventoryModel>({
    page: 1,
    offset: 0, // Assuming offset starts from 0
    limit: 2050,
    searchTerm: "",
  });
  const [loading, setLoading] = useState(true);
  const [getDeliveryReceiptInfo, setDeliveryReceiptInfo] =
    useState<PostDeliveryReceipt>();
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

  const itemExists = (itemCode: string) => {
    return admin_list_of_items.some((item) => item.code === itemCode);
  };
  const getItemInfo = (itemCode: string) => {
    const item = admin_list_of_items.find((item) => item.code === itemCode);
    return item || null;
  };
  const compareWith = (
    o1: TypeOfDeliveryReceipt,
    o2: TypeOfDeliveryReceipt
  ) => {
    return o1.id === o2.id;
  };
  const handleRadioChange = (
    e: IonRadioGroupCustomEvent<RadioGroupChangeEventDetail>
  ) => {
    let value = e.detail.value;
    setdrType(value);
  };
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [previousProducts, setPreviousProducts] = useState<ProductInfo[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAlert, setShowAlert] = useState({ isOpen: false, message: "" });
  const [selectedProductIndex, setSelectedProductIndex] = useState<
    number | null
  >(null);
  const [showModal, setShowModal] = useState({
    isOpen: false,
    type: "products",
  });

  const handleQuantityChange = (index: number, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    const newProducts = [...products];


    if (name === "qty") {
      let qtyValue = parseInt(value);
      if (qtyValue <= 0 || isNaN(qtyValue)) {
        newProducts[index].addedqty = 1;
        setShowAlert({
          isOpen: true,
          message:
            "Please ensure all products have valid code, quantity > 0, and price > 0.",
        });
        return;
      }
      newProducts[index].addedqty = qtyValue;
      setProducts(newProducts);
    }
    if (name === "cost") {
      let costValue = parseFloat(value);
      if (costValue <= 0 || isNaN(costValue)) {
        newProducts[index].cost = newProducts[index].cost;
        setShowAlert({
          isOpen: true,
          message:
            "Please ensure all products have valid code, quantity > 0, and price > 0.",
        });
        return;
      }
      newProducts[index].cost = costValue;
      setProducts(newProducts);
    }
    if (name === "price") {
      let priceValue = parseFloat(value);
      if (priceValue <= 0 || isNaN(priceValue)) {
        newProducts[index].price = newProducts[index].price;
        setShowAlert({
          isOpen: true,
          message:
            "Please ensure all products have valid code, quantity > 0, and price > 0.",
        });
        return;
      }
      newProducts[index].price = priceValue;
      setProducts(newProducts);
    }
  };

  const addNewProduct = (is_submit: boolean) => {
    if (is_submit) {
      setPreviousProducts(products);
      setProducts([
        {
          item: "",
          addedqty: 1,
          category: "",
          brand: "",
          code: "",
          onhandqty: 0,
          supplierid: "",
          supplierName: "",
          cost: 0,
          price: 0,
        },
      ]);
      return;
    }
    setPreviousProducts(products);
    setProducts((prev) => [
      ...prev,
      {
        item: "",
        addedqty: 1,
        category: "",
        brand: "",
        code: "",
        onhandqty: 0,
        supplierid: "",
        supplierName: "",
        cost: 0,
        price: 0,
      },
    ]);
    setSelectedProductIndex(products.length);
    setShowModal({ isOpen: true, type: "product" });
  };

  const removeProduct = (index: number) => {
    const newProducts = products.filter((_, i) => i !== index);
    setProducts(newProducts);

    const url = new URL(window.location.href);
    url.searchParams.delete("itemcode");
    window.history.replaceState({}, "", url.toString());
  };

  const handleSubmit = async () => {
    const noProduct = products.length <= 0;

    const invalidProduct = products.find(
      (product) =>
        !product.code ||
        product.addedqty <= 0 ||
        product.price <= 0 ||
        isNaN(product.addedqty) ||
        isNaN(product.price)
    );

    if (invalidProduct || noProduct) {
      setShowAlert({
        isOpen: true,
        message:
          "Please ensure all products have valid code, quantity > 0, and price > 0.",
      });
      return;
    } else if (productInfo.supplierid.length <= 0) {
      setShowAlert({
        isOpen: true,
        message: "Please Select a supplier",
      });
    } else {
      const res = await PostMultipleInventory({
        items: products,
        supplierId: productInfo.supplierid,
      });
      if (res.status === 200) {
        addNewProduct(true);
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
        setShowAlert({
          isOpen: true,
          message: "Successfully Submitted",
        });
      } else {
        setShowAlert({
          isOpen: true,
          message: res.message,
        });
      }
    }
  };

  const handleSelectProduct = (item: InventoryModel, index: number) => {
    const exists = products.some((product) => product.code === item.code);

    if (exists) {
      setShowAlert({ isOpen: true, message: "Item is already in the list." });
      return;
    }
    const newProducts = [...products];

    // Update the product properties with the selected item details
    newProducts[index] = {
      ...newProducts[index],
      item: item.item,
      addedqty: 1,
      onhandqty: item.qty,
      code: item.code,
      cost: parseInt(item.cost),
      price: item.price,
      brand: item.brand ?? "",
      category: item.category ?? "",
    };

    setProducts(newProducts);
    setShowModal({ isOpen: false, type: "product" });
  };
  const handleSelectedSupplierMultiple = (val: SuppliersModel) => {
    setShowModal({ isOpen: false, type: "" });
    setProductInfo((prev) => ({
      ...prev,
      supplierid: val.supplierid,
      supplierName: val.company,
    }));
  };
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const initialize = async () => {
      setLoading(true);

      if (query.size > 0) {
        setdrType("multiple");
        const itemCode = query.get("itemcode");
        const itemInfoList = await dispatch(
          searchAdminInventoryList(fetchList)
        );
        const itemInfo = itemInfoList.find(
          (item: InventoryModel) => item.code === itemCode
        );
        setProducts([
          {
            item: itemInfo?.item!,
            addedqty: 1,
            category: itemInfo?.category!,
            brand: itemInfo?.brand!,
            code: itemInfo?.code!,
            onhandqty: itemInfo?.qty!,
            supplierid: "",
            supplierName: "",
            cost: parseInt(itemInfo?.cost!),
            price: itemInfo?.price!,
          },
        ]);
        // }
      } else {
        setdrType("single");
      }
      setLoading(false);
    };

    initialize();
  }, [dispatch]);
  useEffect(() => {
    const searchInventory = () => {
      dispatch(searchAdminInventoryList(fetchList));
    };
    const searchSuppliers = () => {
      dispatch(searchSupplier(fetchList));
    };
    if (openSearchModal.modal === "products" || showModal.type === "product") {
      searchInventory();
    }
    if (showModal.type === "supplier") {
      searchSuppliers();
    }
  }, [dispatch, fetchList, openSearchModal, showModal]);
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
      let qty = parseInt(value);
      if (name === "addedqty" && qty <= 0) {
        setShowAlert({
          isOpen: true,
          message:
            "Please ensure all products have valid code, quantity > 0, and price > 0.",
        });
        return;
      }

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
      const res = await PostInventory(payload);
      if (res.status === 200) {
        dispatch(
          set_toast({
            isOpen: true,
            message: "Successfully updated",
            position: "middle",
            color: "#125B8C",
          })
        );
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
  const handleCloseListOfItemsModal = useCallback(() => {
    setShowModal({ isOpen: false, type: "product" });
    setProducts(previousProducts);
  }, [previousProducts]);
  return (
    <IonContent>
      {/* ── Mode Selector ─────────────────────────────── */}
      <div className="mp-mode-selector">
        <IonRadioGroup
          value={getdrType}
          onIonChange={(ev) => handleRadioChange(ev)}
          className="mp-radio-group"
        >
          {DRtype.map((val) => (
            <IonRadio
              key={val.id}
              mode="ios"
              value={val.type}
              className={`mp-radio-option ${getdrType === val.type ? "mp-radio-active" : ""}`}
            >
              {val.name}
            </IonRadio>
          ))}
        </IonRadioGroup>
      </div>

      {/* ══════════════════════════════════════════════════
          SINGLE / UPDATE MODE
      ══════════════════════════════════════════════════ */}
      {getdrType === "single" ? (
        <div className="mp-section">
          <IonSearchbar
            onClick={() => setOpenSearchModal({ isOpen: true, modal: "products" })}
            placeholder="Search Product"
            autocapitalize={"words"}
            className="mp-searchbar"
          />

          {/* Search modal (products + supplier) */}
          <IonModal
            isOpen={openSearchModal.isOpen}
            onDidDismiss={() => setOpenSearchModal({ isOpen: false, modal: "" })}
            initialBreakpoint={1}
            breakpoints={[0, 0.25, 0.5, 0.75, 1]}
          >
            <IonHeader>
              <IonToolbar>
                <IonButtons slot="start">
                  <IonButton onClick={() => setOpenSearchModal({ isOpen: false, modal: "" })}>
                    Cancel
                  </IonButton>
                </IonButtons>
                <IonTitle>
                  {openSearchModal.modal === "products" ? "Select Product" : "Select Supplier"}
                </IonTitle>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              {openSearchModal.modal === "products" ? (
                <>
                  <IonSearchbar
                    placeholder="Search Product"
                    onIonInput={(e) => handleSearch(e)}
                    autocapitalize={"words"}
                    debounce={500}
                  />
                  <IonList>
                    {admin_list_of_items.map((val, index) => (
                      <IonItem button onClick={() => handleSelectedProduct(val)} key={index} lines="full" className="mp-list-item">
                        <div slot="start" className="mp-list-icon-wrap">
                          <IonIcon icon={cubeOutline} className="mp-list-icon" />
                        </div>
                        <IonLabel>
                          <h2 className="mp-list-item-name">{val.item}</h2>
                          <p className="mp-list-item-meta">
                            {[val.category, val.brand].filter(Boolean).join(" · ")}
                          </p>
                          <p className="mp-list-item-sub">
                            <span className={`mp-stock-badge ${val.qty <= 0 ? "mp-stock-out" : val.qty <= val.reorderqty ? "mp-stock-low" : "mp-stock-ok"}`}>
                              {val.qty <= 0 ? "Out of stock" : `Stock: ${val.qty}`}
                            </span>
                            <span className="mp-list-price">₱{Number(val.price).toLocaleString()}</span>
                          </p>
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
                  />
                  <IonList>
                    {admin_list_of_supplier.map((val, index) => (
                      <IonItem button onClick={() => handleSelectedSupplier(val)} key={index} lines="inset">
                        <IonIcon icon={storefrontOutline} slot="start" color="medium" />
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

          {/* Product detail card */}
          {productInfo.code ? (
            <IonCard className="mp-detail-card">
              <IonCardContent>
                <div className="mp-field-grid">
                  <div className="mp-field-full">
                    <IonInput
                      labelPlacement="floating"
                      label="Product Name"
                      name="name"
                      type="text"
                      onIonInput={(e: any) => handleInfoChange(e)}
                      className="mp-input"
                      value={productInfo.item}
                    />
                  </div>
                  <IonInput
                    labelPlacement="floating"
                    label="Category"
                    name="category"
                    type="text"
                    onIonInput={(e: any) => handleInfoChange(e)}
                    className="mp-input"
                    value={productInfo.category}
                  />
                  <IonInput
                    labelPlacement="floating"
                    label="Brand"
                    name="brand"
                    type="text"
                    onIonInput={(e: any) => handleInfoChange(e)}
                    className="mp-input"
                    value={productInfo.brand}
                  />
                  <IonInput
                    required
                    onClick={() => setOpenSearchModal({ isOpen: true, modal: "supplier" })}
                    labelPlacement="floating"
                    label="Supplier"
                    name="supplier"
                    type="text"
                    className="mp-input mp-input-tap"
                    value={productInfo.supplierName}
                    placeholder="Tap to select"
                  />
                  <IonInput
                    readonly
                    labelPlacement="floating"
                    label="On-Hand Qty"
                    name="qty"
                    type="number"
                    className="mp-input"
                    value={productInfo.onhandqty}
                  />
                  <IonInput
                    labelPlacement="floating"
                    label="Add Quantity"
                    name="addedqty"
                    debounce={500}
                    type="number"
                    onIonInput={(e: any) => handleInfoChange(e)}
                    className="mp-input"
                    value={productInfo.addedqty}
                  />
                  <IonInput
                    labelPlacement="floating"
                    label="Cost (₱)"
                    name="cost"
                    type="number"
                    onIonInput={(e: any) => handleInfoChange(e)}
                    className="mp-input"
                    value={productInfo.cost}
                  />
                  <IonInput
                    labelPlacement="floating"
                    label="Price (₱)"
                    name="price"
                    type="number"
                    onIonInput={(e: any) => handleInfoChange(e)}
                    className="mp-input"
                    value={productInfo.price}
                  />
                </div>
                <IonButton
                  expand="block"
                  className="mp-save-btn"
                  onClick={() => handleSaveProduct()}
                >
                  <IonIcon slot="start" icon={saveOutline} />
                  Save Changes
                </IonButton>
              </IonCardContent>
            </IonCard>
          ) : (
            <div className="mp-empty-state">
              <IonIcon icon={cubeOutline} className="mp-empty-icon" />
              <IonText color="medium">
                <p>Search and select a product above to update it.</p>
              </IonText>
            </div>
          )}
        </div>

      ) : (
        /* ══════════════════════════════════════════════════
            MULTIPLE / RECEIVED MODE
        ══════════════════════════════════════════════════ */
        <div className="mp-section">

          {/* Supplier selector */}
          <IonCard className="mp-supplier-card">
            <IonCardContent>
              <IonItem
                button
                lines="none"
                onClick={() => setShowModal({ isOpen: true, type: "supplier" })}
                className="mp-supplier-item"
              >
                <IonIcon icon={storefrontOutline} slot="start" color="primary" />
                <IonLabel>
                  <p className="mp-supplier-hint">Supplier</p>
                  <h2 className={productInfo.supplierName ? "mp-supplier-name" : "mp-supplier-placeholder"}>
                    {productInfo.supplierName || "Tap to select supplier"}
                  </h2>
                </IonLabel>
              </IonItem>
            </IonCardContent>
          </IonCard>

          {/* Product list */}
          {loading ? (
            <div className="mp-empty-state">
              <IonText color="medium"><p>Loading...</p></IonText>
            </div>
          ) : products.length > 0 ? (
            <div className="mp-product-list">
              {products.map((product, index) => (
                <IonCard key={index} className="mp-product-card">
                  <IonCardContent>
                    {/* Card header row */}
                    <div className="mp-card-header">
                      <div
                        className="mp-product-name-row"
                        onClick={() => {
                          setSelectedProductIndex(index);
                          setShowModal({ isOpen: true, type: "product" });
                        }}
                      >
                        <IonIcon icon={cubeOutline} className="mp-product-icon" />
                        <div>
                          <p className="mp-product-label">Product</p>
                          <h3 className="mp-product-name">
                            {product.item || <span className="mp-tap-hint">Tap to select</span>}
                          </h3>
                        </div>
                      </div>
                      <IonIcon
                        icon={trashOutline}
                        className="mp-delete-icon"
                        onClick={() => removeProduct(index)}
                      />
                    </div>

                    {/* On-hand badge */}
                    {product.item ? (
                      <div className="mp-onhand-row">
                        <IonBadge color="light" className="mp-onhand-badge">
                          On-hand: {product.onhandqty}
                        </IonBadge>
                      </div>
                    ) : null}

                    {/* Numeric fields */}
                    <div className="mp-num-grid">
                      <div className="mp-num-field">
                        <label className="mp-num-label">Cost (₱)</label>
                        <IonInput
                          type="number"
                          name="cost"
                          className="mp-num-input"
                          value={product.cost || ""}
                          placeholder="0"
                          debounce={500}
                          onIonInput={(e: any) => handleQuantityChange(index, e)}
                        />
                      </div>
                      <div className="mp-num-field">
                        <label className="mp-num-label">Price (₱)</label>
                        <IonInput
                          type="number"
                          name="price"
                          className="mp-num-input"
                          value={product.price || ""}
                          placeholder="0"
                          debounce={500}
                          onIonInput={(e: any) => handleQuantityChange(index, e)}
                        />
                      </div>
                      <div className="mp-num-field">
                        <label className="mp-num-label">Qty</label>
                        <IonInput
                          type="number"
                          name="qty"
                          className="mp-num-input"
                          value={product.addedqty || 1}
                          placeholder="1"
                          debounce={500}
                          onIonInput={(e: any) => handleQuantityChange(index, e)}
                        />
                      </div>
                    </div>
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
          ) : (
            <div className="mp-empty-state">
              <IonIcon icon={cubeOutline} className="mp-empty-icon" />
              <IonText color="medium">
                <p>No items yet. Tap "Add Product" to begin.</p>
              </IonText>
            </div>
          )}

          {/* Action bar */}
          <div className="mp-action-bar">
            <IonButton
              expand="block"
              fill="outline"
              className="mp-add-btn"
              onClick={() => addNewProduct(false)}
            >
              <IonIcon slot="start" icon={addCircleOutline} />
              Add Product
            </IonButton>
            {products.length > 0 && (
              <IonButton
                expand="block"
                className="mp-submit-btn"
                onClick={handleSubmit}
              >
                <IonIcon slot="start" icon={saveOutline} />
                Submit {products.length} {products.length === 1 ? "Item" : "Items"}
              </IonButton>
            )}
          </div>

          <IonAlert
            isOpen={showAlert.isOpen}
            onDidDismiss={() => setShowAlert({ isOpen: false, message: "" })}
            header={"Notice"}
            message={showAlert.message}
            buttons={["OK"]}
          />

          {/* Product / Supplier picker modal */}
          <IonModal
            isOpen={showModal.isOpen}
            onDidDismiss={() => setShowModal({ isOpen: false, type: "product" })}
            initialBreakpoint={0.75}
            breakpoints={[0, 0.5, 0.75, 1]}
          >
            <IonHeader>
              <IonToolbar>
                <IonTitle>
                  {showModal.type === "product" ? "Select Product" : "Select Supplier"}
                </IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={() => handleCloseListOfItemsModal()}>
                    <IonIcon icon={closeCircle} />
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent>
              {showModal.type === "product" ? (
                <>
                  <IonSearchbar
                    placeholder="Search Product"
                    onIonInput={(e) => handleSearch(e)}
                    autocapitalize={"words"}
                    debounce={500}
                  />
                  <IonList>
                    {admin_list_of_items.map((item, index) => (
                      <IonItem
                        button
                        key={index}
                        onClick={() => handleSelectProduct(item, selectedProductIndex!)}
                        lines="full"
                        className="mp-list-item"
                      >
                        <div slot="start" className="mp-list-icon-wrap">
                          <IonIcon icon={cubeOutline} className="mp-list-icon" />
                        </div>
                        <IonLabel>
                          <h2 className="mp-list-item-name">{item.item}</h2>
                          <p className="mp-list-item-meta">
                            {[item.category, item.brand].filter(Boolean).join(" · ")}
                          </p>
                          <p className="mp-list-item-sub">
                            <span className={`mp-stock-badge ${item.qty <= 0 ? "mp-stock-out" : item.qty <= item.reorderqty ? "mp-stock-low" : "mp-stock-ok"}`}>
                              {item.qty <= 0 ? "Out of stock" : `Stock: ${item.qty}`}
                            </span>
                            <span className="mp-list-price">₱{Number(item.price).toLocaleString()}</span>
                          </p>
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
                  />
                  <IonList>
                    {admin_list_of_supplier.map((val, index) => (
                      <IonItem
                        button
                        onClick={() => handleSelectedSupplierMultiple(val)}
                        key={index}
                        lines="inset"
                      >
                        <IonIcon icon={storefrontOutline} slot="start" color="medium" />
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
        </div>
      )}
    </IonContent>
  );
};

export default ManageProductComponent;

