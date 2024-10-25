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
import { saveOutline } from "ionicons/icons";
import { useCallback, useEffect, useState } from "react";
import { PostAddNewUser } from "../../../../Models/Request/Admin/AdminRequestModel";
import {
  AddNewUsers,
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
    role: "",
  });
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
    },
    []
  );
  const handleSaveUser = useCallback(
    async (update: boolean) => {
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
                      <p>{val.username}</p>
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
        {userInfo?.id?.length > 0 ? (
          <IonButton
            color="medium"
            expand="block"
            onClick={() => handleSaveUser(true)}
          >
            <IonIcon slot="start" icon={saveOutline}></IonIcon>
            Update User
          </IonButton>
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
