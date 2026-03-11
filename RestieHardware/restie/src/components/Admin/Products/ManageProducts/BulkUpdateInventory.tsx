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
    cloudUploadOutline,
    checkmarkCircleOutline,
    alertCircleOutline,
    addCircleOutline,
    refreshOutline,
    removeCircleOutline,
    arrowBackOutline,
} from "ionicons/icons";
import * as XLSX from "xlsx";
import { BulkUpsertUploadFile, getBulkUpsertStreamUrl } from "../../../../Service/API/Admin/AdminApi";
import "./BulkUpdateInventory.css";

interface ExcelRow {
    code: string;
    description: string;
    subClass: string;
    classField: string;
    um: string;
    onHand: number | null;
    unitCost: number | null;
    unitPrice: number | null;
    willSkip: boolean;
}

interface BulkResult {
    inserted: number;
    updated: number;
    skipped: number;
    success: boolean;
    message: string;
    errors: string[];
}

const BulkUpdateInventory: React.FC = () => {
    const router = useIonRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [rows, setRows] = useState<ExcelRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<BulkResult | null>(null);
    const [progress, setProgress] = useState(0); // 0-100
    const [showLeaveAlert, setShowLeaveAlert] = useState(false);
    const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const [liveStats, setLiveStats] = useState({ inserted: 0, updated: 0, skipped: 0 });

    // True whenever there's work the user might lose
    const isDirty = (selectedFile !== null && result === null) || isLoading;

    // Block browser/desktop tab close when dirty
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!isDirty) return;
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    // Intercept Ionic hardware back button (Android / Capacitor)
    useEffect(() => {
        const handler = (ev: Event) => {
            if (!isDirty) return;
            // Stop Ionic's default back navigation
            (ev as CustomEvent).detail.register(10, (processNextHandler: () => void) => {
                setShowLeaveAlert(true);
                // Don't call processNextHandler — we're handling it via the alert
            });
        };
        document.addEventListener("ionBackButton", handler);
        return () => document.removeEventListener("ionBackButton", handler);
    }, [isDirty]);

    const parseExcel = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            if (!data) return;
            const wb = XLSX.read(data, { type: "array" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const raw: (string | number | null)[][] = XLSX.utils.sheet_to_json(ws, {
                header: 1,
                defval: null,
            });
            // row index 0 = header → skip
            const parsed: ExcelRow[] = [];
            for (let i = 1; i < raw.length; i++) {
                const r = raw[i];
                const code = r[0] != null ? String(r[0]).trim() : "";
                if (!code) continue; // blank code rows discarded
                const onHandRaw = r[5];
                const onHand =
                    onHandRaw != null && !isNaN(Number(onHandRaw))
                        ? Number(onHandRaw)
                        : null;
                parsed.push({
                    code,
                    description: r[1] != null ? String(r[1]).trim() : "",
                    subClass: r[2] != null ? String(r[2]).trim() : "",
                    classField: r[3] != null ? String(r[3]).trim() : "",
                    um: r[4] != null ? String(r[4]).trim() : "",
                    onHand,
                    unitCost:
                        r[6] != null && !isNaN(Number(r[6])) ? Number(r[6]) : null,
                    unitPrice:
                        r[7] != null && !isNaN(Number(r[7])) ? Number(r[7]) : null,
                    willSkip: onHand === null || onHand === 0,
                });
            }
            setRows(parsed);
        };
        reader.readAsArrayBuffer(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        setFileName(file.name);
        setResult(null);
        parseExcel(file);
    };

    const handleChoose = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async () => {
        if (!selectedFile) return;
        setIsLoading(true);
        setProgress(0);

        // Kill any leftover fake timer
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);

        try {
            // Step 1 — upload file, get jobId
            const jobId = await BulkUpsertUploadFile(selectedFile);

            // Step 2 — open SSE stream
            const streamUrl = getBulkUpsertStreamUrl(jobId);
            const evtSource = new EventSource(streamUrl);
            eventSourceRef.current = evtSource;

            evtSource.onmessage = (e) => {
                try {
                    const evt = JSON.parse(e.data) as {
                        type: string;
                        processed: number;
                        total: number;
                        inserted: number;
                        updated: number;
                        skipped: number;
                        pct: number;
                        success: boolean;
                        message: string;
                        errors: string[];
                    };

                    if (evt.type === "progress") {
                        setProgress(evt.pct);
                        // Live-update the stat chips via a temporary result object
                        // (we keep result null until done so the progress card stays visible)
                        setLiveStats({ inserted: evt.inserted, updated: evt.updated, skipped: evt.skipped });
                    } else if (evt.type === "done") {
                        evtSource.close();
                        eventSourceRef.current = null;
                        setProgress(100);
                        setTimeout(() => {
                            setResult({
                                inserted: evt.inserted,
                                updated: evt.updated,
                                skipped: evt.skipped,
                                success: true,
                                message: evt.message,
                                errors: evt.errors ?? [],
                            });
                            setIsLoading(false);
                        }, 400);
                    } else if (evt.type === "error") {
                        evtSource.close();
                        eventSourceRef.current = null;
                        setProgress(100);
                        setTimeout(() => {
                            setResult({
                                inserted: 0,
                                updated: 0,
                                skipped: 0,
                                success: false,
                                message: evt.message,
                                errors: evt.errors ?? [],
                            });
                            setIsLoading(false);
                        }, 400);
                    }
                } catch {
                    // malformed event — ignore
                }
            };

            evtSource.onerror = () => {
                evtSource.close();
                eventSourceRef.current = null;
                setProgress(100);
                setTimeout(() => {
                    setResult({
                        inserted: 0, updated: 0, skipped: 0,
                        success: false,
                        message: "Connection to server lost during processing.",
                        errors: [],
                    });
                    setIsLoading(false);
                }, 400);
            };

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
            setProgress(100);
            setTimeout(() => {
                setResult({ inserted: 0, updated: 0, skipped: 0, success: false, message: msg, errors: [] });
                setIsLoading(false);
            }, 400);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setFileName("");
        setRows([]);
        setResult(null);
        setProgress(0);
        setLiveStats({ inserted: 0, updated: 0, skipped: 0 });
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        if (eventSourceRef.current) { eventSourceRef.current.close(); eventSourceRef.current = null; }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Called when user confirms leaving via the alert
    const handleLeaveConfirmed = () => {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        if (eventSourceRef.current) { eventSourceRef.current.close(); eventSourceRef.current = null; }
        setShowLeaveAlert(false);
        router.goBack();
    };

    const activeRows = rows.filter((r) => !r.willSkip);
    const skipRows = rows.filter((r) => r.willSkip);

    return (
        <IonPage>
            {/* Leave confirmation alert */}
            <IonAlert
                isOpen={showLeaveAlert}
                onDidDismiss={() => setShowLeaveAlert(false)}
                header={isLoading ? "Upload in Progress" : "Unsaved Work"}
                message={
                    isLoading
                        ? "An upload is currently in progress. Leaving now will cancel it. Are you sure you want to leave?"
                        : "You have a file loaded that hasn't been uploaded yet. Are you sure you want to leave?"
                }
                buttons={[
                    {
                        text: "Stay",
                        role: "cancel",
                        cssClass: "bui-alert-btn-stay",
                    },
                    {
                        text: isLoading ? "Cancel Upload & Leave" : "Leave",
                        role: "destructive",
                        cssClass: "bui-alert-btn-leave",
                        handler: handleLeaveConfirmed,
                    },
                ]}
            />

            <IonHeader>
                <IonToolbar className="bui-toolbar">
                    <IonButtons slot="start">
                        {isDirty ? (
                            <IonButton
                                className="bui-back-btn"
                                onClick={() => setShowLeaveAlert(true)}
                            >
                                <IonIcon icon={arrowBackOutline} />
                            </IonButton>
                        ) : (
                            <IonBackButton defaultHref="/admin/mainmanageproduct" className="bui-back-btn" />
                        )}
                    </IonButtons>
                    <IonTitle className="bui-toolbar-title">
                        Bulk Update Inventory
                    </IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="bui-content">
                <div className="bui-scroll">
                    <div className="bui-inner">
                        {/* Upload card */}
                        <p className="bui-section-label">Select Excel File</p>
                        <div className="bui-upload-card">
                            <div className="bui-upload-icon-wrap">
                                <IonIcon icon={cloudUploadOutline} className="bui-upload-icon" />
                            </div>
                            <p className="bui-upload-title">Import from Excel</p>
                            <p className="bui-upload-sub">
                                Columns: Code · Description · Sub Class · Class · U/M · On Hand
                                · Unit Cost · Unit Price
                                {"\n"}Rows with On Hand = 0 will be skipped.
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                style={{ display: "none" }}
                                onChange={handleFileChange}
                            />
                            <IonButton
                                className="bui-choose-btn"
                                onClick={handleChoose}
                                disabled={isLoading}
                            >
                                Choose File
                            </IonButton>
                            {fileName ? (
                                <span className="bui-file-name">{fileName}</span>
                            ) : null}
                        </div>

                        {/* Preview */}
                        {rows.length > 0 && !result && (
                            <>
                                <p className="bui-section-label">Preview</p>

                                {/* Legend */}
                                <div className="bui-legend-card">
                                    <span className="bui-legend-item">
                                        <span className="bui-legend-dot bui-legend-dot--insert" />
                                        Will insert / update ({activeRows.length})
                                    </span>
                                    <span className="bui-legend-item">
                                        <span className="bui-legend-dot bui-legend-dot--skip" />
                                        Will skip — On Hand = 0 ({skipRows.length})
                                    </span>
                                </div>

                                {/* Table */}
                                <div className="bui-preview-card" style={{ marginTop: 8 }}>
                                    <div className="bui-table-wrap">
                                        <table className="bui-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Code</th>
                                                    <th>Description</th>
                                                    <th>Sub Class</th>
                                                    <th>Class</th>
                                                    <th>U/M</th>
                                                    <th>On Hand</th>
                                                    <th>Unit Cost</th>
                                                    <th>Unit Price</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.map((row, idx) => (
                                                    <tr
                                                        key={idx}
                                                        className={row.willSkip ? "bui-row--skip" : ""}
                                                    >
                                                        <td>{idx + 1}</td>
                                                        <td>{row.code}</td>
                                                        <td>{row.description}</td>
                                                        <td>{row.subClass}</td>
                                                        <td>{row.classField}</td>
                                                        <td>{row.um}</td>
                                                        <td>{row.onHand ?? "—"}</td>
                                                        <td>
                                                            {row.unitCost != null
                                                                ? row.unitCost.toLocaleString()
                                                                : "—"}
                                                        </td>
                                                        <td>
                                                            {row.unitPrice != null
                                                                ? row.unitPrice.toLocaleString()
                                                                : "—"}
                                                        </td>
                                                        <td>
                                                            {row.willSkip ? (
                                                                <span className="bui-badge-skip">Skip</span>
                                                            ) : (
                                                                "✓"
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="bui-table-count">
                                        {rows.length} row{rows.length !== 1 ? "s" : ""} total ·{" "}
                                        {activeRows.length} to process · {skipRows.length} to skip
                                    </div>
                                </div>

                                {/* Submit / Progress */}
                                <div style={{ marginTop: 16 }}>
                                    {isLoading ? (
                                        <div className="bui-progress-card">
                                            {/* Live stat chips */}
                                            <div className="bui-live-stats">
                                                <div className="bui-live-stat bui-live-stat--total">
                                                    <IonIcon icon={cloudUploadOutline} />
                                                    <span className="bui-live-stat__num">{activeRows.length}</span>
                                                    <span className="bui-live-stat__label">Total</span>
                                                </div>
                                                <div className="bui-live-stat bui-live-stat--insert">
                                                    <IonIcon icon={addCircleOutline} />
                                                    <span className="bui-live-stat__num">{liveStats.inserted}</span>
                                                    <span className="bui-live-stat__label">Inserted</span>
                                                </div>
                                                <div className="bui-live-stat bui-live-stat--update">
                                                    <IonIcon icon={refreshOutline} />
                                                    <span className="bui-live-stat__num">{liveStats.updated}</span>
                                                    <span className="bui-live-stat__label">Updated</span>
                                                </div>
                                                <div className="bui-live-stat bui-live-stat--skip">
                                                    <IonIcon icon={removeCircleOutline} />
                                                    <span className="bui-live-stat__num">{liveStats.skipped}</span>
                                                    <span className="bui-live-stat__label">Skipped</span>
                                                </div>
                                            </div>

                                            {/* Progress bar */}
                                            <div className="bui-progress-label">
                                                <span>Processing…</span>
                                                <span>{Math.round(progress)}%</span>
                                            </div>
                                            <div className="bui-progress-track">
                                                <div
                                                    className="bui-progress-fill"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <IonButton
                                            className="bui-submit-btn"
                                            expand="block"
                                            onClick={handleSubmit}
                                            disabled={activeRows.length === 0}
                                        >
                                            {`Upload & Process ${activeRows.length} Row${activeRows.length !== 1 ? "s" : ""
                                                }`}
                                        </IonButton>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Result */}
                        {result && (
                            <>
                                <p className="bui-section-label">Result</p>
                                <div className="bui-result-card">
                                    {/* Completed progress bar */}
                                    <div className="bui-progress-track bui-progress-track--done">
                                        <div
                                            className={`bui-progress-fill ${result.success ? "" : "bui-progress-fill--error"}`}
                                            style={{ width: "100%" }}
                                        />
                                    </div>

                                    <p
                                        className={`bui-result-title ${result.success
                                            ? "bui-result-title--success"
                                            : "bui-result-title--error"
                                            }`}
                                    >
                                        <IonIcon
                                            icon={
                                                result.success
                                                    ? checkmarkCircleOutline
                                                    : alertCircleOutline
                                            }
                                        />
                                        {result.success ? "Import Complete" : "Import Failed"}
                                    </p>

                                    {/* Always show the 3-stat grid */}
                                    <div className="bui-result-grid">
                                        <div className="bui-result-stat">
                                            <span className="bui-result-stat__num bui-result-stat__num--insert">
                                                {result.inserted}
                                            </span>
                                            <span className="bui-result-stat__label">Inserted</span>
                                        </div>
                                        <div className="bui-result-stat">
                                            <span className="bui-result-stat__num bui-result-stat__num--update">
                                                {result.updated}
                                            </span>
                                            <span className="bui-result-stat__label">Updated</span>
                                        </div>
                                        <div className="bui-result-stat">
                                            <span className="bui-result-stat__num bui-result-stat__num--skip">
                                                {result.skipped}
                                            </span>
                                            <span className="bui-result-stat__label">Skipped</span>
                                        </div>
                                    </div>

                                    {result.message ? (
                                        <p className="bui-result-message">{result.message}</p>
                                    ) : null}

                                    {result.errors && result.errors.length > 0 && (
                                        <ul className="bui-result-errors">
                                            {result.errors.map((err, i) => (
                                                <li key={i}>{err}</li>
                                            ))}
                                        </ul>
                                    )}

                                    <div style={{ marginTop: 16 }}>
                                        <IonButton
                                            className="bui-reset-btn"
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

export default BulkUpdateInventory;
