import {
  useIonRouter,
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonCheckbox,
  CheckboxChangeEventDetail,
  IonModal,
  IonLabel,
  IonList,
  IonSearchbar,
  IonButtons,
  IonHeader,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { chevronForwardOutline, personOutline } from "ionicons/icons";
import { RootStore, useTypedDispatch } from "../../../Service/Store";
import "./CustomerInformationComponents.css";
import {
  AddCustomerInformation,
  GetAllCustomers,
  GetOneCustomer,
} from "../../../Service/Actions/Customer/CustomerActions";
import { useCallback, useEffect, useState } from "react";
import {
  GetCustomerInformation,
  PostCustomer,
} from "../../../Models/Response/Customer/GetCustomerModel";
import { v4 as uuidv4 } from "uuid";
import { useSelector } from "react-redux";
import { GetCustomerInfo } from "../../../Service/API/Inventory/InventoryApi";
import { SearchInventoryModel } from "../../../Models/Request/searchInventory";
const CustomerInformationComponent: React.FC = () => {
  const router = useIonRouter();
  const getcustomers = useSelector(
    (store: RootStore) => store.CustomerReducer.customers
  );
  const get_customer = useSelector(
    (store: RootStore) => store.CustomerReducer.get_customer
  );
  const [isOpenToast, setIsOpenToast] = useState({
    toastMessage: "",
    isOpen: false,
  });
  const [customers, setCustomers] = useState(getcustomers);
  const [fetchList, setFetchList] = useState<SearchInventoryModel>({
    page: 1,
    offset: 0, // Assuming offset starts from 0
    limit: 50,
    searchTerm: "",
  });
  const [openSearchModal, setOpenSearchModal] = useState({
    isOpen: false,
    modal: "",
  });
  const [isNewCustomer, setNewCustomer] = useState<boolean>(false);
  const [customerInformation, setCustomerInformation] =
    useState<GetCustomerInformation>({
      customerid: "",
      name: "",
      address: "",
      contactno: "0",
      ordertype: "",
      customer_email: "",
      newUser: true,
    });
  const dispatch = useTypedDispatch();
  useEffect(() => {
    const initialize = () => {
      setCustomerInformation({
        name: "",
        address: "",
        contactno: "0",
        ordertype: "",
        customer_email: "",
        newUser: true,
      });
      dispatch(GetAllCustomers());
    };
    initialize();
  }, [dispatch]);
  const handleSaveCustomerInfo = useCallback(() => {
    if (!validateForm()) return;

    dispatch(AddCustomerInformation(customerInformation));
    setCustomerInformation({
      name: "",
      address: "",
      contactno: "0",
      ordertype: "",
      customer_email: "",
      newUser: true,
    });
    router.push("/paymentoptions");
  }, [customerInformation]);

  const validateForm = () => {
    const errors = [];

    if (
      !customerInformation.ordertype ||
      customerInformation.ordertype === "none"
    ) {
      errors.push("Please Select Order Type");
    }
    if (!customerInformation.name) {
      errors.push("Please enter your name");
    }
    if (!customerInformation.address) {
      errors.push("Please enter your address");
    }
    // if (customerInformation.contactno === 0) {
    //   errors.push("Please enter your contact no");
    // }

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
  const handleSelectedUser = useCallback(
    async (value: string) => {
      const payload: PostCustomer = {
        customerid: value.toString(),
      };
      await dispatch(GetOneCustomer(payload));
      setCustomerInformation((prevState) => ({
        ...prevState,
        customerid: value,
      }));
      setOpenSearchModal({ isOpen: false, modal: "" });
    },
    [dispatch]
  );
  const handleInfoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      if (isNewCustomer) {
        setCustomerInformation((prevState) => ({
          ...prevState,
          [name]: name === "contact" ? parseInt(value) : value,
          newUser: true,
          customerid: uuidv4(),
        }));
      } else {
        if (name === "ordertype") {
          setCustomerInformation((prevState) => ({
            ...prevState,
            ordertype: value,
            newUser: false,
          }));
        }
      }
    },
    [isNewCustomer, get_customer]
  );
  useEffect(() => {
    const getCustomerInfo = () => {
      setCustomerInformation({
        customerid: get_customer.customerid,
        name: get_customer.name,
        address: get_customer.address,
        contactno: get_customer.contactno,
        ordertype: "deliver",
        customer_email: "",
        newUser: false,
      });
    };
    getCustomerInfo();
  }, [get_customer]);
  const handleNewCustomer = (event: CustomEvent<CheckboxChangeEventDetail>) => {
    const isChecked = event.detail.checked;
    setNewCustomer(isChecked);
    setCustomerInformation({
      customerid: "",
      name: "",
      address: "",
      contactno: "0",
      customer_email: "",
      ordertype: "",
    });
    // Handle checkbox change
  };
  const handleSearch = (event: CustomEvent) => {
    const query = event.detail.value.toLowerCase();
    const filteredCustomers = getcustomers.filter((customer) =>
      customer.name.toLowerCase().includes(query)
    );
    setCustomers(filteredCustomers);
  };
  useEffect(() => {
    const initialize = () => {
      setCustomers(getcustomers);
    };
    initialize();
  }, [getcustomers]);
  return (
    <IonContent className="cust-content">
      <div className="cust-pg-container">
        <div className="cust-inner">

          {/* Customer type toggle */}
          <div className="cust-card">
            <p className="cust-section-title">Customer</p>
            <IonCheckbox
              className="cust-checkbox"
              labelPlacement="start"
              checked={isNewCustomer}
              onIonChange={(e) => handleNewCustomer(e)}
            >
              New Customer
            </IonCheckbox>

            {/* Name — tap to search existing, or type for new */}
            <div className="cust-field">
              <span className="cust-label">Name</span>
              {!isNewCustomer ? (
                <div
                  className="cust-picker-row"
                  onClick={() => setOpenSearchModal({ isOpen: true, modal: "" })}
                >
                  {customerInformation.name ? (
                    <span className="cust-picker-value">{customerInformation.name}</span>
                  ) : (
                    <span className="cust-picker-placeholder">Search existing customer…</span>
                  )}
                  <IonIcon icon={personOutline} className="cust-picker-icon" />
                </div>
              ) : (
                <IonInput
                  name="name"
                  type="text"
                  onIonInput={(e: any) => handleInfoChange(e)}
                  className="cust-input"
                  placeholder="Enter customer name"
                  value={customerInformation.name}
                />
              )}
            </div>

            {/* Address */}
            <div className="cust-field">
              <span className="cust-label">Address</span>
              <IonInput
                disabled={!isNewCustomer}
                name="address"
                onIonInput={(e: any) => handleInfoChange(e)}
                className="cust-input"
                placeholder="Enter address"
                value={customerInformation.address}
              />
            </div>

            {/* Contact No */}
            <div className="cust-field">
              <span className="cust-label">Contact No</span>
              <IonInput
                disabled={!isNewCustomer}
                name="contactno"
                type="number"
                onIonInput={(e: any) => handleInfoChange(e)}
                className="cust-input"
                placeholder="Enter contact number"
                value={customerInformation.contactno}
              />
            </div>

            {/* Order Type */}
            <div className="cust-field">
              <span className="cust-label">Order Type</span>
              <IonSelect
                name="ordertype"
                onIonChange={(e: any) => handleInfoChange(e)}
                aria-label="Order Type"
                className="cust-select"
                value={customerInformation.ordertype || "none"}
                placeholder="Select order type"
              >
                <IonSelectOption value="none">Select</IonSelectOption>
                <IonSelectOption value="deliver">Deliver</IonSelectOption>
                <IonSelectOption value="pickup">Pick-up</IonSelectOption>
              </IonSelect>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky proceed bar */}
      <div className="cust-action-bar">
        <button className="cust-proceed-btn" onClick={() => handleSaveCustomerInfo()}>
          <IonIcon icon={chevronForwardOutline} />
          Proceed to Payment
        </button>
      </div>

      {/* Customer search modal */}
      <IonModal
        isOpen={openSearchModal.isOpen}
        onDidDismiss={() => setOpenSearchModal({ isOpen: false, modal: "" })}
        initialBreakpoint={0.75}
        breakpoints={[0, 0.5, 0.75, 1]}
      >
        <IonHeader>
          <IonToolbar color="tertiary">
            <IonTitle>Select Customer</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setOpenSearchModal({ isOpen: false, modal: "" })}>
                Close
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonSearchbar
            placeholder="Search customer…"
            onIonInput={(e) => handleSearch(e)}
            autocapitalize="words"
            debounce={500}
          />
          <IonList lines="full">
            {customers.map((val, index) => (
              <IonItem
                key={index}
                button
                onClick={() => handleSelectedUser(val.customerid)}
              >
                <IonLabel>
                  <h2>{val.name}</h2>
                  <p>{val.contactno}</p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={isOpenToast?.isOpen}
        message={isOpenToast.toastMessage}
        color="danger"
        position="middle"
        duration={3000}
        onDidDismiss={() => setIsOpenToast({ toastMessage: "", isOpen: false })}
      />
    </IonContent>
  );
};

export default CustomerInformationComponent;
