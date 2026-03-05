import React, { useRef, useState, useEffect } from "react";
import {
    IonContent,
    IonHeader,
    IonPage,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonAlert,
    useIonRouter,
} from "@ionic/react";
import {
    receiptOutline,
    checkmarkCircleOutline,
    alertCircleOutline,
    arrowBackOutline,
    documentOutline,
} from "ionicons/icons";
import { ImportPOSLog as importPOSLogApi } from "../../../../Service/API/Admin/AdminApi";
import "./ImportPOSLog.css";

interface POSResult {
    success: boolean;
    message: string;
    ordersInserted: number;
    itemsProcessed: number;
    inventoryUpdated: number;
    skipped: number;
    errors: string[];
}

const ImportPOSLog: React.FC = () => {
    const router = useIonRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [fileName, setFileName] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<POSResult | null>(null);
    const [showLeaveAlert, setShowLeaveAlert] = useState(false);

    const isDirty = (selectedFile !== null && result === null) || isLoading;

    // Block browser tab-close
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (!isDirty) return;
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    // Intercept Ionic hardware back button
    useEffect(() => {
        const handler = (ev: Event) => {
            if (!isDirty) return;
            (ev as CustomEvent).detail.register(10, () => {
                setShowLeaveAlert(true);
            });
        };
        document.addEventListener("ionBackButton", handler);
        return () => document.removeEventListener("ionBackButton", handler);
    }, [isDirty]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        setFileName(file.name);
        setResult(null);
    };

    const handleChoose = () => fileInputRef.current?.click();

    const handleSubmit = async () => {
        if (!selectedFile) return;
        setIsLoading(true);
        setProgress(0);

        // Crawling progress bar — snaps to 100 on completion
        progressTimerRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 98) return 98;
                const step = prev < 40 ? 4 : prev < 70 ? 2 : prev < 90 ? 0.5 : 0.1;
                return Math.min(prev + step, 98);
            });
        }, 120);

        try {
            const res = await importPOSLogApi(selectedFile) as POSResult;
            clearInterval(progressTimerRef.current!);
            setProgress(100);
            setTimeout(() => {
                setResult(res);
                setIsLoading(false);
            }, 400);
        } catch (err: unknown) {
            clearInterval(progressTimerRef.current!);
            setProgress(100);
            const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
            setTimeout(() => {
                setResult({
                    success: false,
                    message: msg,
                    ordersInserted: 0,
                    itemsProcessed: 0,
                    inventoryUpdated: 0,
                    skipped: 0,
                    errors: [],
                });
                setIsLoading(false);
            }, 400);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setFileName("");
        setResult(null);
        setProgress(0);
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleLeaveConfirmed = () => {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        setShowLeaveAlert(false);
        router.goBack();
    };


    return (
        <IonPage>
            {/* Leave guard */}
            <IonAlert
                isOpen={showLeaveAlert}
                onDidDismiss={() => setShowLeaveAlert(false)}
                header={isLoading ? "Import in Progress" : "Unsaved Work"}
                message={
                    isLoading
                        ? "An import is in progress. Leaving will cancel it. Are you sure?"
                        : "You have a file loaded that hasn't been imported yet. Leave anyway?"
                }
                buttons={[
                    { text: "Stay", role: "cancel", cssClass: "ipl-alert-btn-stay" },
                    {
                        text: isLoading ? "Cancel & Leave" : "Leave",
                        role: "destructive",
                        cssClass: "ipl-alert-btn-leave",
                        handler: handleLeaveConfirmed,
                    },
                ]}
            />

            <IonHeader>
                <IonToolbar className="ipl-toolbar">
                    <IonButtons slot="start">
                        {isDirty ? (
                            <IonButton className="ipl-back-btn" onClick={() => setShowLeaveAlert(true)}>
                                <IonIcon icon={arrowBackOutline} />
                            </IonButton>
                        ) : (
                            <IonBackButton defaultHref="/admin/mainmanageproduct" className="ipl-back-btn" />
                        )}
                    </IonButtons>
                    <IonTitle className="ipl-toolbar-title">Import POS Log</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ipl-content">
                <div className="ipl-scroll">
                    <div className="ipl-inner">

                        {/* Column format hint */}
                        <p className="ipl-section-label">Expected Column Layout</p>
                        <div className="ipl-hint-card">
                            <strong>POS Transaction Log PDF — one row per transaction line</strong>
                            <div className="ipl-hint-cols">
                                <span className="ipl-hint-col-letter">A</span><span>Date (MM/DD/YYYY)</span>
                                <span className="ipl-hint-col-letter">B</span><span>Time</span>
                                <span className="ipl-hint-col-letter">C</span><span>Ref # (receipt number)</span>
                                <span className="ipl-hint-col-letter">D</span><span>Item Code</span>
                                <span className="ipl-hint-col-letter">E</span><span>Item Description</span>
                                <span className="ipl-hint-col-letter">F</span><span>Qty</span>
                                <span className="ipl-hint-col-letter">G</span><span>Price</span>
                                <span className="ipl-hint-col-letter">H</span><span>Amount</span>
                                <span className="ipl-hint-col-letter">I</span><span>Type (Sale / Payment / Change / Starting Cash)</span>
                                <span className="ipl-hint-col-letter">J</span><span>Customer</span>
                                <span className="ipl-hint-col-letter">K</span><span>Cashier</span>
                            </div>
                            Only <strong>Sale</strong> rows are imported. Payment, Change, and Starting Cash rows are skipped.
                        </div>

                        {/* Upload card */}
                        <p className="ipl-section-label">Select PDF File</p>
                        <div className="ipl-upload-card">
                            <div className="ipl-upload-icon-wrap">
                                <IonIcon icon={receiptOutline} className="ipl-upload-icon" />
                            </div>
                            <p className="ipl-upload-title">Import POS Transaction Log</p>
                            <p className="ipl-upload-sub">
                                Inserts orders, cart items, and transactions.{"\n"}
                                Deducts sold quantities from inventory.{"\n"}
                                Duplicate Ref# entries are skipped automatically.
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                            />
                            <IonButton
                                className="ipl-choose-btn"
                                onClick={handleChoose}
                                disabled={isLoading}
                            >
                                Choose File
                            </IonButton>
                            {fileName ? <span className="ipl-file-name">{fileName}</span> : null}
                        </div>

                        {/* PDF ready card + submit */}
                        {selectedFile && !result && (
                            <>
                                <p className="ipl-section-label">Selected File</p>
                                <div className="ipl-preview-card">
                                    <div className="ipl-file-ready-card">
                                        <IonIcon icon={documentOutline} className="ipl-file-ready-icon" />
                                        <span className="ipl-file-ready-name">{fileName}</span>
                                        <span className="ipl-file-ready-sub">PDF ready to import</span>
                                    </div>
                                </div>

                                {/* Submit / Progress */}
                                <div style={{ marginTop: 16 }}>
                                    {isLoading ? (
                                        <div className="ipl-progress-card">
                                            <div className="ipl-progress-label">
                                                <span>Importing…</span>
                                                <span>{Math.round(progress)}%</span>
                                            </div>
                                            <div className="ipl-progress-track">
                                                <div
                                                    className="ipl-progress-fill"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <IonButton
                                            className="ipl-submit-btn"
                                            expand="block"
                                            onClick={handleSubmit}
                                        >
                                            Import PDF
                                        </IonButton>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Result */}
                        {result && (
                            <>
                                <p className="ipl-section-label">Result</p>
                                <div className="ipl-result-card">
                                    <div className="ipl-progress-track">
                                        <div
                                            className="ipl-progress-fill"
                                            style={{ width: "100%", transition: "none", background: result.success ? undefined : "#c0392b" }}
                                        />
                                    </div>

                                    <p className={`ipl-result-title ${result.success ? "ipl-result-title--success" : "ipl-result-title--error"}`}>
                                        <IonIcon icon={result.success ? checkmarkCircleOutline : alertCircleOutline} />
                                        {result.success ? "Import Complete" : "Import Failed"}
                                    </p>

                                    <div className="ipl-result-grid">
                                        <div className="ipl-result-stat">
                                            <span className="ipl-result-stat__num ipl-result-stat__num--orders">{result.ordersInserted}</span>
                                            <span className="ipl-result-stat__label">Orders</span>
                                        </div>
                                        <div className="ipl-result-stat">
                                            <span className="ipl-result-stat__num ipl-result-stat__num--items">{result.itemsProcessed}</span>
                                            <span className="ipl-result-stat__label">Items</span>
                                        </div>
                                        <div className="ipl-result-stat">
                                            <span className="ipl-result-stat__num ipl-result-stat__num--inv">{result.inventoryUpdated}</span>
                                            <span className="ipl-result-stat__label">Inv. Updated</span>
                                        </div>
                                        <div className="ipl-result-stat">
                                            <span className="ipl-result-stat__num ipl-result-stat__num--skip">{result.skipped}</span>
                                            <span className="ipl-result-stat__label">Skipped</span>
                                        </div>
                                    </div>

                                    {result.message ? <p className="ipl-result-message">{result.message}</p> : null}

                                    {result.errors && result.errors.length > 0 && (
                                        <ul className="ipl-result-errors">
                                            {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                                        </ul>
                                    )}

                                    <div style={{ marginTop: 16 }}>
                                        <IonButton
                                            className="ipl-reset-btn"
                                            fill="outline"
                                            expand="block"
                                            onClick={handleReset}
                                        >
                                            Import Another File
                                        </IonButton>
                                    </div>
                                </div>
                            </>
                        )}

                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default ImportPOSLog;
