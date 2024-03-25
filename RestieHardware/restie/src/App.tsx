import { IonApp, setupIonicReact } from "@ionic/react";
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

setupIonicReact();

const App: React.FC = () => {
  return (
    <IonApp>
      <Route path="/" render={() => <MainTab />} />
      <Route path="/selectedItem" render={() => <SelectedItemPage />} />
      <Route path="/orders" render={() => <OrderListPage />} />

      <Route
        path="/customerInformation"
        render={() => <CustomerInformationPage />}
      />
      <Route path="/paymentoptions" render={() => <PaymentOptionsPage />} />

      <Route path="/orderInfo" render={() => <OrderInfoPage />} />
      <Route path="/home/cart" render={() => <MainTab />} />
    </IonApp>
  );
};

export default App;
