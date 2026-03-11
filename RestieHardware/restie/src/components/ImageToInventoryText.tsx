import React, { useMemo, useRef, useState } from "react";
import {
    IonBadge,
    IonButton,
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
    IonTextarea,
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
    const [warnings, setWarnings] = useState<string[]>([]);
    const [extractedText, setExtractedText] = useState<string>("");
    const [ocrSource, setOcrSource] = useState<"live" | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const typedInventoryItems = useMemo<InventoryItem[]>(() => inventoryItems ?? [], [inventoryItems]);

    const readyCount = rows.filter((r) => !r.needs_review).length;
    const reviewCount = rows.filter((r) => r.needs_review).length;

    // ---------------------------------------------------------------------------
    // Image selection
    // ---------------------------------------------------------------------------
    const applyPreview = (file: File, source: ImageSource) => {
        setSelectedFile(file);
        setImageSource(source);
        setPreviewUrl(URL.createObjectURL(file));
        setRows([]);
        setWarnings([]);
        setError(null);
        setExtractedText("");
        setOcrSource(null);
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
            setWarnings(result.warnings);
            setOcrSource(result.ocrSource ?? "live");

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
        if (!readyCount) {
            setToastMessage("No import-ready rows available.");
            return;
        }
        const importRows = rows.filter((r) => !r.needs_review);
        onImportReady?.(importRows);
        setToastMessage(
            `Added ${importRows.length} item(s) to cart. ${reviewCount} row(s) skipped (needs review).`
        );
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
                            <IonLabel>🟢 Live OCR</IonLabel>
                        </IonChip>
                    </div>
                )}

                {/* Loading progress */}
                {isExtracting && (
                    <IonItem lines="none">
                        <IonLabel>
                            <IonSpinner name="dots" style={{ marginRight: 8 }} />
                            Processing OCR and matching items...
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

                {/* Warnings */}
                {!!warnings.length && (
                    <IonCard color="warning" style={{ marginTop: 8 }}>
                        <IonCardHeader>
                            <IonCardTitle style={{ fontSize: "0.95rem" }}>
                                ⚠ Warnings ({warnings.length})
                            </IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                                {warnings.map((w, i) => (
                                    <li key={i}>{w}</li>
                                ))}
                            </ul>
                        </IonCardContent>
                    </IonCard>
                )}

                {/* Summary chips */}
                {!!rows.length && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
                        <IonChip color="medium">
                            <IonLabel>Total: {rows.length}</IonLabel>
                        </IonChip>
                        <IonChip color="success">
                            <IonLabel>✅ Ready: {readyCount}</IonLabel>
                        </IonChip>
                        <IonChip color="warning">
                            <IonLabel>⚠ Review: {reviewCount}</IonLabel>
                        </IonChip>
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
                                disabled={readyCount === 0}
                            >
                                <IonIcon icon={sendOutline} slot="start" />
                                Add to Cart ({readyCount})
                            </IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>

                {/* Raw text audit */}
                {!!extractedText && (
                    <IonCard style={{ marginTop: 8 }}>
                        <IonCardHeader>
                            <IonCardTitle style={{ fontSize: "0.95rem" }}>Extracted Raw Text (Audit)</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            <IonTextarea readonly value={extractedText} autoGrow />
                        </IonCardContent>
                    </IonCard>
                )}

                {/* Results table */}
                {!!rows.length && (
                    <div style={{ overflowX: "auto", marginTop: 12 }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
                            <thead>
                                <tr style={{ background: "var(--ion-color-light)" }}>
                                    {[
                                        "qty",
                                        "uom",
                                        "description",
                                        "specification",
                                        "normalized_item",
                                        "confidence",
                                        "matched_code",
                                        "needs_review",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            style={{
                                                borderBottom: "2px solid var(--ion-color-medium)",
                                                textAlign: "left",
                                                padding: "8px 10px",
                                                fontSize: "0.8rem",
                                            }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, i) => (
                                    <tr
                                        key={i}
                                        style={{ background: row.needs_review ? "#fff8e1" : "transparent" }}
                                    >
                                        <td style={{ padding: "6px 10px", borderBottom: "1px solid #eee" }}>{row.qty ?? "—"}</td>
                                        <td style={{ padding: "6px 10px", borderBottom: "1px solid #eee" }}>{row.uom ?? "—"}</td>
                                        <td style={{ padding: "6px 10px", borderBottom: "1px solid #eee" }}>{row.description}</td>
                                        <td style={{ padding: "6px 10px", borderBottom: "1px solid #eee" }}>{row.specification ?? "—"}</td>
                                        <td style={{ padding: "6px 10px", borderBottom: "1px solid #eee" }}>{row.normalized_item}</td>
                                        <td style={{ padding: "6px 10px", borderBottom: "1px solid #eee" }}>{row.confidence.toFixed(3)}</td>
                                        <td style={{ padding: "6px 10px", borderBottom: "1px solid #eee", fontWeight: row.matched_code ? 600 : 400 }}>
                                            {row.matched_code ?? "—"}
                                        </td>
                                        <td style={{ padding: "6px 10px", borderBottom: "1px solid #eee" }}>
                                            <IonChip
                                                color={row.needs_review ? "warning" : "success"}
                                                style={{ fontSize: "0.75rem" }}
                                            >
                                                <IonLabel>{row.needs_review ? "⚠ Review" : "✅ OK"}</IonLabel>
                                            </IonChip>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
