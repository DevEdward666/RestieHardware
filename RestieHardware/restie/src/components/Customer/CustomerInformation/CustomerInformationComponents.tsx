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
} from "@ionic/react";
import { chevronForwardOutline } from "ionicons/icons";
import { useTypedDispatch } from "../../../Service/Store";
import "./CustomerInformationComponents.css";
import { AddCustomerInformation } from "../../../Service/Actions/Customer/CustomerActions";
import { useCallback, useState } from "react";
import { GetCustomerInformation } from "../../../Models/Response/Customer/GetCustomerModel";
import { v4 as uuidv4 } from "uuid";
const CustomerInformationComponent: React.FC = () => {
  const router = useIonRouter();
  const [isOpenToast, setIsOpenToast] = useState({
    toastMessage: "",
    isOpen: false,
  });
  const [customerInformation, setCustomerInformation] =
    useState<GetCustomerInformation>({
      customerid: "",
      name: "",
      address: "",
      contactno: 0,
      ordertype: "",
    });
  const dispatch = useTypedDispatch();
  const handleSaveCustomerInfo = useCallback(() => {
    if (!validateForm()) return;
    customerInformation.customerid = uuidv4();
    dispatch(AddCustomerInformation(customerInformation));
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
  const handleInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCustomerInformation((prevState) => ({
      ...prevState,
      [name]: name === "contact" ? parseInt(value) : value, // Convert to integer if it's contact field
    }));
  };
  return (
    <IonContent>
      <div className="customer-information-main-content">
        <div className="customer-information-list-container">
          <div className="customer-information-list">
            <IonItem className="customer-info-item">
              <IonText className="info-text">Name: </IonText>
              <IonInput
                name="name"
                type="text"
                onIonChange={(e: any) => handleInfoChange(e)}
                className="info-input"
                label="Customer Name"
                labelPlacement="floating"
                placeholder="Enter Name"
              ></IonInput>
            </IonItem>
            <IonItem className="customer-info-item">
              <IonText className="info-text">Address: </IonText>
              <IonInput
                name="address"
                onIonChange={(e: any) => handleInfoChange(e)}
                className="info-input"
                label="Customer Address"
                labelPlacement="floating"
                placeholder="Enter Address"
              ></IonInput>
            </IonItem>
            <IonItem className="customer-info-item">
              <IonText className="info-text">Contact No: </IonText>
              <IonInput
                name="contactno"
                onIonChange={(e: any) => handleInfoChange(e)}
                className="info-input"
                label="Contact No"
                labelPlacement="floating"
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
