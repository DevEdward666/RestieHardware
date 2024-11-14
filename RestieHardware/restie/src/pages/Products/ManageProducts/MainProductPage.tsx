import {
  getPlatforms,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import restielogo from "../../../assets/images/Icon@3.png";
import MainProductComponent from "../../../components/Admin/Products/ManageProducts/MainProductComponent";
import "./MainProductPage.css";
import { arrowBack } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useTypedDispatch } from "../../../Service/Store";
import {
  searchAdminInventoryList,
  searchSupplier,
} from "../../../Service/Actions/Admin/AdminActions";
import { SearchInventoryModel } from "../../../Models/Request/searchInventory";
const MainProductPage: React.FC = () => {
  const platform = getPlatforms();
  const router = useIonRouter();
  const dispatch = useTypedDispatch();
  const [fetchList, setFetchList] = useState<SearchInventoryModel>({
    page: 1,
    offset: 0, // Assuming offset starts from 0
    limit: 50,
    searchTerm: "",
  });
  useEffect(() => {
    const searchInventory = () => {
      dispatch(searchAdminInventoryList(fetchList));
    };
    const searchSuppliers = () => {
      dispatch(searchSupplier(fetchList));
    };
    searchInventory();
    searchSuppliers();
  }, [dispatch, fetchList]);
  return (
    <IonPage className="main-product-page-container">
      <IonHeader className="main-product-page-header">
        <IonToolbar mode="ios" color="tertiary">
          <IonButtons slot="start" onClick={() => router.push("/home/profile")}>
            <IonIcon slot="icon-only" icon={arrowBack}></IonIcon>
          </IonButtons>
          <IonTitle>Manage Product</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="main-product-page-button-container">
          <MainProductComponent />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MainProductPage;
