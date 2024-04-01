import React, { useCallback, useEffect, useState } from "react";
import "./LoginComponent.css";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  useIonRouter,
} from "@ionic/react";
import {
  GetCustomerInformation,
  PostCustomer,
} from "../../Models/Response/Customer/GetCustomerModel";
import { GetOneCustomer } from "../../Service/Actions/Customer/CustomerActions";
import { PostLogin } from "../../Models/Request/Login/LoginModel";
import restie from "../../assets/images/Icon@3.png";
import {
  lockClosed,
  eyeOutline,
  eyeOffOutline,
  mail,
  star,
} from "ionicons/icons";
import { useTypedDispatch } from "../../Service/Store";
import { GetLoginUser, Login } from "../../Service/Actions/Login/LoginActions";
const LoginComponent = () => {
  const [customerInformation, setCustomerInformation] = useState<PostLogin>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useTypedDispatch();
  const router = useIonRouter();
  const handleInfoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setCustomerInformation((prevState) => ({
        ...prevState,
        [name]: name === "contact" ? parseInt(value) : value,
      }));
    },
    []
  );
  const handleShowPassword = useCallback(() => {
    if (showPassword) {
      setShowPassword(false);
    } else {
      setShowPassword(true);
    }
  }, [showPassword]);
  const handleLogin = useCallback(async () => {
    const payload: PostLogin = {
      username: customerInformation.username,
      password: customerInformation.password,
    };
    const res = await dispatch(Login(payload));
    if (res?.accessToken) {
      const res2 = await dispatch(GetLoginUser());
      if (res2?.name.length! > 0) {
        router.push("/home/main");
      }
    } else {
      alert(res);
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
      <div className="login-main">
        <IonCard className="login-card-container">
          <IonCardContent className="login-card-content">
            <div className="login-card-input-content">
              <div className="login-card-input-logo-container">
                <IonImg src={restie} className="login-card-logo"></IonImg>
              </div>
              <div className="login-card-input-main-container">
                <IonItem>
                  <IonInput
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
                  </IonInput>
                </IonItem>
                <IonItem>
                  <IonInput
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
                  </IonInput>
                </IonItem>
                <IonButton
                  expand="block"
                  color="medium"
                  className="login-button"
                  onClick={() => handleLogin()}
                >
                  Login
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
