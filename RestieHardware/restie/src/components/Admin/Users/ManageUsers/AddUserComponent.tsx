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
    <IonContent className="ani-content">
      {/* ── User search modal ── */}
      <IonModal
        isOpen={openSearchModal.isOpen}
        onDidDismiss={() => setOpenSearchModal({ isOpen: false, modal: "" })}
        initialBreakpoint={1}
        breakpoints={[0, 0.25, 0.5, 0.75, 1]}
      >
        <IonHeader>
          <IonToolbar color="tertiary">
            <IonButtons slot="start">
              <IonButton onClick={() => { setFetchList({ page: 1, offset: 0, limit: 50, searchTerm: "" }); setOpenSearchModal({ isOpen: false, modal: "" }); }}>
                Close
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonSearchbar
            placeholder="Search user"
            onIonInput={(e) => handleSearch(e)}
            autocapitalize="words"
            debounce={1500}
          />
          <IonList>
            {admin_list_of_users.map((val, index) => (
              <IonItem button onClick={() => handleSelectedUser(val)} key={index}>
                <IonLabel>
                  <h2>{val.name}</h2>
                  <p>{val.role}</p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </IonModal>

      <div className="ani-container">
        <div className="ani-inner">
          <div className="ani-card">
            <p className="ani-card-title">
              {userInfo.id ? "Update User" : "Add User"}
            </p>

            {/* Search existing */}
            <div className="ani-field">
              <IonSearchbar
                onClick={handleOpenSearch}
                placeholder="Search existing user…"
                autocapitalize="words"
                style={{ "--background": "#f4f5f8", "--border-radius": "10px", padding: 0 }}
              />
            </div>

            <div className="ani-field">
              <span className="ani-label">Full Name</span>
              <IonInput className="ani-input" name="name" type="text" placeholder="Full name"
                onIonInput={(e: any) => handleInfoChange(e)} value={userInfo.name} />
            </div>

            <div className="ani-field">
              <span className="ani-label">Username</span>
              <IonInput className="ani-input" name="username" type="text" placeholder="Username"
                onIonInput={(e: any) => handleInfoChange(e)} value={userInfo.username} />
              {isUsernameTaken && (
                <span className="ani-error-text">Username is already taken. Please choose another one.</span>
              )}
            </div>

            <div className="ani-field">
              <span className="ani-label">Password</span>
              <IonInput className="ani-input" name="password" type="password" placeholder="Password"
                debounce={500} onIonInput={(e: any) => handleInfoChange(e)} value={userInfo.password} />
              {userInfo.password !== "" && (
                <>
                  <div className="ani-strength-bar-wrap">
                    <div
                      className="ani-strength-bar"
                      style={{
                        width: `${passwordStrength.strength_score > 0 ? (passwordStrength.strength_score / 4) * 100 : 10}%`,
                        backgroundColor:
                          passwordStrength.strength_score < 2 ? "#fe3434"
                            : passwordStrength.strength_score < 3 ? "#ffa807"
                              : "#22c55e",
                      }}
                    />
                  </div>
                  {!passwordStrength.isStrong && (
                    <span className="ani-error-text">
                      Min 8 chars with numbers, uppercase & special characters.
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="ani-field">
              <span className="ani-label">Confirm Password</span>
              <IonInput className="ani-input" name="confirm_password" type="password" placeholder="Re-enter password"
                onIonInput={(e: any) => handleInfoChange(e)} value={userInfo.confirm_password} />
              {userInfo.confirm_password !== "" && userInfo.password !== userInfo.confirm_password && (
                <span className="ani-error-text">Passwords do not match</span>
              )}
            </div>

            <div className="ani-field">
              <span className="ani-label">Role</span>
              <IonSelect className="ani-select" name="role" aria-label="Role"
                placeholder="Select role" onIonChange={(e: any) => handleInfoChange(e)} value={userInfo.role}>
                <IonSelectOption value="Super Admin">Super Admin</IonSelectOption>
                <IonSelectOption value="Admin">Admin</IonSelectOption>
                <IonSelectOption value="User">Staff</IonSelectOption>
              </IonSelect>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky action bar ── */}
      <div className="ani-action-bar">
        {userInfo.id && (
          <button className="ani-cancel-btn" onClick={handleCancel}>
            <IonIcon icon={close} /> Cancel
          </button>
        )}
        <button className="ani-submit-btn" onClick={() => handleSaveUser(!!userInfo.id)}>
          <IonIcon icon={saveOutline} />
          {userInfo.id ? "Update User" : "Add User"}
        </button>
      </div>
    </IonContent>
  );
};
export default AddUserComponent;
