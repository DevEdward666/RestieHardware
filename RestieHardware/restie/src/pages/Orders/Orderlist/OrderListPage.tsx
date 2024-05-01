import {
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonHeader,
  IonIcon,
  IonImg,
  IonLabel,
  IonMenuButton,
  IonModal,
  IonPage,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  SegmentChangeEventDetail,
  useIonRouter,
} from "@ionic/react";
import React, { useState } from "react";
import OrderListComponent from "../../../components/Orders/OrderList/OrderListComponent";
import restielogo from "../../../assets/images/Icon@3.png";
import { arrowBack, calendar } from "ionicons/icons";
import "./OrderListPage.css";
const OrderListPage = () => {
  const router = useIonRouter();
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState({
    status: "pending",
    date: "",
    search: "",
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(
    new Date().toISOString()
  );
  const handleSelectFilter = (val: CustomEvent<SegmentChangeEventDetail>) => {
    setSelectedFilter((prev) => ({
      ...prev,
      status: val.detail.value?.toString()!,
    }));
  };

  const handleDateChange = (event: CustomEvent) => {
    const target = event.detail.value;
    const selectedDate = formatDate(target);
    setSelectedFilter((prev) => ({
      ...prev,
      date: selectedDate,
    }));
    setSelectedDate(selectedDate);
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
  const handleSearch = (val: CustomEvent) => {
    setSelectedFilter((prev) => ({
      ...prev,
      search: val.detail.value?.toString(),
    }));
  };
  return (
    <IonPage className="order-list-page-container">
      <IonHeader className="order-list-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonButtons slot="start" onClick={() => router.push("/home/profile")}>
            <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
          </IonButtons>
          <IonTitle>Order List</IonTitle>
        </IonToolbar>
        <IonToolbar
          mode="ios"
          color="tertiary"
          className="order-list-toolbar-logo-container"
        >
          <IonImg src={restielogo} className="order-list-toolbar-logo"></IonImg>
        </IonToolbar>
        <IonToolbar mode="ios" color="tertiary">
          <div className="order-list-filter">
            <IonSegment
              className="orderlist-segment"
              scrollable={true}
              value={selectedFilter.status}
              onIonChange={(val) => handleSelectFilter(val)}
            >
              <IonSegmentButton value="quotation">
                <IonLabel>Quotation</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="pending">
                <IonLabel>Pending</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="approved">
                <IonLabel>Completed</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="delivered">
                <IonLabel>Delivered</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="cancel">
                <IonLabel>Cancelled</IonLabel>
              </IonSegmentButton>
            </IonSegment>
            <div className="order-list-search">
              <IonSearchbar
                className="order-list-searchbar"
                animated={true}
                placeholder="Search Order ID"
                onIonInput={(val) => handleSearch(val)}
                debounce={500}
                autocapitalize={""}
              ></IonSearchbar>
              <IonButton
                color="light"
                fill="clear"
                onClick={() => setIsOpenModal(true)}
              >
                <IonIcon src={calendar}></IonIcon>
              </IonButton>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div>
          <OrderListComponent filter={selectedFilter} />
        </div>
        <IonModal
          onDidDismiss={() => setIsOpenModal(false)}
          initialBreakpoint={0.5}
          keepContentsMounted={true}
          isOpen={isOpenModal}
        >
          <IonDatetime
            presentation="date"
            className="order-list-datetime"
            value={selectedDate}
            onIonChange={handleDateChange}
            formatOptions={{
              date: {
                weekday: "short",
                month: "short",
                day: "2-digit",
              },
            }}
          ></IonDatetime>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default OrderListPage;
