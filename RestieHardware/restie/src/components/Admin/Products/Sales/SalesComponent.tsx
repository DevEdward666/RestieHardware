import {
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonHeader,
  IonImg,
  IonLoading,
  IonModal,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React, { useCallback, useEffect, useState } from "react";
import "./SalesComponent.css";
import { GetSalesByDay } from "../../../../Service/API/Inventory/InventoryApi";
import { PostDaysSalesModel } from "../../../../Models/Request/Inventory/InventoryModel";
import { format } from "date-fns";
import { FileResponse } from "../../../../Models/Response/Inventory/GetInventoryModel";
const SalesComponent = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [getFile, setFile] = useState<FileResponse>();
  const [openPDFModal, setopenPDFModal] = useState({
    isOpen: false,
    modal: "",
  });
  const [isOpenToast, setIsOpenToast] = useState({
    toastMessage: "",
    isOpen: false,
    type: "",
  });
  const handleWeekChange = (event: Event) => {
    const target = event.target as HTMLIonDatetimeElement;
    const value = target.value;

    if (Array.isArray(value)) {
      setSelectedDate(value.join(",")); // Join array elements into a single string
    } else {
      setSelectedDate(value || ""); // Use value directly if it's a string, or fallback to an empty string
      formatDate(value!);
    }
  };

  const formatDate = (dateStr?: string) => {
    const dateTimeString = dateStr;
    const date =
      dateTimeString === undefined ? new Date() : new Date(dateTimeString!);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading zero if necessary
    const day = String(date.getDate()).padStart(2, "0"); // Add leading zero if necessary

    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };
  useEffect(() => {
    setSelectedDate(formatDate());
  }, []);
  const handleDownloaPdf = useCallback(async () => {
    const payload: PostDaysSalesModel = {
      date: selectedDate,
    };
    setIsOpenToast({
      toastMessage: "Generating PDF",
      isOpen: true,
      type: "PDF",
    });
    const res = await GetSalesByDay(payload);
    const base64Data = res.result.fileContents; // Accessing the Base64 encoded PDF data
    const decodedData = atob(base64Data); // Decoding the Base64 string
    const byteArray = new Uint8Array(decodedData.length);

    for (let i = 0; i < decodedData.length; i++) {
      byteArray[i] = decodedData.charCodeAt(i);
    }

    const blob = new Blob([byteArray], { type: "application/pdf" });
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL);
    setIsOpenToast({
      toastMessage: "",
      isOpen: false,
      type: "",
    });
    // setopenPDFModal({ isOpen: true, modal: "pdf" });
    setFile(res);
  }, [selectedDate]);
  return (
    <IonContent>
      <div className="generate-sales-main">
        <IonText className="generate-sales-title">
          Generate PDF Sales by Day
        </IonText>
        <IonDatetime
          presentation="date"
          className="dateTimeComponent"
          onIonChange={handleWeekChange}
          value={selectedDate}
        />
        <IonButton color={"medium"} expand="block" onClick={handleDownloaPdf}>
          Generate PDF
        </IonButton>
      </div>
      <IonLoading
        isOpen={isOpenToast?.isOpen}
        message={isOpenToast?.toastMessage}
        duration={3000}
        spinner="circles"
        onDidDismiss={() =>
          setIsOpenToast((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
      />
      <IonModal
        isOpen={openPDFModal.modal !== "receipt" ? openPDFModal.isOpen : false}
        onDidDismiss={() => setopenPDFModal({ isOpen: false, modal: "" })}
        initialBreakpoint={1}
        breakpoints={[0, 0.25, 0.5, 0.75, 1]}
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton
                onClick={() => setopenPDFModal({ isOpen: false, modal: "pdf" })}
              >
                Close
              </IonButton>
            </IonButtons>
            <IonTitle className="delivery-info-title">
              {" "}
              Delivery Information
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <>
            {getFile &&
              getFile.contentType &&
              getFile.contentType.startsWith("application/") && (
                <>
                  <IonText className="delivery-image-text">
                    Delivery Image
                  </IonText>
                  <IonImg
                    className="swiper-component"
                    src={"data:application/pdf;base64," + getFile.fileContents}
                  ></IonImg>
                </>
              )}
          </>
        </IonContent>
      </IonModal>
    </IonContent>
  );
};

export default SalesComponent;
