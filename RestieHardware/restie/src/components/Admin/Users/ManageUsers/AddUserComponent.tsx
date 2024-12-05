import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonText,
  IonToolbar,
} from "@ionic/react";
import { close, saveOutline } from "ionicons/icons";
import { useCallback, useEffect, useState } from "react";
import { PostAddNewUser } from "../../../../Models/Request/Admin/AdminRequestModel";
import {
  AddNewUsers,
  checkPasswordStrength,
  searchUsers,
  UpdateNewUsers,
} from "../../../../Service/Actions/Admin/AdminActions";
import { set_toast } from "../../../../Service/Actions/Commons/CommonsActions";
import { RootStore, useTypedDispatch } from "../../../../Service/Store";
import { SearchInventoryModel } from "../../../../Models/Request/searchInventory";
import { useSelector } from "react-redux";
import { UserNameModel } from "../../../../Models/Response/Admin/AdminModelResponse";
import {
  searchUser,
  UpdateNewUser,
} from "../../../../Service/API/Admin/AdminApi";
import "./AddUserComponent.css";
const AddUserComponent = () => {
  const dispatch = useTypedDispatch();
  const admin_list_of_users =
    useSelector((store: RootStore) => store.AdminReducer.admin_list_of_users) ||
    [];
  const [openSearchModal, setOpenSearchModal] = useState({
    isOpen: false,
    modal: "",
  });
  const [fetchList, setFetchList] = useState<SearchInventoryModel>({
    page: 1,
    offset: 0, // Assuming offset starts from 0
    limit: 50,
    searchTerm: "",
  });
  const [userInfo, setUserInfo] = useState<PostAddNewUser>({
    id: "",
    name: "",
    username: "",
    password: "",
    confirm_password: "",
    role: "Staff",
  });
  const [passwordStrength, setPasswordStrength] = useState({
    isStrong: false,
    strength_score: 0,
  });
  const [isUsernameTaken, setIsUsernameTaken] = useState(false);
  useEffect(() => {
    const searchUser = () => {
      dispatch(searchUsers(fetchList));
    };
    searchUser();
  }, [dispatch, fetchList, openSearchModal]);
  const handleInfoChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setUserInfo((prevState) => ({
        ...prevState,
        [name]: value,
      }));
      if (name === "password") {
        const { isStrong, strength, strength_score } =
          checkPasswordStrength(value);
        setPasswordStrength({ isStrong, strength_score });
      }
      if (name === "username") {
        const exists = admin_list_of_users.some(
          (user) => user.username === value
        );

        console.log(exists);
        setIsUsernameTaken(exists);
      }
    },
    [admin_list_of_users]
  );
  const handleSaveUser = useCallback(
    async (update: boolean) => {
      const payload: PostAddNewUser = {
        id: userInfo.id,
        name: userInfo.name,
        username: userInfo.username,
        password: userInfo.password,
        confirm_password: userInfo.confirm_password,
        role: userInfo.role,
      };
      if (
        payload.name?.length <= 0 ||
        payload.username?.length <= 0 ||
        payload.password?.length <= 0 ||
        payload.confirm_password?.length <= 0
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
        if (payload.password !== payload.confirm_password) {
          dispatch(
            set_toast({
              isOpen: true,
              message: "Password mismatch",
              position: "middle",
              color: "#125B8C",
            })
          );
          return;
        }
        if (!passwordStrength.isStrong) {
          dispatch(
            set_toast({
              isOpen: true,
              message:
                "Password must be at least 8 characters long and include numbers, uppercase letters, and special characters.",
              position: "middle",
              color: "#125B8C",
            })
          );
          return;
        }
        if (isUsernameTaken) {
          dispatch(
            set_toast({
              isOpen: true,
              message: "Username is already taken. Please choose another one",
              position: "middle",
              color: "#125B8C",
            })
          );
          return;
        }
        let res: any = "";
        let message: string = "";
        if (update) {
          res = await UpdateNewUsers(payload);
          message = "Successfully Updated";
        } else {
          res = await AddNewUsers(payload);
          message = "Successfully Added";
        }

        if (res.status === 200) {
          dispatch(
            set_toast({
              isOpen: true,
              message: message,
              position: "middle",
              color: "#125B8C",
            })
          );
          setUserInfo({
            id: "",
            name: "",
            username: "",
            password: "",
            confirm_password: "",
            role: "User",
          });
        }
      }
    },
    [dispatch, userInfo]
  );
  const handleSearch = (ev: Event) => {
    let query = "";
    const target = ev.target as HTMLIonSearchbarElement;
    if (target) query = target.value!.toLowerCase();
    setFetchList({
      page: 1,
      offset: 0,
      limit: 50,
      searchTerm: query,
    });
  };
  const handleSelectedUser = (val: UserNameModel) => {
    setOpenSearchModal({ isOpen: false, modal: "" });
    setUserInfo({
      id: val.id,
      name: val.name,
      username: val.username,
      password: val.password,
      confirm_password: val.password,
      role: val.role,
    });
  };
  const handleOpenSearch = useCallback(() => {
    setFetchList({
      page: 1,
      offset: 1,
      limit: 50,
      searchTerm: "",
    });
    setOpenSearchModal({ isOpen: true, modal: "supplier" });
    dispatch(searchUsers(fetchList));
  }, [dispatch, fetchList]);
  const handleCancel = () => {
    setUserInfo({
      id: "",
      name: "",
      username: "",
      password: "",
      confirm_password: "",
      role: "User",
    });
  };
  return (
    <IonContent>
      <IonSearchbar
        onClick={() => handleOpenSearch()}
        placeholder="Search User"
        autocapitalize={"words"}
      ></IonSearchbar>
      <IonModal
        isOpen={openSearchModal.isOpen}
        onDidDismiss={() => setOpenSearchModal({ isOpen: false, modal: "" })}
        initialBreakpoint={1}
        breakpoints={[0, 0.25, 0.5, 0.75, 1]}
      >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton
                onClick={() => {
                  setFetchList({
                    page: 1,
                    offset: 0,
                    limit: 50,
                    searchTerm: "",
                  });
                  setOpenSearchModal({ isOpen: false, modal: "" });
                }}
              >
                Cancel
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {openSearchModal.modal === "supplier" ? (
            <>
              <IonSearchbar
                placeholder="Search Supplier"
                onIonInput={(e) => handleSearch(e)}
                autocapitalize={"words"}
                debounce={1500}
              ></IonSearchbar>
              <IonList>
                {admin_list_of_users.map((val, index) => (
                  <IonItem onClick={() => handleSelectedUser(val)} key={index}>
                    {/* <IonAvatar slot="start">
                   <IonImg src="https://i.pravatar.cc/300?u=b" />
                 </IonAvatar> */}
                    <IonLabel>
                      <h2>{val.name}</h2>
                      <p>{val.role}</p>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </>
          ) : null}
        </IonContent>
      </IonModal>
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
        {isUsernameTaken && (
          <IonText color="danger" className="username-taken-message">
            Username is already taken. Please choose another one.
          </IonText>
        )}
        <div className="password-strength-container">
          <IonInput
            labelPlacement="floating"
            label="Password"
            name="password"
            type="password"
            debounce={500}
            onIonInput={(e: any) => handleInfoChange(e)}
            class="product-input"
            value={userInfo.password}
          ></IonInput>
          {!passwordStrength.isStrong && userInfo.password !== "" && (
            <IonText color="danger">
              Password must be at least 8 characters long and include numbers,
              uppercase letters, and special characters.
            </IonText>
          )}
          <div
            className="password-strength-bar"
            style={{
              width: `${
                passwordStrength.strength_score > 0
                  ? (passwordStrength.strength_score / 4) * 100
                  : 10
              }%`,

              backgroundColor:
                passwordStrength.strength_score === 0
                  ? "red"
                  : passwordStrength.strength_score < 2
                  ? "red"
                  : passwordStrength.strength_score < 3
                  ? "orange"
                  : "green",
              height: "5px",
              transition: "width 0.3s",
            }}
          />
        </div>
        <div className="password-strength-container">
          <IonInput
            labelPlacement="floating"
            label="Confirm Password"
            name="confirm_password"
            type="password"
            onIonInput={(e: any) => handleInfoChange(e)}
            class="product-input"
            value={userInfo.confirm_password}
          ></IonInput>
          {userInfo.password !== userInfo.confirm_password && (
            <IonText color="danger">Password mismatch</IonText>
          )}
        </div>
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
        {userInfo?.id?.length > 0 ? (
          <div className="add-user-button-container">
            <IonButton
              className="add-user-button"
              color="medium"
              expand="block"
              onClick={() => handleCancel()}
            >
              <IonIcon slot="start" icon={close}></IonIcon>
              Cancel
            </IonButton>
            <IonButton
              className="add-user-button"
              color="medium"
              expand="block"
              onClick={() => handleSaveUser(true)}
            >
              <IonIcon slot="start" icon={saveOutline}></IonIcon>
              Update User
            </IonButton>
          </div>
        ) : (
          <IonButton
            color="medium"
            expand="block"
            onClick={() => handleSaveUser(false)}
          >
            <IonIcon slot="start" icon={saveOutline}></IonIcon>
            Add User
          </IonButton>
        )}
      </div>
    </IonContent>
  );
};
export default AddUserComponent;
