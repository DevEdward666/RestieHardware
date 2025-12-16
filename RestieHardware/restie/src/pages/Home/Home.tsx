import {
  getPlatforms,
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuButton,
  IonModal,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import { notifications } from "ionicons/icons";
import { useCallback, useEffect, useState } from "react";
import { QueryClient } from "react-query";
import { useSelector } from "react-redux";
import categoryIcon from "../../assets/images/icons/category.png";
import ExploreContainer from "../../components/ExploreContainer";
import { GetBrandsModel } from "../../Models/Request/Inventory/InventoryModel";
import { SearchInventoryModel } from "../../Models/Request/searchInventory";
import { GetCategoryModel } from "../../Models/Response/Inventory/GetInventoryModel";
import {
  get_brands_actions,
  get_category_actions,
  getReceivableList,
  set_category_and_brand,
} from "../../Service/Actions/Inventory/InventoryActions";
import { RootStore, useTypedDispatch } from "../../Service/Store";
import "./Home.css";
const queryClient = new QueryClient();
const Tab1: React.FC = () => {
  const list_of_items = useSelector(
    (store: RootStore) => store.InventoryReducer.list_of_items
  );
  const fetch_brands = useSelector(
    (store: RootStore) => store.InventoryReducer.get_brands
  );
  const fetch_category = useSelector(
    (store: RootStore) => store.InventoryReducer.get_category
  );
  const get_category_and_brand = useSelector(
    (store: RootStore) => store.InventoryReducer.set_category_and_brand
  );
  const receivable_list = useSelector(
    (store: RootStore) => store.InventoryReducer.receivable_list
  );
  const dispatch = useTypedDispatch();
  const router = useIonRouter();
  const [totalNotifs, setTotalNotifs] = useState<number>(
    receivable_list.length
  );
  const [openSearchModal, setOpenSearchModal] = useState({
    isOpen: false,
    modal: "",
  });
  const [isFetching, setFetching] = useState<boolean>(false);
  const [getCategoryAndBrand, setCategoryAndBrand] = useState({
    category: "",
    brand: "",
    filter: "",
  });
  const platform = getPlatforms();
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
  const handleCategory = useCallback(
    (category: string) => {
      setCategoryAndBrand({
        category: category,
        brand: get_category_and_brand.brand,
        filter: get_category_and_brand.filter,
      });
      setOpenSearchModal({ isOpen: false, modal: "" })
    },
    [get_category_and_brand]
  );
  const handleBrand = useCallback(
    (brand: string) => {
      setCategoryAndBrand({
        category: get_category_and_brand.category,
        brand: brand,
        filter: get_category_and_brand.filter,
      });
      setOpenSearchModal({ isOpen: false, modal: "" })
    },
    [get_category_and_brand]
  );
  useEffect(() => {
    const initializeCategoryAndBrand = () => {
      dispatch(set_category_and_brand(getCategoryAndBrand));
    };
    initializeCategoryAndBrand();
  }, [dispatch, getCategoryAndBrand]);
  useEffect(() => {
    const initializeBrand = () => {
      const payload: GetBrandsModel = {
        category: getCategoryAndBrand.brand,
      };
      const category_payload: GetCategoryModel = {
        category: getCategoryAndBrand.category,
      };
      dispatch(get_brands_actions(payload));
      dispatch(get_category_actions(category_payload));

      dispatch(getReceivableList());
    };
    initializeBrand();
  }, [dispatch]);

  useEffect(() => {
    const initializeNotification = () => {
      setTotalNotifs(receivable_list.length);
    };
    initializeNotification();
  }, [receivable_list]);

  const handleFilter = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      let filterby = "";
      if (value === "lowhigh") {
        filterby = "asc";
      }
      if (value === "highlow") {
        filterby = "desc";
      }
      if (value === "alphaAZ") {
        filterby = "alphaAZ";
      }
      if (value === "alphaZA") {
        filterby = "alphaZA";
      }

      setCategoryAndBrand({
        category: get_category_and_brand.category,
        brand: get_category_and_brand.brand,
        filter: filterby,
      });
    },
    [get_category_and_brand]
  );
  const handleClickNotification = () => {
    router.push("/notifications");
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
            <IonAccordion value="category">
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
              <div className="brand-content" slot="content">
              <IonSearchbar
                onClick={() => setOpenSearchModal({ isOpen: true, modal: "category" })}
                placeholder="Search Category"
                autocapitalize={"words"}
              ></IonSearchbar>
                {/* {fetch_category.map((val, index) => (
                  <div
                    key={index}
                    className="brands-container"
                    onClick={() => handleCategory(val.category)}
                  >
                    <div className="brands-brand">
                      <IonText className="brand-text">{val.category}</IonText>
                    </div>
                  </div>
                ))} */}
              </div>
              {/* <div slot="content">
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
              </div> */}
            </IonAccordion>
            <IonAccordion value="brand">
              <IonItem slot="header" color="light">
                <div className="category-card-content">
                  <div className="category-card-title-details">
                    <IonImg
                      color="danger"
                      slot="start"
                      className="category-icon-img"
                      src={categoryIcon}
                    ></IonImg>
                    <IonLabel>Brands</IonLabel>
                  </div>
                </div>
              </IonItem>
              <div className="brand-content" slot="content">
              <IonSearchbar
                onClick={() => setOpenSearchModal({ isOpen: true, modal: "brands" })}
                placeholder="Search Brands"
                autocapitalize={"words"}
              ></IonSearchbar>
              </div>
              {/* <div className="brand-content" slot="content">
                {fetch_brands.map((val, index) => (
                  <div
                    key={index}
                    className="brands-container"
                    onClick={() => handleBrand(val.brand)}
                  >
                    <div className="brands-brand">
                      <IonText className="brand-text">{val.brand}</IonText>
                    </div>
                  </div>
                ))}
              </div> */}
            </IonAccordion>
          </IonAccordionGroup>
          <IonItem className="filter">
            <IonLabel>Filter By</IonLabel>
            <IonSelect
              name="filterby"
              onIonChange={(e: any) => handleFilter(e)}
              aria-label="Filter By"
              // value={
              //   customerInformation?.ordertype !== ""
              //     ? customerInformation.ordertype
              //     : "none"
              // }
              className="info-input"
              placeholder="Select Value"
            >
              <IonSelectOption value="lowhigh">
                Price Low to High
              </IonSelectOption>
              <IonSelectOption value="highlow">
                Price High to Low
              </IonSelectOption>
              <IonSelectOption value="alphaAZ">
                Alphabetical A-Z
              </IonSelectOption>
              <IonSelectOption value="alphaZA">
                Alphabetical Z-A
              </IonSelectOption>
            </IonSelect>
          </IonItem>
          {/* <IonItem
            className="onboarding"
            onClick={() => router.push("/Onboarding")}
          >
            Onboarding
          </IonItem> */}
        </IonContent>
      </IonMenu>
      <IonPage className="home-page-container" id="main-content">
        <IonHeader className={`home-page-header `}>
          <IonToolbar mode="ios" color="tertiary">
            <IonButtons slot="start">
              <IonMenuButton></IonMenuButton>
            </IonButtons>
            <IonTitle>Home</IonTitle>
            <IonButtons
              className="notification-button"
              slot="end"
              onClick={() => handleClickNotification()}
            >
              <IonIcon
                className="notification-icon"
                icon={notifications}
                size="large"
              ></IonIcon>
              <IonBadge className="notification-badge" color="danger">
                {totalNotifs}
              </IonBadge>
              {/* <IonIcon size="large" aria-hidden="true" icon={notifications}>
                <IonBadge color="danger">1000</IonBadge>
              </IonIcon> */}
            </IonButtons>
          </IonToolbar>
          {/* <IonToolbar
            mode="ios"
            color="tertiary"
            className="home-toolbar-logo-container"
          >
            <div
              className={` ${
                platform.includes("mobileweb") && !platform.includes("tablet")
                  ? ""
                  : "web"
              }`}
            >
              <IonImg src={restielogo} className="home-toolbar-logo"></IonImg>
            </div>
          </IonToolbar> */}
          <IonToolbar mode="ios" color="tertiary">
            <div
              className={`home-search-container ${platform.includes("mobileweb") && !platform.includes("tablet")
                  ? "mobile-container"
                  : "desktop-container"
                }`}
            >
              <IonSearchbar
                className={`home-search ${platform.includes("mobileweb") && !platform.includes("tablet")
                    ? "mobile"
                    : "desktop"
                  }`}
                debounce={2000}
                onIonInput={(e) => handleSearch(e)}
                mode="ios"
                autocapitalize={"words"}
                color="light"
              ></IonSearchbar>
            </div>
          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen className={`home-page-content `}>
          <div className="home-spinner">
            {isFetching && <IonSpinner color="light" name="lines"></IonSpinner>}
          </div>
          <ExploreContainer data={list_of_items} searchItem={fetchList} />
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
                    onClick={() => setOpenSearchModal({ isOpen: false, modal: "" })}
                  >
                    Cancel
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
            {openSearchModal.modal === "category" ? (
                <>
                  <IonSearchbar
                    placeholder="Search Category"
                    onIonInput={(e) => handleSearch(e)}
                    autocapitalize={"words"}
                    debounce={1500}
                  ></IonSearchbar>
                  <IonList>
                    {fetch_category.map((val, index) => (
                      <IonItem
                      onClick={() => handleCategory(val.category)}
                        key={index}
                      >
                        <IonLabel>
                          <h2>{val.category}</h2>
                        </IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                </>
              ) : null}
              {openSearchModal.modal === "brands" ? (
                <>
                  <IonSearchbar
                    placeholder="Search Brands"
                    onIonInput={(e) => handleSearch(e)}
                    autocapitalize={"words"}
                    debounce={1500}
                  ></IonSearchbar>
                  <IonList>
                    {fetch_brands.map((val, index) => (
                      <IonItem
                      onClick={() => handleBrand(val.brand)}
                        key={index}
                      >
                        <IonLabel>
                          <h2>{val.brand}</h2>
                        </IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                </>
              ) : null}
            </IonContent>
          </IonModal>
        </IonContent>
      </IonPage>
    </>
  );
};

export default Tab1;
