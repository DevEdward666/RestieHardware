import {
  IonAlert,
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
  IonPopover,
  IonRadio,
  IonRadioGroup,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  RadioGroupChangeEventDetail,
  useIonRouter,
} from "@ionic/react";
import { addCircle, closeCircle, cropSharp, saveOutline } from "ionicons/icons";
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
      name: "Single",
      type: "single",
    },
    {
      id: 2,
      name: "Multiple",
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

  const handleQuantityChange = (index: number) => (event: CustomEvent) => {
    const value = Number(event.detail.value);
    const newProducts = [...products];
    newProducts[index].addedqty = value;
    setProducts(newProducts);
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
      (product) => !product.code || product.addedqty <= 0 || product.price <= 0
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
      <IonList>
        <IonRadioGroup
          value={getdrType}
          onIonChange={(ev) => handleRadioChange(ev)}
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          {DRtype.map((val) => (
            <IonItem
              key={val.id}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 10px",
              }}
            >
              <IonRadio mode="ios" value={val.type} />
              <IonLabel>{val.name}</IonLabel>
            </IonItem>
          ))}
        </IonRadioGroup>
      </IonList>
      {getdrType === "single" ? (
        <div>
          {" "}
          <IonSearchbar
            onClick={() =>
              setOpenSearchModal({ isOpen: true, modal: "products" })
            }
            placeholder="Search Product"
            autocapitalize={"words"}
          ></IonSearchbar>
          <IonModal
            isOpen={openSearchModal.isOpen}
            onDidDismiss={() =>
              setOpenSearchModal({ isOpen: false, modal: "" })
            }
            initialBreakpoint={1}
            breakpoints={[0, 0.25, 0.5, 0.75, 1]}
          >
            <IonHeader>
              <IonToolbar>
                <IonButtons slot="start">
                  <IonButton
                    onClick={() =>
                      setOpenSearchModal({ isOpen: false, modal: "" })
                    }
                  >
                    Cancel
                  </IonButton>
                </IonButtons>
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
        </div>
      ) : (
        <div>
          <div>
            <IonInput
              required
              onClick={() => setShowModal({ isOpen: true, type: "supplier" })}
              labelPlacement="floating"
              label="Supplier"
              name="supplier"
              type="text"
              class="product-input"
              value={productInfo.supplierName}
            ></IonInput>
            <IonButton
              color="medium"
              expand="block"
              onClick={() => addNewProduct(false)}
            >
              Add New Product
            </IonButton>
            {loading ? (
              <div>Loading...</div>
            ) : products.length > 0 ? (
              products.map((product, index) => (
                <IonItem key={index}>
                  <IonIcon
                    className="product-add-icon"
                    onClick={() => {
                      setSelectedProductIndex(index);
                      setShowModal({ isOpen: true, type: "product" });
                    }}
                    icon={addCircle}
                  ></IonIcon>
                  <IonLabel className="product-name-selected">
                    {product.item || "No item selected"}
                  </IonLabel>
                  <IonInput
                    type="number"
                    class="product-input-qty"
                    value={product.addedqty || 1}
                    placeholder="Qty"
                    onIonChange={handleQuantityChange(index)}
                  />
                  <IonIcon
                    className="product-remove-icon"
                    icon={closeCircle}
                    onClick={() => removeProduct(index)}
                    color="danger"
                  >
                    Remove
                  </IonIcon>
                </IonItem>
              ))
            ) : (
              <span className="not-yet-span"> No item yet</span>
            )}

            <IonButton color="medium" expand="block" onClick={handleSubmit}>
              Submit Products
            </IonButton>

            <IonAlert
              isOpen={showAlert.isOpen}
              onDidDismiss={() => setShowAlert({ isOpen: false, message: "" })}
              header={"Alert"}
              message={showAlert.message}
              buttons={["OK"]}
            />

            <IonModal
              isOpen={showModal.isOpen}
              onDidDismiss={() =>
                setShowModal({ isOpen: false, type: "product" })
              }
            >
              <IonHeader>
                <IonToolbar>
                  <IonTitle>Select Item</IonTitle>

                  <IonIcon
                    slot="end"
                    color="medium"
                    size="large"
                    onClick={() => handleCloseListOfItemsModal()}
                    icon={closeCircle}
                  ></IonIcon>
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
                    ></IonSearchbar>
                    <IonList>
                      {admin_list_of_items.map((item, index) => (
                        <IonItem
                          key={index}
                          onClick={() =>
                            handleSelectProduct(item, selectedProductIndex!)
                          }
                        >
                          <IonLabel>{item.item}</IonLabel>
                        </IonItem>
                      ))}
                    </IonList>{" "}
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
                          onClick={() => handleSelectedSupplierMultiple(val)}
                          key={index}
                        >
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
        </div>
      )}
    </IonContent>
  );
};

export default ManageProductComponent;
