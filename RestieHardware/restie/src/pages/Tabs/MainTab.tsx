import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  useIonRouter,
  IonToast,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { home, cart, person } from "ionicons/icons";
import { Route, Redirect } from "react-router";
import Tab2 from "../Cart/Tab2";
import Tab1 from "../Home/Home";
import Tab3 from "../Profile/Tab3";
import { useEffect } from "react";
import { RootStore, useTypedDispatch } from "../../Service/Store";
import { GetLoginUser } from "../../Service/Actions/Login/LoginActions";
import { useSelector } from "react-redux";
import { set_toast } from "../../Service/Actions/Commons/CommonsActions";

const MainTab: React.FC = () => {
  const get_toast = useSelector(
    (store: RootStore) => store.CommonsReducer.set_toast
  );
  const dispatch = useTypedDispatch();
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
      <IonToast
        isOpen={get_toast?.isOpen}
        message={get_toast.message}
        duration={3000}
        onDidDismiss={() =>
          dispatch(
            set_toast({
              message: "",
              isOpen: false,
            })
          )
        }
      ></IonToast>
    </>
  );
};

export default MainTab;
