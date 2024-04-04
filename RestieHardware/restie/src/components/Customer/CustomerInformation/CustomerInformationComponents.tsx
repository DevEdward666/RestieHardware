import {
  useIonRouter,
  IonContent,
  IonText,
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
import { chevronForwardOutline } from "ionicons/icons";
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
      contactno: 0,
      ordertype: "",
      newUser: true,
    });
  const dispatch = useTypedDispatch();
  useEffect(() => {
    const initialize = () => {
      setCustomerInformation({
        name: "",
        address: "",
        contactno: 0,
        ordertype: "",
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
      contactno: 0,
      ordertype: "",
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
    if (customerInformation.contactno === 0) {
      errors.push("Please enter your contact no");
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
      contactno: 0,
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
  return (
    <IonContent className="customer-information-content">
      <div className="customer-information-main-content">
        <div className="customer-information-list-container">
          <div className="customer-information-list">
            <IonItem className="customer-info-item">
              <IonCheckbox
                labelPlacement="start"
                checked={isNewCustomer}
                onIonChange={(e) => handleNewCustomer(e)}
              >
                New Customer?
              </IonCheckbox>
            </IonItem>
            <IonItem className="customer-info-item">
              <IonText className="info-text">Name: </IonText>

              <IonInput
                onClick={() =>
                  !isNewCustomer
                    ? setOpenSearchModal({ isOpen: true, modal: "" })
                    : null
                }
                readonly={!isNewCustomer ? true : false}
                name="name"
                type="text"
                onIonInput={(e: any) => handleInfoChange(e)}
                className="info-input"
                label="Customer Name"
                labelPlacement="floating"
                placeholder="Enter Name"
                value={customerInformation.name}
              ></IonInput>
            </IonItem>

            <IonItem className="customer-info-item">
              <IonText className="info-text">Address: </IonText>
              <IonInput
                disabled={!isNewCustomer}
                name="address"
                onIonInput={(e: any) => handleInfoChange(e)}
                className="info-input"
                label="Customer Address"
                labelPlacement="floating"
                value={customerInformation.address}
                placeholder="Enter Address"
              ></IonInput>
            </IonItem>
            <IonItem className="customer-info-item">
              <IonText className="info-text">Contact No: </IonText>
              <IonInput
                disabled={!isNewCustomer}
                name="contactno"
                onIonInput={(e: any) => handleInfoChange(e)}
                className="info-input"
                label="Contact No"
                labelPlacement="floating"
                value={customerInformation.contactno}
                type="number"
                placeholder="Enter No"
              ></IonInput>
            </IonItem>
            <IonItem className="customer-info-item">
              <IonText className="info-text">Order Type: </IonText>
              <IonSelect
                name="ordertype"
                onIonChange={(e: any) => handleInfoChange(e)}
                aria-label="Order Type"
                value={
                  customerInformation?.ordertype !== ""
                    ? customerInformation.ordertype
                    : "none"
                }
                className="info-input"
              >
                <IonSelectOption value="none">Select</IonSelectOption>
                <IonSelectOption value="deliver">Deliver</IonSelectOption>
                <IonSelectOption value="pickup">Pick-up</IonSelectOption>
              </IonSelect>
            </IonItem>
          </div>
        </div>
        <IonButton color="medium" onClick={() => handleSaveCustomerInfo()}>
          Proceed
        </IonButton>
      </div>
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
          <>
            <IonSearchbar
              placeholder="Search Supplier"
              onIonInput={(e) => handleSearch(e)}
              autocapitalize={"words"}
              debounce={1500}
            ></IonSearchbar>
            <IonList>
              {customers.map((val, index) => (
                <IonItem
                  onClick={() => handleSelectedUser(val.customerid)}
                  key={index}
                >
                  {/* <IonAvatar slot="start">
                  <IonImg src="https://i.pravatar.cc/300?u=b" />
                </IonAvatar> */}
                  <IonLabel>
                    <h2>{val.name}</h2>
                    <p>{val.contactno}</p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </>
        </IonContent>
      </IonModal>
      <IonToast
        isOpen={isOpenToast?.isOpen}
        message={isOpenToast.toastMessage}
        duration={3000}
        onDidDismiss={() => setIsOpenToast({ toastMessage: "", isOpen: false })}
      ></IonToast>
    </IonContent>
  );
};

export default CustomerInformationComponent;
