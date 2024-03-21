import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { store } from "./Service/Store";
import { Provider } from "react-redux";
import { IonReactRouter } from "@ionic/react-router";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <IonReactRouter>
        <App />
      </IonReactRouter>
    </Provider>
  </React.StrictMode>
);
