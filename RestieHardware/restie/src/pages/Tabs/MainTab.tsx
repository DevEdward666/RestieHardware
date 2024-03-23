import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { home, cart, person } from "ionicons/icons";
import { Route, Redirect } from "react-router";
import Tab2 from "../Cart/Tab2";
import Tab1 from "../Home/Home";
import Tab3 from "../Profile/Tab3";

const MainTab: React.FC = () => {
  return (
    <>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact={true} path="/home/main" render={() => <Tab1 />} />
          <Route exact={true} path="/home/cart" render={() => <Tab2 />} />
          <Route exact={true} path="/home/profile" render={() => <Tab3 />} />
          <Route exact={true} path="/">
            <Redirect to="/home/main" />
          </Route>
        </IonRouterOutlet>

        <IonTabBar slot="bottom" color="tertiary" mode="md">
          <IonTabButton tab="home" href="/home/main">
            <IonIcon aria-hidden="true" icon={home} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>
          <IonTabButton tab="cart" href="/home/cart">
            <IonIcon aria-hidden="true" icon={cart} />
            <IonLabel>Cart</IonLabel>
          </IonTabButton>
          <IonTabButton tab="profile" href="/home/profile">
            <IonIcon aria-hidden="true" icon={person} />
            <IonLabel>Profile</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </>
  );
};

export default MainTab;
