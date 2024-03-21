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

setupIonicReact();

const App: React.FC = () => {
  return (
    <IonApp>
      <Route path="/" render={() => <MainTab />} />
      <Route path="/selectedItem" render={() => <SelectedItemPage />} />
    </IonApp>
  );
};

export default App;
