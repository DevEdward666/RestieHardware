import {
  IonButton,
  IonContent,
  IonIcon,
  IonImg,
  IonInput,
  IonLoading,
  useIonRouter,
} from "@ionic/react";
import { eyeOffOutline, eyeOutline, lockClosedOutline, mailOutline } from "ionicons/icons";
import React, { useCallback, useEffect, useState } from "react";
import { PostLogin } from "../../Models/Request/Login/LoginModel";
import { GetLoginUser, Login } from "../../Service/Actions/Login/LoginActions";
import { useTypedDispatch } from "../../Service/Store";
import restie from "../../assets/images/Icon@3x.png";
import "./LoginComponent.css";
const LoginComponent = () => {
  const [customerInformation, setCustomerInformation] = useState<PostLogin>({
    username: "",
    password: "",
  });
  const [isOpenToast, setIsOpenToast] = useState({
    toastMessage: "",
    isOpen: false,
    type: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useTypedDispatch();
  const router = useIonRouter();
  const handleInfoChange = (e: any) => {
    const { name, value } = e.target;
    setCustomerInformation((prevState) => ({
      ...prevState,
      [name]: name === "contact" ? parseInt(value) : value,
    }));
  };
  const handleShowPassword = useCallback(() => {
    if (showPassword) {
      setShowPassword(false);
    } else {
      setShowPassword(true);
    }
  }, [showPassword]);
  const handleLogin = useCallback(async () => {
    console.log(customerInformation);
    setIsOpenToast((prev) => ({ ...prev, isOpen: true }));
    const payload: PostLogin = {
      username: customerInformation.username,
      password: customerInformation.password,
    };
    const res = await dispatch(Login(payload));
    if (res?.accessToken) {
      const res2 = await dispatch(GetLoginUser());
      if (res2?.name.length! > 0) {
        setIsOpenToast((prev) => ({ ...prev, isOpen: false }));
        router.push("/home/main");
      }
    } else {
      setIsOpenToast((prev) => ({ ...prev, isOpen: false }));
      alert("Wrong Username/Password");
    }
  }, [dispatch, customerInformation]);
  useEffect(() => {
    const checkUserLoggedin = async () => {
      const res = await dispatch(GetLoginUser());
      if (res?.name.length! > 0) {
        router.push("/home/main");
      }
    };
    checkUserLoggedin();
  }, [dispatch]);
  return (
    <IonContent className="lgn-content">
      <IonLoading
        isOpen={isOpenToast?.isOpen}
        message="Logging in..."
        spinner="circles"
        onDidDismiss={() => setIsOpenToast((prev) => ({ ...prev, isOpen: false }))}
      />

      <div className="lgn-wrapper">
        <div className="lgn-card">

          {/* Logo */}
          <IonImg src={restie} className="lgn-logo" />

          <p className="lgn-heading">Welcome back</p>
          <p className="lgn-sub">Sign in to your account</p>

          {/* Fields */}
          <div className="lgn-fields">
            <div className="lgn-field">
              <span className="lgn-label">Username</span>
              <div className="lgn-input-row">
                <IonIcon className="lgn-input-icon" icon={mailOutline} />
                <IonInput
                  className="lgn-input"
                  name="username"
                  type="text"
                  placeholder="Enter username"
                  value={customerInformation.username}
                  onIonInput={(e: any) => handleInfoChange(e)}
                />
              </div>
            </div>

            <div className="lgn-field">
              <span className="lgn-label">Password</span>
              <div className="lgn-input-row">
                <IonIcon className="lgn-input-icon" icon={lockClosedOutline} />
                <IonInput
                  className="lgn-input"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={customerInformation.password}
                  onIonInput={(e: any) => handleInfoChange(e)}
                />
                <button
                  type="button"
                  className="lgn-eye-btn"
                  onClick={() => handleShowPassword()}
                >
                  <IonIcon icon={showPassword ? eyeOutline : eyeOffOutline} />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="lgn-actions">
            <IonButton className="lgn-submit-btn" onClick={() => handleLogin()}>
              Login
            </IonButton>
            <IonButton
              className="lgn-explore-btn"
              fill="clear"
              expand="block"
              onClick={() => router.push("/home/main")}
            >
              Explore Products
            </IonButton>
          </div>

        </div>
      </div>
    </IonContent>
  );
};

export default LoginComponent;
