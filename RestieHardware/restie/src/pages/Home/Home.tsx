import {
  IonButtons,
  IonContent,
  IonHeader,
  IonImg,
  IonMenuButton,
  IonPage,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { SearchInventoryModel } from "../../Models/Request/searchInventory";
import restielogo from "../../assets/images/Icon@3.png";
import ExploreContainer from "../../components/ExploreContainer";
import "./Home.css";
import { useEffect, useState } from "react";
import { QueryClient, useMutation, useQuery } from "react-query";
import {
  getAllInventory,
  searchInventory,
} from "../../Service/API/Inventory/InventoryApi";
import { RootStore, useTypedDispatch } from "../../Service/Store";
import {
  getInventory,
  searchInventoryList,
} from "../../Service/Actions/Inventory/InventoryActions";
import { useSelector } from "react-redux";

const queryClient = new QueryClient();
const Tab1: React.FC = () => {
  const list_of_items = useSelector(
    (store: RootStore) => store.InventoryReducer.list_of_items
  );

  const dispatch = useTypedDispatch();
  const [isFetching, setFetching] = useState<boolean>(false);
  const [fetchList, setFetchList] = useState<SearchInventoryModel>({
    page: 1,
    offset: 0, // Assuming offset starts from 0
    limit: 10,
    searchTerm: "",
  });
  useEffect(() => {
    const getInventoryInitialize = async () => {
      if (fetchList.searchTerm.length <= 0) {
        dispatch(
          getInventory({
            page: 1,
            offset: 0,
            limit: 10,
            searchTerm: "",
          })
        );
      } else {
        const res = await dispatch(searchInventoryList(fetchList));
      }
    };
    getInventoryInitialize();
  }, [dispatch, fetchList]);

  const handleSearch = (ev: Event) => {
    let query = "";
    const target = ev.target as HTMLIonSearchbarElement;
    if (target) query = target.value!.toLowerCase();
    setFetchList({
      page: 1,
      offset: 1,
      limit: 1000,
      searchTerm: query,
    });
  };

  return (
    <IonPage className="home-page-container">
      <IonHeader className="home-page-header">
        <IonToolbar mode={"md"} color="tertiary">
          <IonButtons slot="start">
            <IonMenuButton autoHide={false}></IonMenuButton>
          </IonButtons>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
        <IonToolbar
          mode="ios"
          color="tertiary"
          className="home-toolbar-logo-container"
        >
          <IonImg src={restielogo} className="home-toolbar-logo"></IonImg>
        </IonToolbar>
        <IonToolbar mode="ios" color="tertiary">
          <IonSearchbar
            debounce={2000}
            onIonInput={(e) => handleSearch(e)}
            mode="ios"
            autocapitalize={"words"}
            color="light"
          ></IonSearchbar>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="home-page-content">
        <div className="home-spinner">
          {isFetching && <IonSpinner color="light" name="lines"></IonSpinner>}
        </div>
        <ExploreContainer data={list_of_items} />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
