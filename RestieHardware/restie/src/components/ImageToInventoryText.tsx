import React, { useMemo, useRef, useState } from "react";
import {
    IonBadge,
    IonButton,
    IonCheckbox,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonChip,
    IonCol,
    IonGrid,
    IonIcon,
    IonImg,
    IonItem,
    IonLabel,
    IonList,
    IonProgressBar,
    IonRow,
    IonSpinner,
    IonText,
    IonToast,
} from "@ionic/react";
import {
    cameraOutline,
    cloudUploadOutline,
    copyOutline,
    imagesOutline,
    sendOutline,
    sparklesOutline,
} from "ionicons/icons";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import {
    extractAndParseInventoryFromImage,
    ParsedInventoryRow,
    InventoryItem,
    rowsToCsv,
} from "../utils/inventoryTextParser";

type ImageToInventoryTextProps = {
    inventoryItems: Array<{
        code: string;
        item: string;
        category?: string;
        brand?: string;
    }>;
    onImportReady?: (rows: ParsedInventoryRow[]) => void;
};

type ImageSource = "camera" | "gallery" | "file" | null;

const ImageToInventoryText: React.FC<ImageToInventoryTextProps> = ({
    inventoryItems,
    onImportReady,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [imageSource, setImageSource] = useState<ImageSource>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [rows, setRows] = useState<ParsedInventoryRow[]>([]);
    const [extractedText, setExtractedText] = useState<string>("");
    const [ocrSource, setOcrSource] = useState<"live" | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [selectedRowIndexes, setSelectedRowIndexes] = useState<number[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const typedInventoryItems = useMemo<InventoryItem[]>(() => inventoryItems ?? [], [inventoryItems]);

    const matchedRows = rows.filter((r) => !r.needs_review && Boolean(r.matched_code));
    const readyRows = matchedRows;
    const readyCount = readyRows.length;
    const reviewCount = rows.filter((r) => r.needs_review).length;
    const selectedReadyCount = selectedRowIndexes.filter((index) => !rows[index]?.needs_review).length;

    // ---------------------------------------------------------------------------
    // Image selection
    // ---------------------------------------------------------------------------
    const applyPreview = (file: File, source: ImageSource) => {
        setSelectedFile(file);
        setImageSource(source);
        setPreviewUrl(URL.createObjectURL(file));
        setRows([]);
        setError(null);
        setExtractedText("");
        setOcrSource(null);
        setSelectedRowIndexes([]);
    };

    const handleTakePhoto = async () => {
        try {
            const photo = await Camera.getPhoto({
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera,
                quality: 85,
            });
            if (!photo.dataUrl) return;
            const res = await fetch(photo.dataUrl);
            const blob = await res.blob();
            const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
            applyPreview(file, "camera");
        } catch {
            // Camera not supported — fall back to file input
            fileInputRef.current?.click();
        }
    };

    const handleOpenGallery = async () => {
        try {
            const photo = await Camera.getPhoto({
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Photos,
                quality: 85,
            });
            if (!photo.dataUrl) return;
            const res = await fetch(photo.dataUrl);
            const blob = await res.blob();
            const file = new File([blob], "gallery_pick.jpg", { type: "image/jpeg" });
            applyPreview(file, "gallery");
        } catch {
            // Fallback to file input
            if (fileInputRef.current) {
                fileInputRef.current.removeAttribute("capture");
                fileInputRef.current.click();
            }
        }
    };

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        if (!file) return;
        applyPreview(file, "file");
    };

    // ---------------------------------------------------------------------------
    // OCR extraction
    // ---------------------------------------------------------------------------
    const handleExtractText = async () => {
        if (!selectedFile) {
            setError("Please select an image first.");
            return;
        }

        setIsExtracting(true);
        setProgress(0.1);
        setError(null);

        try {
            setProgress(0.35);
            const result = await extractAndParseInventoryFromImage(selectedFile, typedInventoryItems);
            setProgress(0.85);

            setExtractedText(result.extractedText);
            setRows(result.rows);
            setOcrSource(result.ocrSource ?? "live");
            setSelectedRowIndexes(
                result.rows
                    .map((row, index) => (!row.needs_review && row.matched_code ? index : -1))
                    .filter((index) => index >= 0)
            );

            if (result.rows.length === 0) {
                setError("No valid inventory rows were parsed from the image.");
            }

            setProgress(1);
            const ready = result.rows.filter((r) => !r.needs_review).length;
            const review = result.rows.filter((r) => r.needs_review).length;
            setToastMessage(
                `Extracted ${result.rows.length} row(s): ${ready} ready, ${review} need review.`
            );
        } catch (ex) {
            const message = ex instanceof Error ? ex.message : "Failed to extract text from image.";
            setError(message);
        } finally {
            setIsExtracting(false);
            setTimeout(() => setProgress(0), 600);
        }
    };

    // ---------------------------------------------------------------------------
    // CSV copy
    // ---------------------------------------------------------------------------
    const handleCopyCsv = async () => {
        if (!rows.length) {
            setToastMessage("No rows available to copy.");
            return;
        }
        try {
            await navigator.clipboard.writeText(rowsToCsv(rows));
            setToastMessage("Copied CSV to clipboard.");
        } catch {
            setError("Could not copy CSV. Clipboard permission may be blocked.");
        }
    };

    // ---------------------------------------------------------------------------
    // Import to cart
    // ---------------------------------------------------------------------------
    const handleSendToImport = () => {
        if (!selectedReadyCount) {
            setToastMessage("No import-ready rows available.");
            return;
        }
        const importRows = selectedRowIndexes
            .map((index) => rows[index])
            .filter((row): row is ParsedInventoryRow => Boolean(row && !row.needs_review));
        onImportReady?.(importRows);
        setToastMessage(
            `Added ${importRows.length} matched item(s) to cart.${reviewCount ? ` ${reviewCount} row(s) still need review.` : ""}`
        );
    };

    const toggleRowSelection = (index: number, checked: boolean) => {
        setSelectedRowIndexes((prev) => {
            if (checked) {
                return prev.includes(index) ? prev : [...prev, index].sort((a, b) => a - b);
            }
            return prev.filter((value) => value !== index);
        });
    };

    const handleSelectAllReady = () => {
        setSelectedRowIndexes(rows
            .map((row, index) => (!row.needs_review && row.matched_code ? index : -1))
            .filter((index) => index >= 0));
    };

    const handleClearSelection = () => {
        setSelectedRowIndexes([]);
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------
    return (
        <IonCard>
            <IonCardHeader>
                <IonCardTitle>Image to Inventory</IonCardTitle>
                <IonCardSubtitle>
                    Photograph a handwritten materials list and add matched items to cart.
                </IonCardSubtitle>
            </IonCardHeader>

            <IonCardContent>
                {/* Hidden fallback file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileInputChange}
                />

                {/* Camera / Gallery / File buttons */}
                <IonGrid>
                    <IonRow>
                        <IonCol size="6">
                            <IonButton expand="block" onClick={handleTakePhoto} disabled={isExtracting}>
                                <IonIcon icon={cameraOutline} slot="start" />
                                Take Photo
                            </IonButton>
                        </IonCol>
                        <IonCol size="6">
                            <IonButton expand="block" fill="outline" onClick={handleOpenGallery} disabled={isExtracting}>
                                <IonIcon icon={imagesOutline} slot="start" />
                                Gallery
                            </IonButton>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol size="12">
                            <IonButton
                                expand="block"
                                fill="clear"
                                size="small"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isExtracting}
                            >
                                <IonIcon icon={cloudUploadOutline} slot="start" />
                                Upload from Files
                            </IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>

                {/* Image preview + source badge */}
                {previewUrl && (
                    <IonList>
                        <IonItem lines="none">
                            <div style={{ width: "100%", position: "relative" }}>
                                <IonImg
                                    src={previewUrl}
                                    alt="Selected materials list"
                                    style={{ borderRadius: 12, maxHeight: 280, objectFit: "cover", width: "100%" }}
                                />
                                {imageSource && (
                                    <IonBadge
                                        color={
                                            imageSource === "camera"
                                                ? "primary"
                                                : imageSource === "gallery"
                                                    ? "secondary"
                                                    : "medium"
                                        }
                                        style={{ position: "absolute", top: 8, right: 8, textTransform: "capitalize" }}
                                    >
                                        {imageSource === "camera"
                                            ? "📷 Camera"
                                            : imageSource === "gallery"
                                                ? "🖼 Gallery"
                                                : "📁 File"}
                                    </IonBadge>
                                )}
                            </div>
                        </IonItem>
                    </IonList>
                )}

                {/* Extract button */}
                <IonGrid>
                    <IonRow>
                        <IonCol size="12">
                            <IonButton
                                expand="block"
                                color="tertiary"
                                onClick={handleExtractText}
                                disabled={isExtracting || !selectedFile}
                            >
                                <IonIcon icon={sparklesOutline} slot="start" />
                                {isExtracting ? "Extracting..." : "Extract Text"}
                            </IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>

                {/* OCR source indicator */}
                {ocrSource && (
                    <div style={{ marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>
                        <IonChip color="success" outline>
                            <IonLabel>🟢</IonLabel>
                        </IonChip>
                    </div>
                )}

                {/* Loading progress */}
                {isExtracting && (
                    <IonItem lines="none">
                        <IonLabel>
                            <IonSpinner name="dots" style={{ marginRight: 8 }} />
                            Processing and matching items...
                        </IonLabel>
                        <IonProgressBar value={progress} />
                    </IonItem>
                )}

                {/* Error */}
                {error && (
                    <IonText color="danger">
                        <p style={{ padding: "0 8px" }}>{error}</p>
                    </IonText>
                )}

                {/* Summary chips */}
                {!!rows.length && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
                        {/* <IonChip color="medium">
                            <IonLabel>Total: {rows.length}</IonLabel>
                        </IonChip>
                        <IonChip color="success">
                            <IonLabel>✅ Ready: {readyCount}</IonLabel>
                        </IonChip> */}
                        {/* <IonChip color="warning">
                            <IonLabel>⚠ Review: {reviewCount}</IonLabel>
                        </IonChip> */}
                    </div>
                )}

                {/* Action buttons */}
                <IonGrid>
                    <IonRow>
                        <IonCol size="12" sizeMd="6">
                            <IonButton
                                expand="block"
                                fill="outline"
                                onClick={handleCopyCsv}
                                disabled={!rows.length}
                            >
                                <IonIcon icon={copyOutline} slot="start" />
                                Copy as CSV
                            </IonButton>
                        </IonCol>
                        <IonCol size="12" sizeMd="6">
                            <IonButton
                                expand="block"
                                color="success"
                                onClick={handleSendToImport}
                                disabled={selectedReadyCount === 0}
                            >
                                <IonIcon icon={sendOutline} slot="start" />
                                Add to Cart ({selectedReadyCount})
                            </IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>

                {/* Selection toolbar */}
                {!!readyRows.length && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, marginBottom: 8 }}>
                        <IonButton size="small" fill="outline" onClick={handleSelectAllReady} disabled={!readyCount}>
                            Select All Ready
                        </IonButton>
                        <IonButton size="small" fill="clear" onClick={handleClearSelection} disabled={!selectedRowIndexes.length}>
                            Clear Selection
                        </IonButton>
                    </div>
                )}

                {/* Results cards */}
                {!!readyRows.length && (
                    <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                        {rows.map((row, i) => {
                            if (row.needs_review || !row.matched_code) {
                                return null;
                            }

                            const selectable = !row.needs_review && Boolean(row.matched_code);
                            const isSelected = selectedRowIndexes.includes(i);

                            return (
                                <IonCard
                                    key={i}
                                    style={{
                                        margin: 0,
                                        border: isSelected ? "2px solid var(--ion-color-success)" : "1px solid rgba(0,0,0,0.08)",
                                        boxShadow: isSelected ? "0 0 0 4px rgba(var(--ion-color-success-rgb), 0.12)" : undefined,
                                        background: row.needs_review ? "#fff8e1" : "#ffffff",
                                        borderRadius: 14,
                                    }}
                                >
                                    <IonCardContent>
                                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                                                    <IonChip color={row.needs_review ? "warning" : "success"}>
                                                        <IonLabel>{row.needs_review ? "⚠ Needs Review" : "✅ Matched"}</IonLabel>
                                                    </IonChip>
                                                    {row.matched_code && (
                                                        <IonChip color="tertiary" outline>
                                                            <IonLabel>{row.matched_code}</IonLabel>
                                                        </IonChip>
                                                    )}
                                                </div>

                                                <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 6, wordBreak: "break-word" }}>
                                                    {row.description}
                                                </div>

                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, fontSize: "0.9rem" }}>
                                                    <div><strong>Qty:</strong> {row.qty ?? "—"}</div>
                                                    <div><strong>UOM:</strong> {row.uom ?? "—"}</div>
                                                    <div><strong>Confidence:</strong> {row.confidence.toFixed(3)}</div>
                                                </div>

                                                {row.specification && (
                                                    <div style={{ marginTop: 8, fontSize: "0.9rem" }}>
                                                        <strong>Specification:</strong> {row.specification}
                                                    </div>
                                                )}

                                                <div style={{ marginTop: 8, fontSize: "0.85rem", color: "var(--ion-color-medium-shade)", wordBreak: "break-word" }}>
                                                    <strong>Normalized:</strong> {row.normalized_item}
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 40 }}>
                                                <IonCheckbox
                                                    checked={isSelected}
                                                    disabled={!selectable}
                                                    onIonChange={(e) => toggleRowSelection(i, Boolean(e.detail.checked))}
                                                    aria-label={`Select ${row.description}`}
                                                />
                                            </div>
                                        </div>
                                    </IonCardContent>
                                </IonCard>
                            );
                        })}
                    </div>
                )}

                {!readyRows.length && !!rows.length && (
                    <IonCard style={{ marginTop: 12 }}>
                        <IonCardContent>
                            <IonText color="medium">
                                No matched items are ready to show yet. Try a clearer photo or review the extracted content again.
                            </IonText>
                        </IonCardContent>
                    </IonCard>
                )}

                <IonItem lines="none" style={{ marginTop: 8 }}>
                    <IonIcon icon={sendOutline} slot="start" color="medium" />
                    <IonLabel>
                        <small style={{ color: "var(--ion-color-medium)" }}>
                            Items are staged for cart review only. No automatic database insertion is performed.
                        </small>
                    </IonLabel>
                </IonItem>
            </IonCardContent>

            <IonToast
                isOpen={Boolean(toastMessage)}
                message={toastMessage ?? ""}
                duration={2200}
                position="bottom"
                onDidDismiss={() => setToastMessage(null)}
            />
        </IonCard>
    );
};

export default ImageToInventoryText;
