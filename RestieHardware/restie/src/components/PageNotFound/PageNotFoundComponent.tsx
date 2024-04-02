import React from "react";
import "./PageNotFoundComponent.css";
import { IonButton, IonContent } from "@ionic/react";
const PageNotFoundComponent = () => {
  return (
    <IonContent>
      <section className="page_404">
        <div className="container">
          <div className="row">
            <div className="col-sm-12 ">
              <div className="col-sm-10 col-sm-offset-1  text-center">
                <div className="four_zero_four_bg">
                  <h1 className="text-center ">404</h1>
                </div>

                <div className="contant_box_404">
                  <h3 className="h2">There's nothing here</h3>

                  <p>the page you are looking for not avaible!</p>

                  <IonButton
                    expand="block"
                    href="/home/main"
                    className="link_404"
                    color={"medium"}
                  >
                    Go to Home
                  </IonButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </IonContent>
  );
};

export default PageNotFoundComponent;
