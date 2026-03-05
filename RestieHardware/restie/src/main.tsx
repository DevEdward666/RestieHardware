import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { store } from "./Service/Store";
import { Provider } from "react-redux";
import { IonReactRouter } from "@ionic/react-router";

// Fix: "Blocked aria-hidden on an element because its descendant retained focus"
// ion-backdrop in Ionic 7 can receive focus while aria-hidden is being applied.
// Blurring it immediately on focus prevents the browser accessibility warning.
document.addEventListener(
  "focus",
  (e) => {
    const target = e.target as HTMLElement;
    if (target?.tagName?.toLowerCase() === "ion-backdrop") {
      target.blur();
    }
  },
  true // capture phase — fires before Ionic's own handlers
);

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
