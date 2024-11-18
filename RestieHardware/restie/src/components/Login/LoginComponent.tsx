import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLoading,
  useIonRouter,
} from "@ionic/react";
import { eyeOffOutline, eyeOutline, lockClosed, mail } from "ionicons/icons";
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
    <IonContent className="login-main-container">
      <IonLoading
        isOpen={isOpenToast?.isOpen}
        message="Loading"
        spinner="circles"
        onDidDismiss={() =>
          setIsOpenToast((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
      />
      <div className="login-main">
        <IonCard className="login-card-container">
          <IonCardContent className="login-card-content">
            <div className="login-card-input-content">
              <div className="login-card-input-logo-container">
                <IonImg src={restie} className="login-card-logo"></IonImg>
              </div>
              <div className="login-card-input-main-container">
                {" "}
                <div className="input-3">
                  <input
                    name="username"
                    type="text"
                    placeholder="Username"
                    onInput={(e: any) => handleInfoChange(e)}
                    required
                  />
                  <span className="material-symbols-outlined">
                    {" "}
                    <IonIcon
                      slot="start"
                      icon={mail}
                      aria-hidden="true"
                    ></IonIcon>{" "}
                  </span>
                </div>
                <div className="input-1">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    required
                    onInput={(e: any) => handleInfoChange(e)}
                  />
                  <span className="material-symbols-outlined">
                    <IonIcon
                      slot="start"
                      icon={lockClosed}
                      aria-hidden="true"
                    ></IonIcon>
                    <IonIcon
                      onClick={() => handleShowPassword()}
                      className="show-hide-icon"
                      slot="start"
                      aria-hidden="true"
                      icon={showPassword ? eyeOutline : eyeOffOutline}
                    ></IonIcon>
                  </span>
                </div>
                {/* <IonInput
                    labelPlacement="stacked"
                    label="Username"
                    name="username"
                    placeholder="Username"
                    type="text"
                    onIonInput={(e: any) => handleInfoChange(e)}
                    // class="login-input"
                  >
                    <IonIcon
                      slot="start"
                      icon={mail}
                      aria-hidden="true"
                    ></IonIcon>
                    <IonButton
                      fill="clear"
                      slot="end"
                      aria-label="Show/hide"
                    ></IonButton>
                  </IonInput> */}
                {/* <IonInput
                    labelPlacement="stacked"
                    label="Password"
                    // class="login-input"
                    placeholder="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    onIonInput={(e: any) => handleInfoChange(e)}
                  >
                    <IonIcon
                      slot="start"
                      icon={lockClosed}
                      aria-hidden="true"
                    ></IonIcon>
                    <IonButton
                      fill="clear"
                      slot="end"
                      aria-label="Show/hide"
                      onClick={() => handleShowPassword()}
                    >
                      <IonIcon
                        icon={showPassword ? eyeOutline : eyeOffOutline}
                      ></IonIcon>
                    </IonButton>
                  </IonInput> */}
                <IonButton
                  color="medium"
                  className="login-button"
                  onClick={() => handleLogin()}
                >
                  <span className="login-button-text">Login</span>
                </IonButton>
                <IonButton
                  expand="block"
                  fill="clear"
                  onClick={() => router.push("/home/main")}
                >
                  Explore Products
                </IonButton>
              </div>
            </div>
          </IonCardContent>
        </IonCard>
      </div>
    </IonContent>
  );
};

export default LoginComponent;
