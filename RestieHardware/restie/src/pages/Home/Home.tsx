import {
  getPlatforms,
  IonBadge,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
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
import {
  notifications,
  close,
  pricetagOutline,
  layersOutline,
  funnelOutline,
  storefrontOutline,
  cameraOutline,
} from "ionicons/icons";
import { useCallback, useEffect, useState } from "react";
import { QueryClient } from "react-query";
import { useSelector } from "react-redux";
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
  const handleMenuWillOpen = () => {
    (document.activeElement as HTMLElement)?.blur();
  };
  return (
    <>
      {/* ── Side Menu ───────────────────────────────── */}
      <IonMenu type="push" contentId="main-content" onIonWillOpen={handleMenuWillOpen} className="home-menu">
        <IonHeader>
          <IonToolbar color="tertiary">
            <IonTitle>Filters</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="home-menu-content">

          {/* Active filter chips */}
          {(get_category_and_brand.category || get_category_and_brand.brand) && (
            <div className="home-active-filters">
              <p className="home-filter-label">Active filters</p>
              <div className="home-filter-chips">
                {get_category_and_brand.category && (
                  <IonChip color="tertiary" className="home-filter-chip">
                    <IonIcon icon={layersOutline} />
                    <IonLabel>{get_category_and_brand.category}</IonLabel>
                    <IonIcon icon={close} onClick={() => setCategoryAndBrand(p => ({ ...p, category: "" }))} />
                  </IonChip>
                )}
                {get_category_and_brand.brand && (
                  <IonChip color="tertiary" className="home-filter-chip">
                    <IonIcon icon={storefrontOutline} />
                    <IonLabel>{get_category_and_brand.brand}</IonLabel>
                    <IonIcon icon={close} onClick={() => setCategoryAndBrand(p => ({ ...p, brand: "" }))} />
                  </IonChip>
                )}
              </div>
            </div>
          )}

          {/* Category section */}
          <div className="home-menu-section">
            <div className="home-menu-section-header">
              <IonIcon icon={layersOutline} className="home-menu-section-icon" />
              <span className="home-menu-section-title">Category</span>
            </div>
            <IonButton
              fill="outline"
              expand="block"
              className="home-menu-picker-btn"
              onClick={() => setOpenSearchModal({ isOpen: true, modal: "category" })}
            >
              {get_category_and_brand.category || "Select Category"}
            </IonButton>
          </div>

          {/* Brand section */}
          <div className="home-menu-section">
            <div className="home-menu-section-header">
              <IonIcon icon={storefrontOutline} className="home-menu-section-icon" />
              <span className="home-menu-section-title">Brand</span>
            </div>
            <IonButton
              fill="outline"
              expand="block"
              className="home-menu-picker-btn"
              onClick={() => setOpenSearchModal({ isOpen: true, modal: "brands" })}
            >
              {get_category_and_brand.brand || "Select Brand"}
            </IonButton>
          </div>

          {/* Sort section */}
          <div className="home-menu-section">
            <div className="home-menu-section-header">
              <IonIcon icon={funnelOutline} className="home-menu-section-icon" />
              <span className="home-menu-section-title">Sort By</span>
            </div>
            <IonSelect
              name="filterby"
              onIonChange={(e: any) => handleFilter(e)}
              aria-label="Sort By"
              className="home-menu-select"
              placeholder="Default"
              interface="popover"
            >
              <IonSelectOption value="lowhigh">Price: Low → High</IonSelectOption>
              <IonSelectOption value="highlow">Price: High → Low</IonSelectOption>
              <IonSelectOption value="alphaAZ">A → Z</IonSelectOption>
              <IonSelectOption value="alphaZA">Z → A</IonSelectOption>
            </IonSelect>
          </div>

          {/* Reset */}
          {(get_category_and_brand.category || get_category_and_brand.brand || get_category_and_brand.filter) && (
            <IonButton
              expand="block"
              fill="clear"
              color="danger"
              className="home-reset-btn"
              onClick={() => setCategoryAndBrand({ category: "", brand: "", filter: "" })}
            >
              Reset All Filters
            </IonButton>
          )}

        </IonContent>
      </IonMenu>

      {/* ── Main Page ───────────────────────────────── */}
      <IonPage className="home-page-container" id="main-content">
        <IonHeader className="home-page-header">
          <IonToolbar mode="ios" color="tertiary">
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle className="home-title">

              Restie Hardware
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => router.push("/scan-materials")} aria-label="Scan Materials List">
                <IonIcon icon={cameraOutline} />
              </IonButton>
            </IonButtons>
            <IonButtons slot="end" className="home-notif-btn" onClick={handleClickNotification}>
              <IonIcon icon={notifications} className="home-notif-icon" />
              {totalNotifs > 0 && (
                <IonBadge color="danger" className="home-notif-badge">
                  {totalNotifs > 99 ? "99+" : totalNotifs}
                </IonBadge>
              )}
            </IonButtons>
          </IonToolbar>

          <IonToolbar mode="ios" color="tertiary" className="home-search-toolbar">
            <div className={`home-search-container ${platform.includes("mobileweb") && !platform.includes("tablet") ? "mobile-container" : "desktop-container"}`}>
              <IonSearchbar
                className={`home-search ${platform.includes("mobileweb") && !platform.includes("tablet") ? "mobile" : "desktop"}`}
                debounce={2000}
                onIonInput={(e) => handleSearch(e)}
                mode="ios"
                autocapitalize="words"
                placeholder="Search products…"
                color="light"
              />
            </div>
          </IonToolbar>

          {/* Active filter chips strip */}
          {(get_category_and_brand.category || get_category_and_brand.brand || get_category_and_brand.filter) && (
            <div className="home-chips-strip">
              {get_category_and_brand.category && (
                <IonChip className="home-chip" onClick={() => setCategoryAndBrand(p => ({ ...p, category: "" }))}>
                  <IonIcon icon={layersOutline} />
                  <IonLabel>{get_category_and_brand.category}</IonLabel>
                  <IonIcon icon={close} />
                </IonChip>
              )}
              {get_category_and_brand.brand && (
                <IonChip className="home-chip" onClick={() => setCategoryAndBrand(p => ({ ...p, brand: "" }))}>
                  <IonIcon icon={storefrontOutline} />
                  <IonLabel>{get_category_and_brand.brand}</IonLabel>
                  <IonIcon icon={close} />
                </IonChip>
              )}
              {get_category_and_brand.filter && (
                <IonChip className="home-chip" onClick={() => setCategoryAndBrand(p => ({ ...p, filter: "" }))}>
                  <IonIcon icon={funnelOutline} />
                  <IonLabel>
                    {{ lowhigh: "Price ↑", highlow: "Price ↓", alphaAZ: "A→Z", alphaZA: "Z→A" }[get_category_and_brand.filter] ?? get_category_and_brand.filter}
                  </IonLabel>
                  <IonIcon icon={close} />
                </IonChip>
              )}
            </div>
          )}
        </IonHeader>

        <IonContent fullscreen className="home-page-content">
          {isFetching && (
            <div className="home-spinner">
              <IonSpinner color="medium" name="crescent" />
            </div>
          )}
          <ExploreContainer data={list_of_items} searchItem={fetchList} />

          {/* Category / Brand picker modal */}
          <IonModal
            isOpen={openSearchModal.isOpen}
            onDidDismiss={() => setOpenSearchModal({ isOpen: false, modal: "" })}
            initialBreakpoint={0.75}
            breakpoints={[0, 0.5, 0.75, 1]}
          >
            <IonHeader>
              <IonToolbar>
                <IonTitle>
                  {openSearchModal.modal === "category" ? "Select Category" : "Select Brand"}
                </IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={() => setOpenSearchModal({ isOpen: false, modal: "" })}>
                    <IonIcon icon={close} />
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
                    autocapitalize="words"
                    debounce={1500}
                  />
                  <IonList>
                    {fetch_category.map((val, index) => (
                      <IonItem button key={index} lines="inset" onClick={() => handleCategory(val.category)}>
                        <IonIcon icon={layersOutline} slot="start" color="medium" />
                        <IonLabel>{val.category}</IonLabel>
                        {get_category_and_brand.category === val.category && (
                          <IonBadge slot="end" color="tertiary">✓</IonBadge>
                        )}
                      </IonItem>
                    ))}
                  </IonList>
                </>
              ) : (
                <>
                  <IonSearchbar
                    placeholder="Search Brand"
                    onIonInput={(e) => handleSearch(e)}
                    autocapitalize="words"
                    debounce={1500}
                  />
                  <IonList>
                    {fetch_brands.map((val, index) => (
                      <IonItem button key={index} lines="inset" onClick={() => handleBrand(val.brand)}>
                        <IonIcon icon={storefrontOutline} slot="start" color="medium" />
                        <IonLabel>{val.brand}</IonLabel>
                        {get_category_and_brand.brand === val.brand && (
                          <IonBadge slot="end" color="tertiary">✓</IonBadge>
                        )}
                      </IonItem>
                    ))}
                  </IonList>
                </>
              )}
            </IonContent>
          </IonModal>
        </IonContent>
      </IonPage>
    </>
  );
};

export default Tab1;

