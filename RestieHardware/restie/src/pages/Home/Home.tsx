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

const queryClient = new QueryClient();
const Tab1: React.FC = () => {
  const [fetchList, setFetchList] = useState<SearchInventoryModel>({
    page: 1,
    offset: 0, // Assuming offset starts from 0
    limit: 10,
    searchTerm: "",
  });

  const { data, isError, isLoading, isFetching, refetch } = useQuery(
    ["inventorys", fetchList],
    async () => {
      console.log(fetchList);
      if (fetchList.searchTerm.length <= 0) {
        setFetchList({
          page: 1,
          offset: 0,
          limit: 10,
          searchTerm: "",
        });
        return await getAllInventory(fetchList);
      } else {
        return await searchInventory(fetchList);
      }
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const fetchInventory = async () => {
    await refetch();
  };

  useEffect(() => {
    fetchInventory();
  }, [fetchList]);

  const mutation = useMutation(
    async () => {
      if (fetchList.searchTerm.length <= 0) {
        await getAllInventory(fetchList);
      } else {
        await searchInventory(fetchList);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("inventorys");
      },
    }
  );

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
        <IonToolbar mode="ios" color="tertiary">
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
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Home</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="home-spinner">
          {isFetching && <IonSpinner color="light" name="lines"></IonSpinner>}
        </div>
        <ExploreContainer data={data} />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
