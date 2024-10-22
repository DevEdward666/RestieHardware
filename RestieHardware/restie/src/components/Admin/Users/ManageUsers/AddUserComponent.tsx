import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonText,
} from "@ionic/react";
import { saveOutline } from "ionicons/icons";
import { useCallback, useState } from "react";
import { PostAddNewUser } from "../../../../Models/Request/Admin/AdminRequestModel";
import { AddNewUsers } from "../../../../Service/Actions/Admin/AdminActions";
import { set_toast } from "../../../../Service/Actions/Commons/CommonsActions";
import { useTypedDispatch } from "../../../../Service/Store";

const AddUserComponent = () => {
  const dispatch = useTypedDispatch();
  const [userInfo, setUserInfo] = useState<PostAddNewUser>({
    id: "",
    name: "",
    username: "",
    password: "",
    role: "",
  });
  const handleInfoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setUserInfo((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    []
  );
  const handleSaveProduct = useCallback(async () => {
    const payload: PostAddNewUser = {
      id: userInfo.id,
      name: userInfo.name,
      username: userInfo.username,
      password: userInfo.password,
      role: userInfo.role,
    };

    if (
      payload.name.length < 0 ||
      payload.username.length < 0 ||
      payload.password.length < 0
    ) {
      dispatch(
        set_toast({
          isOpen: true,
          message: "Please fill out all neccessary field",
          position: "middle",
          color: "#125B8C",
        })
      );
      return;
    } else {
      const res = await AddNewUsers(payload);
      if (res.status === 200) {
        dispatch(
          set_toast({
            isOpen: true,
            message: "Successfully Added",
            position: "middle",
            color: "#125B8C",
          })
        );
        setUserInfo({
          id: "",
          name: "",
          username: "",
          password: "",
          role: "",
        });
      }
    }
  }, [dispatch, userInfo]);
  return (
    <IonContent>
      <div className="add-new-product-container">
        <IonInput
          labelPlacement="floating"
          label="Name"
          name="name"
          type="text"
          onIonInput={(e: any) => handleInfoChange(e)}
          class="product-input"
          value={userInfo.name}
        ></IonInput>
        <IonInput
          labelPlacement="floating"
          label="Username"
          name="username"
          type="text"
          onIonInput={(e: any) => handleInfoChange(e)}
          class="product-input"
          value={userInfo.username}
        ></IonInput>
        <IonInput
          labelPlacement="floating"
          label="Password"
          name="password"
          type="password"
          onIonInput={(e: any) => handleInfoChange(e)}
          class="product-input"
          value={userInfo.password}
        ></IonInput>
        <IonItem className="info-item">
          <IonText className="info-text">Role </IonText>
          <IonSelect
            name="role"
            onIonChange={(e: any) => handleInfoChange(e)}
            aria-label="Role"
            className="info-input"
            value={userInfo.role}
          >
            <IonSelectOption className="select-option" value="Super Admin">
              Super Admin
            </IonSelectOption>
            <IonSelectOption className="select-option" value="Admin">
              Admin
            </IonSelectOption>
            <IonSelectOption className="select-option" value="User">
              Staff
            </IonSelectOption>
          </IonSelect>
        </IonItem>
        <IonButton
          color="medium"
          expand="block"
          onClick={() => handleSaveProduct()}
        >
          <IonIcon slot="start" icon={saveOutline}></IonIcon>
          Add User
        </IonButton>
      </div>
    </IonContent>
  );
};
export default AddUserComponent;
