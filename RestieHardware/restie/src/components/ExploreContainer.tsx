import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from "@ionic/react";
import "./ExploreContainer.css";
import stock from "../assets/images/stock.png";
interface ContainerProps {
  data: any;
}
interface CardModel {
  title: string;
  price: number;
}
const CardList = (card: CardModel) => (
  <IonCard>
    <img alt={card?.title} src={stock} />
    {/* <IonCardHeader>
      <IonCardTitle>{card.title}</IonCardTitle>
      <IonCardSubtitle>{card.subtitle}</IonCardSubtitle>
    </IonCardHeader> */}

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
  return (
    <div className="container">
      {data?.result?.map((res: any) => (
        <CardList key={res.code} title={res.item} price={res.price} />
      ))}
    </div>
  );
};

export default ExploreContainer;
