import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonLoading,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./SalesComponent.css";
import {
  GenerateInventoryLogs,
  GenerateSalesReturn,
  GetInventory,
  GetSalesByDay,
} from "../../../../Service/API/Inventory/InventoryApi";
import {
  PostDaysSalesModel,
  PostInventoryLogsModel,
} from "../../../../Models/Request/Inventory/InventoryModel";
import { format } from "date-fns";
import { FileResponse } from "../../../../Models/Response/Inventory/GetInventoryModel";
import MyCalendar from "../../../../Hooks/MyCalendar";
import { UploadSales } from "../../../../Service/API/Admin/AdminApi";
import {
  cloudUploadOutline,
  documentTextOutline,
  chevronForwardOutline,
  arrowUndoOutline,
  cubeOutline,
  listOutline,
  cloudUpload,
} from "ionicons/icons";
import { useSelector } from "react-redux";
import { RootStore } from "../../../../Service/Store";
interface ISelectedDates {
  startDate: Date;
  endDate: Date;
}
const SalesComponent = () => {
  const admin_list_of_supplier =
    useSelector(
      (store: RootStore) => store.AdminReducer.admin_list_of_supplier
    ) || [];
  const [selectedDate, setSelectedDate] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<ISelectedDates>();
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");

  const [salesFile, setSalesFile] = useState<File | null>(null);

  const [getFile, setFile] = useState<FileResponse>();
  const [openPDFModal, setopenPDFModal] = useState({
    isOpen: false,
    modal: "",
    type: "",
  });
  const [openUploadModal, setOpenUploadModal] = useState<boolean>(false);
  const [isOpenToast, setIsOpenToast] = useState({
    toastMessage: "",
    isOpen: false,
    type: "",
  });
  const [isOpenMessageToast, setMessageToast] = useState({
    toastMessage: "",
    isOpen: false,
  });
  const [selectedFilter, setSelectedFilter] = useState<number>(0);
  const [selectedFilterType, setSelectedFilterType] = useState<number>(0);


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
    setSelectedSupplier(admin_list_of_supplier[0]?.supplierid);
  }, [admin_list_of_supplier]);
  const handleDownloaPdf = useCallback(async () => {
    const parsedDates = selectedDate.map((date) => new Date(date).getTime());
    parsedDates.sort((a, b) => a - b);
    const lowestDate = selectedDates?.startDate.toISOString();
    const highestDate = selectedDates?.endDate.toISOString();
    const payload: PostDaysSalesModel = {
      fromDate: formatDate(lowestDate),
      toDate: formatDate(highestDate),
      filter: selectedFilter,
      report_type: selectedFilterType
    };
    const inventory_logs_payload: PostInventoryLogsModel = {
      fromDate: formatDate(lowestDate),
      toDate: formatDate(highestDate),
      supplier: selectedSupplier,
    };
    setIsOpenToast({
      toastMessage: "Generating PDF",
      isOpen: true,
      type: "PDF",
    });
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
        : openPDFModal.type === "inventory_logs"
          ? await GenerateInventoryLogs(inventory_logs_payload)
          : await GenerateSalesReturn(payload);
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
  }, [openPDFModal, selectedDates, selectedSupplier, selectedFilter, selectedFilterType]);
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
  const handleUploadFile = useCallback(async () => {
    try {
      setIsOpenToast({
        toastMessage: "Uploading Sales. Don't close this window",
        isOpen: true,
        type: "SALES",
      });
      const response = await UploadSales({ SalesFile: salesFile! });

      if (response.status === 200) {
        setMessageToast({ toastMessage: "Upload successful", isOpen: true });
        setIsOpenToast({
          toastMessage: "Upload successful",
          isOpen: false,
          type: "SALES",
        });

        // Handle response as needed
      } else {
        console.error("Upload failed:", response.statusText);
        setMessageToast({
          toastMessage: "Upload Failed. Please call the administrator",
          isOpen: true,
        });
        setIsOpenToast({
          toastMessage: "Upload Failed. Please call the administrator",
          isOpen: false,
          type: "SALES",
        });
        // Handle error
      }
      setOpenUploadModal(false);
      setFile(undefined);
    } catch (error) {
      setIsOpenToast({
        toastMessage: "",
        isOpen: false,
        type: "SALES",
      });
      setOpenUploadModal(false);
      setFile(undefined);
      console.log(`Something went Wrong: ${error}`);
    }
  }, [salesFile]);
  const handleFileChange = async (event: any) => {
    if (event.target.files && event.target.files.length > 0) {
      const File = event.target.files[0];
      if (!File) {
        console.error("No file selected");
        return;
      } else {
        setSalesFile(File);
      }
    }
  };
  const handleSelectedSupplier = async (
    e: CustomEvent<HTMLIonSelectElement>
  ) => {
    const { value } = e.detail;
    if (value) {
      setSelectedSupplier(value);
    }
  };
  const filterForSales = [
    {
      name: "With Discount",
      value: 0,
    },
    {
      name: "Without Discount",
      value: 1,
    },
  ];
  const filterType = [
    {
      name: "Details",
      value: 0,
    },
    {
      name: "Summary",
      value: 1,
    },
  ];
  const handleSelectedFilter = (e: CustomEvent<HTMLIonSelectElement>) => {
    const { value } = e.detail;
    setSelectedFilter(value);
  };
  const handleSelectedFilterType = (e: CustomEvent<HTMLIonSelectElement>) => {
    const { value } = e.detail;
    setSelectedFilterType(value);
  };
  return (
    <IonContent className="sc-content">
      <div className="sc-scroll">
        <div className="sc-inner">

          <p className="sc-section-label">Sales Reports</p>
          <div className="sc-card">
            <button
              className="sc-row"
              onClick={() => setopenPDFModal({ isOpen: true, modal: "", type: "sales" })}
            >
              <span className="sc-row-icon"><IonIcon icon={documentTextOutline} /></span>
              <span className="sc-row-body">
                <span className="sc-row-label">Generate Sales Report</span>
                <span className="sc-row-sub">PDF for a selected date range</span>
              </span>
              <IonIcon className="sc-row-chevron" icon={chevronForwardOutline} />
            </button>

            <button
              className="sc-row"
              onClick={() => setopenPDFModal({ isOpen: true, modal: "", type: "returns" })}
            >
              <span className="sc-row-icon"><IonIcon icon={arrowUndoOutline} /></span>
              <span className="sc-row-body">
                <span className="sc-row-label">Sales Return / Refund Report</span>
                <span className="sc-row-sub">Returns and refunds for a date range</span>
              </span>
              <IonIcon className="sc-row-chevron" icon={chevronForwardOutline} />
            </button>
          </div>

          <p className="sc-section-label">Inventory Reports</p>
          <div className="sc-card">
            <button
              className="sc-row"
              onClick={() => handleGenerateInventory()}
            >
              <span className="sc-row-icon"><IonIcon icon={cubeOutline} /></span>
              <span className="sc-row-body">
                <span className="sc-row-label">Generate Inventory Report</span>
                <span className="sc-row-sub">Current stock snapshot</span>
              </span>
              <IonIcon className="sc-row-chevron" icon={chevronForwardOutline} />
            </button>

            <button
              className="sc-row"
              onClick={() => setopenPDFModal({ isOpen: true, modal: "", type: "inventory_logs" })}
            >
              <span className="sc-row-icon"><IonIcon icon={listOutline} /></span>
              <span className="sc-row-body">
                <span className="sc-row-label">Generate Inventory Logs</span>
                <span className="sc-row-sub">Movement logs for a date range</span>
              </span>
              <IonIcon className="sc-row-chevron" icon={chevronForwardOutline} />
            </button>
          </div>

          <p className="sc-section-label">Upload</p>
          <div className="sc-card">
            <button
              className="sc-row"
              onClick={() => setOpenUploadModal(true)}
            >
              <span className="sc-row-icon"><IonIcon icon={cloudUploadOutline} /></span>
              <span className="sc-row-body">
                <span className="sc-row-label">Upload Sales Report</span>
                <span className="sc-row-sub">Import an .xlsx or .xls file</span>
              </span>
              <IonIcon className="sc-row-chevron" icon={chevronForwardOutline} />
            </button>
          </div>

        </div>
      </div>

      <IonLoading
        isOpen={isOpenToast?.isOpen}
        message={isOpenToast?.toastMessage}
        spinner="circles"
        onDidDismiss={() => setIsOpenToast((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* ── Date range / filter modal ── */}
      <IonModal
        isOpen={openPDFModal.modal !== "receipt" ? openPDFModal.isOpen : false}
        onDidDismiss={() => setopenPDFModal({ isOpen: false, modal: "", type: openPDFModal?.type })}
        initialBreakpoint={0.5}
        breakpoints={[0, 0.25, 0.5, 0.75, 1]}
      >
        <IonHeader>
          <IonToolbar className="sc-modal-toolbar">
            <IonButtons slot="start">
              <IonButton className="sc-modal-btn" onClick={() => setopenPDFModal({ isOpen: false, modal: "pdf", type: "" })}>
                Close
              </IonButton>
            </IonButtons>
            <IonButtons slot="end">
              <IonButton className="sc-modal-btn" onClick={handleDownloaPdf}>Generate</IonButton>
            </IonButtons>
            <IonTitle className="sc-modal-title">Choose Dates</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {openPDFModal.type === "inventory_logs" ? (
            <IonItem>
              <IonLabel>Supplier</IonLabel>
              <IonSelect
                name="Supplier"
                onIonChange={(e: any) => handleSelectedSupplier(e)}
                aria-label="Supplier"
                placeholder="Select Supplier"
                value={selectedSupplier}
              >
                {admin_list_of_supplier?.map((val, index) => (
                  <IonSelectOption key={index} value={val.supplierid}>{val.company}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          ) : openPDFModal.type === "sales" ? (
            <>
              <IonItem>
                <IonLabel>Filter</IonLabel>
                <IonSelect
                  name="Filter Report"
                  onIonChange={(e: any) => handleSelectedFilter(e)}
                  aria-label="Filter Report"
                  placeholder="Filter Report"
                  value={selectedFilter}
                >
                  {filterForSales?.map((val, index) => (
                    <IonSelectOption key={index} value={val.value}>{val.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel>Type</IonLabel>
                <IonSelect
                  name="Report Type"
                  onIonChange={(e: any) => handleSelectedFilterType(e)}
                  aria-label="Report Type"
                  placeholder="Report Type"
                  value={selectedFilterType}
                >
                  {filterType?.map((val, index) => (
                    <IonSelectOption key={index} value={val.value}>{val.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </>
          ) : null}
          <MyCalendar onDateRangeSelected={(start, end) => handleDateRangeSelected(start, end)} />
        </IonContent>
      </IonModal>

      {/* ── Upload modal ── */}
      <IonModal
        isOpen={openUploadModal ? openUploadModal : false}
        onDidDismiss={() => setOpenUploadModal(false)}
        initialBreakpoint={0.25}
        breakpoints={[0, 0.25, 0.5, 0.75, 1]}
      >
        <IonHeader>
          <IonToolbar className="sc-modal-toolbar">
            <IonButtons slot="start">
              <IonButton className="sc-modal-btn" onClick={() => setOpenUploadModal(false)}>Close</IonButton>
            </IonButtons>
            <IonButtons slot="end">
              <IonButton className="sc-modal-btn" onClick={handleUploadFile}>Upload</IonButton>
            </IonButtons>
            <IonTitle className="sc-modal-title">Upload Sales File</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="sc-upload-area">
            {salesFile && (
              <p className="sc-file-name">Selected: {salesFile.name}</p>
            )}
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="sc-file-input"
            />
          </div>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={isOpenMessageToast?.isOpen}
        message={isOpenMessageToast.toastMessage}
        position="middle"
        color="medium"
        duration={3000}
        onDidDismiss={() => setMessageToast({ toastMessage: "", isOpen: false })}
      />
    </IonContent>
  );
};

export default SalesComponent;
