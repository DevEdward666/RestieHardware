import { IonApp, setupIonicReact, useIonRouter } from "@ionic/react";
import { Route } from "react-router";
/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/display.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";

/* Theme variables */
import SelectedItemPage from "./pages/SelectedItem/SelectedItemPage";
import MainTab from "./pages/Tabs/MainTab";
import "./theme/variables.css";
import OrderListPage from "./pages/Orders/Orderlist/OrderListPage";
import OrderInfoPage from "./pages/Orders/Orderinfo/OrderInfo";
import CustomerInformationPage from "./pages/Customer/CustomerInformation/CustomerInformationPage";
import PaymentOptionsPage from "./pages/Payment/PaymentsOptions/PaymentOptionsPage";
import LoginPage from "./pages/Login/LoginPage";
import DeliveryInfoPage from "./pages/Delivery/DeliveryInfo/DeliveryInfoPage";
import ManageProductPage from "./pages/Products/ManageProducts/ManageProductPage";
import PageNotFoundPage from "./pages/PageNotFound/PageNotFoundPage";
import { useEffect, useState } from "react";
import { Network } from "@capacitor/network";
import OfflineDeliveryPage from "./pages/Delivery/OfflineDelivery/OfflineDeliveryPage";
import SalesPage from "./pages/Products/Sales/SalesPage";
import OnboardingPage from "./pages/Onboarding/OnboardingPage";
import ReturnRefundPage from "./pages/Orders/ReturnRefund/ReturnRefundPage";
import RefundSubmitPage from "./pages/Orders/ReturnRefund/RefundSubmitPage/RefundSubmitPage";
import NotificationPage from "./pages/Notifications/NotificationPage";
import AddNewItemPage from "./pages/Products/ManageProducts/AddNewItemPage";
import MainProductPage from "./pages/Products/ManageProducts/MainProductPage";

setupIonicReact({ mode: "ios" });

const App: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true); // Assuming online initially
  const router = useIonRouter();
  useEffect(() => {
    const checkNetwork = async () => {
      const status = await Network.getStatus();
      setIsConnected(status.connected);
      // await populateBluetoothDevices();
      // await onRequestBluetoothDeviceButtonClick();
    };

    const handleNetworkChange = (status: any) => {
      setIsConnected(status.connected);
    };

    // Initial check
    checkNetwork();

    // Add listener for network changes
    const listener = Network.addListener(
      "networkStatusChange",
      handleNetworkChange
    );
  }, []);
  useEffect(() => {
    if (!isConnected) {
      // Redirect to offline page if not connected
      router.push("/DeliverOffline");
    }
  }, [isConnected, history]);
  // async function populateBluetoothDevices() {
  //   const devicesSelect = document.querySelector("#devicesSelect");
  //   try {
  //     console.log("Getting existing permitted Bluetooth devices...");
  //     const devices = await navigator.bluetooth.getDevices();

  //     console.log("> Got " + devices.length + " Bluetooth devices.");
  //     devicesSelect!.textContent = "";
  //     for (const device of devices) {
  //       const option = document.createElement("option");
  //       option.value = device.id;
  //       option.textContent = device?.name!;
  //       devicesSelect?.appendChild(option);
  //     }
  //   } catch (error) {
  //     console.log("Argh! " + error);
  //   }
  // }
  // async function onRequestBluetoothDeviceButtonClick() {
  //   try {
  //     console.log("Requesting any Bluetooth device...");
  //     const device = await navigator.bluetooth.requestDevice({
  //       // filters: [...] <- Prefer filters to save energy & show relevant devices.
  //       acceptAllDevices: true,
  //     });

  //     console.log("> Requested " + device.name + " (" + device.id + ")");
  //     populateBluetoothDevices();
  //   } catch (error) {
  //     console.log("Argh! " + error);
  //   }
  // }
  return (
    <IonApp>
      <Route path="/" render={() => <MainTab />} />
      <Route path="/selectedItem" render={() => <SelectedItemPage />} />
      <Route path="/orders" render={() => <OrderListPage />} />
      <Route path="/login" render={() => <LoginPage />} />
      <Route
        path="/customerInformation"
        render={() => <CustomerInformationPage />}
      />
      <Route path="/paymentoptions" render={() => <PaymentOptionsPage />} />

      <Route path="/orderInfo" render={() => <OrderInfoPage />} />
      <Route path="/returnrefund" render={() => <ReturnRefundPage />} />
      <Route path="/refundsubmit" render={() => <RefundSubmitPage />} />

      <Route path="/deliveryInfo" render={() => <DeliveryInfoPage />} />
      <Route path="/home/cart" render={() => <MainTab />} />

      <Route path="/notifications" render={() => <NotificationPage />} />
      {/* ADMIN */}
      <Route path="/admin/manageproduct" render={() => <ManageProductPage />} />
      <Route path="/admin/addNewItem" render={() => <AddNewItemPage />} />
      <Route
        path="/admin/mainmanageproduct"
        render={() => <MainProductPage />}
      />

      <Route path="/admin/sales" render={() => <SalesPage />} />

      {/* 404 Page not found */}
      <Route path="/pageNotFound" render={() => <PageNotFoundPage />} />
      {/* Offline */}
      <Route path="/DeliverOffline" render={() => <OfflineDeliveryPage />} />
      {/* Onboarding */}
      <Route path="/Onboarding" render={() => <OnboardingPage />} />
    </IonApp>
  );
};

export default App;
