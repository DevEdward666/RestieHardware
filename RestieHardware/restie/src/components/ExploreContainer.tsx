import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  useIonRouter,
} from "@ionic/react";
import "./ExploreContainer.css";
import stock from "../assets/images/stock.png";
import { useCallback } from "react";
import { useTypedDispatch } from "../Service/Store";
import { selectedItem } from "../Service/Actions/Inventory/InventoryActions";
import { InventoryModel } from "../Models/Request/Inventory/InventoryModel";
interface ContainerProps {
  data: any;
}
interface CardModel {
  title: string;
  price: number;
}
interface SelectedItem {
  code: string;
  item: string;
  price: number;
}
const CardList = (card: CardModel) => (
  <IonCard>
    <img alt={card?.title} src={stock} />

    <IonCardContent>
      <div className="inventory-card-content">
        <div className="inventory-card-title">{card?.title}</div>
        <div className="inventory-card-price">
          <span>&#8369;</span>
          {card?.price.toFixed(2)}
        </div>
      </div>
    </IonCardContent>
  </IonCard>
);

const ExploreContainer: React.FC<ContainerProps> = ({ data }) => {
  const dispatch = useTypedDispatch();
  const router = useIonRouter();
  const handleSelectedItem = useCallback((payload: InventoryModel) => {
    dispatch(selectedItem(payload));
    router.push("/selectedItem");
  }, []);
  return (
    <div className="container">
      {data?.result?.map((res: InventoryModel) => (
        <div onClick={() => handleSelectedItem(res)} key={res.code}>
          <CardList title={res.item} price={res.price} />
        </div>
      ))}
    </div>
  );
};

export default ExploreContainer;
