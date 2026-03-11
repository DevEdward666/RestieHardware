import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToast,
    IonToolbar,
    useIonRouter,
} from "@ionic/react";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import ImageToInventoryText from "../../components/ImageToInventoryText";
import { Addtocart } from "../../Models/Request/Inventory/InventoryModel";
import { addToCartAction } from "../../Service/Actions/Inventory/InventoryActions";
import { RootStore, useTypedDispatch } from "../../Service/Store";
import { ParsedInventoryRow } from "../../utils/inventoryTextParser";
import { v4 as uuidv4 } from "uuid";

const ScanMaterialsPage: React.FC = () => {
    const dispatch = useTypedDispatch();
    const router = useIonRouter();

    const inventoryList =
        useSelector((store: RootStore) => store.InventoryReducer.list_of_items) || [];
    const cartItems =
        useSelector((store: RootStore) => store.InventoryReducer.add_to_cart) || [];

    const [toast, setToast] = useState({ isOpen: false, message: "", color: "success" });

    const handleImportReady = useCallback(
        (importedRows: ParsedInventoryRow[]) => {
            const validRows = importedRows.filter(
                (r) => r.matched_code && r.qty != null && r.qty > 0
            );
            if (validRows.length === 0) return;

            const existingCartId =
                Array.isArray(cartItems) && cartItems.length > 0
                    ? cartItems[0].cartid
                    : uuidv4();

            const updatedCart: Addtocart[] = Array.isArray(cartItems)
                ? [...cartItems]
                : [];

            validRows.forEach((row) => {
                const inventoryItem = inventoryList.find(
                    (inv) => inv.code === row.matched_code
                );
                const rowQty = row.qty ?? 1;
                const existingIndex = updatedCart.findIndex(
                    (c) => c.code === row.matched_code
                );
                if (existingIndex > -1) {
                    updatedCart[existingIndex] = {
                        ...updatedCart[existingIndex],
                        qty: updatedCart[existingIndex].qty + rowQty,
                    };
                } else {
                    updatedCart.push({
                        cartid: existingCartId,
                        code: row.matched_code!,
                        item: inventoryItem?.item ?? row.raw_text,
                        qty: rowQty,
                        price: inventoryItem?.price ?? 0,
                        image: inventoryItem?.image ?? "",
                        createdAt: Date.now(),
                        status: "pending",
                        discount: 0,
                    });
                }
            });

            dispatch(addToCartAction(updatedCart));
            setToast({
                isOpen: true,
                message: `✅ ${validRows.length} item${validRows.length !== 1 ? "s" : ""} added to cart`,
                color: "success",
            });

            // Navigate back to cart after a short delay
            setTimeout(() => {
                router.push("/home/cart");
            }, 1200);
        },
        [cartItems, inventoryList, dispatch, router]
    );

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar mode="ios" color="tertiary">
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/" text="Back" />
                    </IonButtons>
                    <IonTitle>Scan Materials List</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                <ImageToInventoryText
                    inventoryItems={inventoryList.map((inv) => ({
                        code: inv.code,
                        item: inv.item,
                        category: inv.category,
                        brand: inv.brand,
                    }))}
                    onImportReady={handleImportReady}
                />
            </IonContent>

            <IonToast
                isOpen={toast.isOpen}
                message={toast.message}
                duration={2000}
                color={toast.color as any}
                onDidDismiss={() => setToast((t) => ({ ...t, isOpen: false }))}
            />
        </IonPage>
    );
};

export default ScanMaterialsPage;
