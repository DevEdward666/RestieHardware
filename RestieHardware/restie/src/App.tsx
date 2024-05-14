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

setupIonicReact({ mode: "ios" });

const App: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true); // Assuming online initially
  const router = useIonRouter();
  useEffect(() => {
    const checkNetwork = async () => {
      const status = await Network.getStatus();
      setIsConnected(status.connected);
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

      {/* ADMIN */}
      <Route path="/admin/manageproduct" render={() => <ManageProductPage />} />
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
