import {
  IonAccordion,
  IonAccordionGroup,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonImg,
  IonItem,
  IonLabel,
  IonMenu,
  IonMenuButton,
  IonPage,
  IonSearchbar,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useState } from "react";
import { QueryClient } from "react-query";
import { useSelector } from "react-redux";
import { SearchInventoryModel } from "../../Models/Request/searchInventory";
import { RootStore, useTypedDispatch } from "../../Service/Store";
import restielogo from "../../assets/images/Icon@3.png";
import ExploreContainer from "../../components/ExploreContainer";
import "./Home.css";
import plumbing from "../../assets/images/Categories/Plumbing.png";
import electrical from "../../assets/images/Categories/Electrical.png";
import lumber from "../../assets/images/Categories/Lumber.png";
import paint from "../../assets/images/Categories/Paint.png";
import categoryIcon from "../../assets/images/icons/category.png";

const queryClient = new QueryClient();
const Tab1: React.FC = () => {
  const list_of_items = useSelector(
    (store: RootStore) => store.InventoryReducer.list_of_items
  );

  const dispatch = useTypedDispatch();
  const [isFetching, setFetching] = useState<boolean>(false);
  const [getCategory, setCategory] = useState<string>();

  const [fetchList, setFetchList] = useState<SearchInventoryModel>({
    page: 1,
    offset: 0, // Assuming offset starts from 0
    limit: 10,
    searchTerm: "",
  });

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
  const handleCategory = (category: string) => {
    setCategory(category);
  };
  return (
    <>
      <IonMenu type={"push"} contentId="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonAccordionGroup>
            <IonAccordion value="first">
              <IonItem slot="header" color="light">
                <div className="category-card-content">
                  <div className="category-card-title-details">
                    <IonImg
                      color="danger"
                      slot="start"
                      className="category-icon-img"
                      src={categoryIcon}
                    ></IonImg>
                    <IonLabel>Categories</IonLabel>
                  </div>
                </div>
              </IonItem>
              <div slot="content">
                <div
                  className="categories-container"
                  onClick={() => handleCategory("Electrical")}
                >
                  <div className="categories-category">
                    <IonText className="category-text">Electrical</IonText>
                    <IonImg src={electrical} className="category-img"></IonImg>
                  </div>
                </div>
                <div
                  className="categories-container"
                  onClick={() => handleCategory("Plumbing")}
                >
                  <div className="categories-category">
                    <IonText className="category-text">Plumbing</IonText>
                    <IonImg src={plumbing} className="category-img"></IonImg>
                  </div>
                </div>
                <div
                  className="categories-container"
                  onClick={() => handleCategory("Paints")}
                >
                  <div className="categories-category">
                    <IonText className="category-text">Paints</IonText>
                    <IonImg src={paint} className="category-img"></IonImg>
                  </div>
                </div>
                <div
                  className="categories-container"
                  onClick={() => handleCategory("Lumber")}
                >
                  <div className="categories-category">
                    <IonText className="category-text">
                      Lumber & Building Materials
                    </IonText>
                    <IonImg src={lumber} className="category-img"></IonImg>
                  </div>
                </div>
              </div>
            </IonAccordion>
          </IonAccordionGroup>
        </IonContent>
      </IonMenu>
      <IonPage className="home-page-container" id="main-content">
        <IonHeader className="home-page-header">
          <IonToolbar mode="ios" color="tertiary">
            <IonButtons slot="start">
              <IonMenuButton></IonMenuButton>
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
          <ExploreContainer
            data={list_of_items}
            searchItem={fetchList}
            category={getCategory!}
          />
        </IonContent>
      </IonPage>
    </>
  );
};

export default Tab1;
