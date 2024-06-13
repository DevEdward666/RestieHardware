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
  IonToast,
  IonToolbar,
} from "@ionic/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./SalesComponent.css";
import {
  GenerateSalesReturn,
  GetInventory,
  GetSalesByDay,
} from "../../../../Service/API/Inventory/InventoryApi";
import { PostDaysSalesModel } from "../../../../Models/Request/Inventory/InventoryModel";
import { format } from "date-fns";
import { FileResponse } from "../../../../Models/Response/Inventory/GetInventoryModel";
import MyCalendar from "../../../../Hooks/MyCalendar";
interface ISelectedDates {
  startDate: Date;
  endDate: Date;
}
const SalesComponent = () => {
  const [selectedDate, setSelectedDate] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<ISelectedDates>();

  const [getFile, setFile] = useState<FileResponse>();
  const [openPDFModal, setopenPDFModal] = useState({
    isOpen: false,
    modal: "",
    type: "",
  });
  const [isOpenToast, setIsOpenToast] = useState({
    toastMessage: "",
    isOpen: false,
    type: "",
  });
  const [isOpenMessageToast, setMessageToast] = useState({
    toastMessage: "",
    isOpen: false,
  });
  const handleWeekChange = (event: Event) => {
    const target = event.target as HTMLIonDatetimeElement;
    const value = target.value;
    if (Array.isArray(value)) {
      setSelectedDate(value);
    } else {
      // setSelectedDate(value);
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
  // useEffect(() => {
  //   setSelectedDate(formatDate());
  // }, []);
  const handleDownloaPdf = useCallback(async () => {
    const parsedDates = selectedDate.map((date) => new Date(date).getTime());
    parsedDates.sort((a, b) => a - b);
    const lowestDate = selectedDates?.startDate.toISOString();
    const highestDate = selectedDates?.endDate.toISOString();
    const payload: PostDaysSalesModel = {
      fromDate: formatDate(lowestDate),
      toDate: formatDate(highestDate),
    };
    setIsOpenToast({
      toastMessage: "Generating PDF",
      isOpen: true,
      type: "PDF",
    });
    console.log(payload);
    if (payload.fromDate === undefined) {
      setIsOpenToast({
        toastMessage: "No reports available",
        isOpen: false,
        type: "PDF",
      });
      setMessageToast({
        toastMessage: "Please select date",
        isOpen: true,
      });
      return;
    }
    const res =
      openPDFModal.type === "sales"
        ? await GetSalesByDay(payload)
        : await GenerateSalesReturn(payload);
    console.log(res);
    if (res.result === null || res.result === undefined) {
      setIsOpenToast({
        toastMessage: "No reports available",
        isOpen: false,
        type: "PDF",
      });
      setMessageToast({
        toastMessage: "No reports available",
        isOpen: true,
      });
      return;
    }
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
  }, [openPDFModal, selectedDates]);
  const handleGenerateInventory = async () => {
    setIsOpenToast({
      toastMessage: "Generating PDF",
      isOpen: true,
      type: "PDF",
    });
    const res = await GetInventory();
    const base64Data = res?.result?.fileContents; // Accessing the Base64 encoded PDF data
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
  };
  const handleDateRangeSelected = (start: Date, end: Date) => {
    setSelectedDates({
      startDate: start,
      endDate: end,
    });
  };
  return (
    <IonContent className="generate-sales-main-content">
      <IonText className="generate-sales-title">Generate PDF</IonText>
      <div className="generate-sales-main">
        <IonButton
          color={"medium"}
          expand="block"
          onClick={() =>
            setopenPDFModal({ isOpen: true, modal: "", type: "sales" })
          }
        >
          Generate Sales Report
        </IonButton>
        <IonButton
          color={"medium"}
          expand="block"
          onClick={() =>
            setopenPDFModal({ isOpen: true, modal: "", type: "returns" })
          }
        >
          Generate Sales Return/Refund Report
        </IonButton>
        <IonButton
          color={"medium"}
          expand="block"
          onClick={() => handleGenerateInventory()}
        >
          Generate Inventory Report
        </IonButton>
      </div>
      <IonLoading
        isOpen={isOpenToast?.isOpen}
        message={isOpenToast?.toastMessage}
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
        onDidDismiss={() =>
          setopenPDFModal({
            isOpen: false,
            modal: "",
            type: openPDFModal?.type,
          })
        }
        initialBreakpoint={0.5}
        breakpoints={[0, 0.25, 0.5, 0.75, 1]}
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton
                onClick={() =>
                  setopenPDFModal({ isOpen: false, modal: "pdf", type: "" })
                }
              >
                Close
              </IonButton>
            </IonButtons>
            <IonButtons slot="end">
              <IonButton onClick={handleDownloaPdf}>Generate</IonButton>
            </IonButtons>
            <IonTitle className="delivery-info-title"> Choose Dates</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <MyCalendar
            onDateRangeSelected={(start, end) =>
              handleDateRangeSelected(start, end)
            }
          />

          {/* <IonDatetime
            multiple
            presentation="date"
            className="dateTimeComponent"
            onIonChange={handleWeekChange}
            value={selectedDate}
          /> */}
        </IonContent>
      </IonModal>
      <IonToast
        isOpen={isOpenMessageToast?.isOpen}
        message={isOpenMessageToast.toastMessage}
        position="middle"
        color={"medium"}
        duration={3000}
        onDidDismiss={() =>
          setMessageToast({ toastMessage: "", isOpen: false })
        }
      ></IonToast>
    </IonContent>
  );
};

export default SalesComponent;
