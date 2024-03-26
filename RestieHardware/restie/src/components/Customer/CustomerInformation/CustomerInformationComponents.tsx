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
const CustomerInformationComponent: React.FC = () => {
  const router = useIonRouter();
  const customers = useSelector(
    (store: RootStore) => store.CustomerReducer.customers
  );
  const get_customer = useSelector(
    (store: RootStore) => store.CustomerReducer.get_customer
  );
  const [isOpenToast, setIsOpenToast] = useState({
    toastMessage: "",
    isOpen: false,
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
        if (name === "name") {
          const payload: PostCustomer = {
            customerid: value.toString(),
          };
          await dispatch(GetOneCustomer(payload));
        } else if (name === "ordertype") {
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
  return (
    <IonContent>
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
              {!isNewCustomer ? (
                <IonSelect
                  name="name"
                  onIonChange={(e: any) => handleInfoChange(e)}
                  aria-label="Name"
                  value={
                    customerInformation?.customerid !== ""
                      ? customerInformation.customerid
                      : "none"
                  }
                  className="info-input"
                >
                  <IonSelectOption value={"none"}>Select Name</IonSelectOption>
                  {customers?.map((val, index) => (
                    <IonSelectOption value={val.customerid} key={index}>
                      {val.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              ) : (
                <IonInput
                  name="name"
                  type="text"
                  onIonInput={(e: any) => handleInfoChange(e)}
                  className="info-input"
                  label="Customer Name"
                  labelPlacement="floating"
                  placeholder="Enter Name"
                ></IonInput>
              )}
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
