import {
  IonButton,
  IonContent,
  IonImg,
  IonText,
  useIonRouter,
} from "@ionic/react";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/keyboard";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/zoom";
import "@ionic/react/css/ionic-swiper.css";
import "./OnboardingComponent.css";
import createorder from "../../assets/images/Onboarding/create-order.png";
import addtocart from "../../assets/images/Onboarding/add-to-cart.png";
import customer from "../../assets/images/Onboarding/customer.png";
import saveasdraft from "../../assets/images/Onboarding/save-as-draft.png";
import cash from "../../assets/images/Onboarding/pay-cash.png";
import quotation from "../../assets/images/Onboarding/create-quote.png";
import ordersummary from "../../assets/images/Onboarding/complete-order.png";
const OnboardingComponent: React.FC = () => {
  const router = useIonRouter();
  return (
    <IonContent>
      <Swiper className="onboarding-swiper">
        <SwiperSlide>
          <div className="onboarding-container">
            <IonImg src={createorder}></IonImg>
            <div className="onboarding-container-info">
              <IonText className="onboarding-title">
                How to create an order
              </IonText>
              <IonText className="onboarding-subtitle">
                The next screen will teach you how to create an order.
              </IonText>
              <IonButton color={"medium"} className="onboarding-button">
                Swipe Right
              </IonButton>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="onboarding-container-order">
            <IonImg src={addtocart} className="order-img"></IonImg>
            <div className="onboarding-container-info-order">
              <IonText className="onboarding-title">Add to Cart</IonText>
              <IonText className="onboarding-subtitle">
                Click <strong>"Add to cart"</strong> Button on the bottom of the
                item you want to order
              </IonText>
              <IonButton color={"medium"} className="onboarding-button">
                Swipe
              </IonButton>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          {" "}
          <div className="onboarding-container-order">
            <IonImg src={customer} className="order-img"></IonImg>
            <div className="onboarding-container-info-order">
              <IonText className="onboarding-title">
                Fill Customer Information
              </IonText>
              <IonText className="onboarding-subtitle">
                Click New Customer if is a new customer. If the customer is
                already exist just click customer Name then search for the
                customer's Name
              </IonText>
              <IonButton color={"medium"} className="onboarding-button">
                Swipe
              </IonButton>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="onboarding-container-order">
            <IonImg src={saveasdraft} className="order-img"></IonImg>
            <div className="onboarding-container-info-order">
              <IonText className="onboarding-title">Save as Draft</IonText>
              <IonText className="onboarding-subtitle">
                After you fill the customer's information you will need to
                choose if you want to save the order, pay the order, or create a
                quotation. If you Choose <strong>"Save as Draft"</strong> the
                order will save and the status will be pending
              </IonText>
              <IonButton color={"medium"} className="onboarding-button">
                Swipe
              </IonButton>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="onboarding-container-order">
            <IonImg src={quotation} className="order-img"></IonImg>
            <div className="onboarding-container-info-order">
              <IonText className="onboarding-title">
                Create a Quoatation
              </IonText>
              <IonText className="onboarding-subtitle">
                If you Choose <strong>"Create a Quoatation"</strong> the order
                will save and the status will be Quotation and you can print the
                Quoatation in the order summary page
              </IonText>
              <IonButton color={"medium"} className="onboarding-button">
                Swipe
              </IonButton>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="onboarding-container-order">
            <IonImg src={cash} className="order-img"></IonImg>
            <div className="onboarding-container-info-order">
              <IonText className="onboarding-title">Cash</IonText>
              <IonText className="onboarding-subtitle">
                If you Choose <strong>"Cash"</strong> the order will save and
                the status will be Completed and you can print the receipt in
                the order summary page
              </IonText>
              <IonButton color={"medium"} className="onboarding-button">
                Swipe
              </IonButton>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="onboarding-container-order">
            <IonImg src={ordersummary} className="order-img"></IonImg>
            <div className="onboarding-container-info-order">
              <IonText className="onboarding-title">Order Summary</IonText>
              <IonText className="onboarding-subtitle">
                After you finish the payment option you will be redirected to
                the order summary
              </IonText>
              <IonButton
                onClick={() => router.push("home/main")}
                color={"medium"}
                className="onboarding-button"
              >
                Finish
              </IonButton>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </IonContent>
  );
};

export default OnboardingComponent;
