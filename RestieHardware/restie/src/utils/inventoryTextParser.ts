export type InventoryItem = {
    code: string;
    item: string;
    category?: string;
    brand?: string;
};

export type ParsedInventoryRow = {
    qty: number | null;
    uom: string | null;
    description: string;
    specification: string | null;
    normalized_item: string;
    matched_code: string | null;
    confidence: number;
    needs_review: boolean;
    raw_text: string;
};

export type ParseLineResult = {
    row: ParsedInventoryRow | null;
    warning?: string;
};

type InventoryMatchResult = {
    matched_code: string | null;
    confidence: number;
    needs_review: boolean;
};

export type ExtractionResult = {
    extractedText: string;
    rows: ParsedInventoryRow[];
    warnings: string[];
    ocrSource?: "live";
};

type OcrInventoryMatch = {
    code: string;
    item: string;
    category?: string;
    brand?: string;
    qty?: number;
    price?: number;
    cost?: number;
    status?: string;
};

type OcrMatchedLine = {
    raw_line: string;
    search_term: string;
    alias_matched?: boolean;
    matches?: OcrInventoryMatch[] | { $values?: OcrInventoryMatch[] };
};

type OcrApiPayload = {
    text?: string;
    lines?: string[] | { $values?: string[] };
    matched_lines?: OcrMatchedLine[] | { $values?: OcrMatchedLine[] };
    result?: {
        text?: string;
        lines?: string[] | { $values?: string[] };
        matched_lines?: OcrMatchedLine[] | { $values?: OcrMatchedLine[] };
    };
};

const UOM_MAP: Record<string, string> = {
    // pieces
    PC: "PC",
    PCS: "PC",
    PES: "PC",
    PCE: "PC",
    PIECE: "PC",
    PIECES: "PC",
    EA: "PC",
    EACH: "PC",
    UNIT: "PC",
    UNITS: "PC",
    NO: "PC",
    NOS: "PC",

    // length
    LENGTH: "LGT",
    LENGTHS: "LGT",
    LGT: "LGT",
    LGTH: "LGT",
    LEN: "LGT",
    STICK: "LGT",
    STICKS: "LGT",

    // meter
    M: "MTR",
    METER: "MTR",
    METERS: "MTR",
    METRE: "MTR",
    METRES: "MTR",
    MTR: "MTR",
    MT: "MTR",
    LM: "MTR",

    // loom/coil (flexible conduit by meter)
    LOOM: "MTR",
    LOOMS: "MTR",
    COIL: "COIL",
    COILS: "COIL",

    // feet
    FT: "FT",
    FEET: "FT",
    FOOT: "FT",

    // roll
    ROLL: "ROLL",
    ROLLS: "ROLL",
    RLL: "ROLL",

    // box
    BOX: "BOX",
    BOXES: "BOX",
    BX: "BOX",

    // set / kit
    SET: "SET",
    SETS: "SET",
    KIT: "SET",

    // pack / bag
    PACK: "PACK",
    PACKS: "PACK",
    BAG: "BAG",
    BAGS: "BAG",

    // pair
    PAIR: "PAIR",
    PAIRS: "PAIR",
    PR: "PAIR",

    // bundle
    BUNDLE: "BDLR",
    BUNDLES: "BDLR",
    BDLR: "BDLR",

    // spool
    SPOOL: "SPOOL",
    SPOOLS: "SPOOL",
};

const ITEM_NORMALIZATION_RULES: Array<{ pattern: RegExp; normalized: string }> = [
    // ── Conduit & Pipe ──────────────────────────────────────────────────────
    { pattern: /\b(RSC\s*PIPE|RSCPIPE|R\.?S\.?C\.?\s*PIPE)\b/i, normalized: "RSC PIPE" },
    { pattern: /\b(RSC\s*ELBOW|R\.?S\.?C\.?\s*ELBOW)\b/i, normalized: "RSC ELBOW" },
    { pattern: /\b(RSC\s*COUPL(?:ING)?|R\.?S\.?C\.?\s*COUPL(?:ING)?)\b/i, normalized: "RSC COUPLING" },
    { pattern: /\b(PBC\s*PIPE|P\.?B\.?C\.?\s*PIPE)\b/i, normalized: "PVC PIPE" },  // OCR often reads PBC for PVC
    { pattern: /\b(PVC\s*PIPE)\b/i, normalized: "PVC PIPE" },
    { pattern: /\b(PVC\s*ELBOW|P\.?V\.?C\.?\s*ELBOW)\b/i, normalized: "PVC ELBOW" },
    { pattern: /\b(PVC\s*COUPL(?:ING)?)\b/i, normalized: "PVC COUPLING" },
    { pattern: /\b(CONDUIT\s*PIPE)\b/i, normalized: "CONDUIT PIPE" },
    { pattern: /\b(IMC\s*PIPE|I\.?M\.?C\.?\s*PIPE)\b/i, normalized: "IMC PIPE" },
    { pattern: /\b(EMT\s*PIPE|E\.?M\.?T\.?\s*PIPE)\b/i, normalized: "EMT PIPE" },

    // Flexible conduit / loom
    { pattern: /\b(FLEX(?:IBLE)?\s*CONDUIT|CONDUIT\s*LOOM|LOOM)\b/i, normalized: "FLEXIBLE CONDUIT" },

    // ── Fittings ─────────────────────────────────────────────────────────────
    { pattern: /\b(ENTRANCE\s*CAP|ENTRANC[E]?\s*CAP)\b/i, normalized: "ENTRANCE CAP" },
    { pattern: /\b(METER\s*BAS[E]?|METERBASE)\b/i, normalized: "METER BASE" },
    { pattern: /\b(CONDUIT\s*CLAMP|PIPE\s*CLAMP|CLAMP)\b/i, normalized: "CONDUIT CLAMP" },
    { pattern: /\b(LOCK\s*NUT|LOCKNUT)\b/i, normalized: "LOCK NUT" },
    { pattern: /\b(BUSHING)\b/i, normalized: "BUSHING" },
    { pattern: /\b(ELBOW)\b/i, normalized: "ELBOW" },
    { pattern: /\b(COUPL(?:ING)?)\b/i, normalized: "COUPLING" },

    // ── Wire & Cable ─────────────────────────────────────────────────────────
    { pattern: /\b(TW\s*WIRE|T\.?W\.?\s*WIRE)\b/i, normalized: "TW WIRE" },
    { pattern: /\b(THHN\s*WIRE|THHN)\b/i, normalized: "THHN WIRE" },
    { pattern: /\b(THWN\s*WIRE|THWN)\b/i, normalized: "THWN WIRE" },
    { pattern: /\b(THIN\s*WIRE|THIN)\b/i, normalized: "THHN WIRE" },     // OCR often reads THIN for THHN
    { pattern: /\b(POLY\s*AAC\s*WIRE|AAC\s*WIRE|POLY\s*A[AX]C|POLYAAC)\b/i, normalized: "POLY AAC WIRE" },
    { pattern: /\b(DUPLEX\s*WIRE|DUPLEX)\b/i, normalized: "DUPLEX WIRE" },
    { pattern: /\b(ROMEX\s*WIRE|ROMEX)\b/i, normalized: "ROMEX WIRE" },
    { pattern: /\b(FLAT\s*CORD|SPT\s*WIRE)\b/i, normalized: "FLAT CORD" },
    { pattern: /\b(EXTENSION\s*CORD)\b/i, normalized: "EXTENSION CORD" },
    { pattern: /\b(WIRE\s*NUT)\b/i, normalized: "WIRE NUT" },

    // ── Panels & Breakers ─────────────────────────────────────────────────
    { pattern: /\b(PANEL\s*BOARD|PANELBOARD|PANEL\s*BOX)\b/i, normalized: "PANELBOARD" },
    { pattern: /\b(CIRCUIT\s*BREAKER|CIRCUIT\s*BREAKER|CIRCUITBREAKER|CB|BREAKER)\b/i, normalized: "CIRCUIT BREAKER" },
    { pattern: /\b(MAIN\s*BREAKER|MCCB|MCB)\b/i, normalized: "MAIN BREAKER" },
    { pattern: /\b(FUSE)\b/i, normalized: "FUSE" },

    // ── Outlets, Switches & Devices ───────────────────────────────────────
    { pattern: /\b(C\.?O\.?\s*(?:2\s*)?GANG|(?:2\s*)?GANG\s*OUTLET|CONVENIENCE\s*OUTLET)\b/i, normalized: "CONVENIENCE OUTLET" },
    { pattern: /\b(SINGLE\s*GANG\s*(?:CONV(?:ENIENCE)?\s*)?OUTLET|1\s*GANG\s*OUTLET)\b/i, normalized: "SINGLE GANG OUTLET" },
    { pattern: /\b((?:2|TWO|DOUBLE)\s*GANG\s*(?:CONV(?:ENIENCE)?\s*)?OUTLET)\b/i, normalized: "2 GANG OUTLET" },
    { pattern: /\b((?:3|THREE)\s*GANG\s*(?:CONV(?:ENIENCE)?\s*)?OUTLET)\b/i, normalized: "3 GANG OUTLET" },
    { pattern: /\b(C\.?O\b)/i, normalized: "CONVENIENCE OUTLET" },           // bare C.O on its own
    { pattern: /\b((?:2|TWO|DOUBLE)\s*GANG\s*SWITCH|2G\s*SWITCH)\b/i, normalized: "2 GANG SWITCH" },
    { pattern: /\b(SINGLE\s*GANG\s*SWITCH|1\s*GANG\s*SWITCH|1G\s*SWITCH)\b/i, normalized: "1 GANG SWITCH" },
    { pattern: /\b((?:3|THREE)\s*GANG\s*SWITCH|3G\s*SWITCH)\b/i, normalized: "3 GANG SWITCH" },
    { pattern: /\b(GANG\s*SWITCH)\b/i, normalized: "GANG SWITCH" },
    { pattern: /\b(RECEPTACLE|RECEP)\b/i, normalized: "RECEPTACLE" },
    { pattern: /\b(GROUND\s*FAULT|GFCI|GFI)\b/i, normalized: "GFCI OUTLET" },
    { pattern: /\b(DIMMER\s*SWITCH|DIMMER)\b/i, normalized: "DIMMER SWITCH" },

    // ── Boxes ─────────────────────────────────────────────────────────────
    { pattern: /\b(UTILITY\s*BOX|UTIL\s*BOX)\b/i, normalized: "UTILITY BOX" },
    { pattern: /\b(JUNCTION\s*BOX|JBOX|J\.?\s*BOX)\b/i, normalized: "JUNCTION BOX" },
    { pattern: /\b(SQUARE\s*BOX)\b/i, normalized: "SQUARE BOX" },
    { pattern: /\b(PULL\s*BOX)\b/i, normalized: "PULL BOX" },
    { pattern: /\b(OUTLET\s*BOX)\b/i, normalized: "OUTLET BOX" },

    // ── Accessories ───────────────────────────────────────────────────────
    { pattern: /\b(ELECTRICAL\s*TAPE|ELEC\s*TAPE|ELECTRIC\s*TAPE|TAPE\s*3M?)\b/i, normalized: "ELECTRICAL TAPE" },
    { pattern: /\b(INSULATING\s*TAPE|INSULATION\s*TAPE)\b/i, normalized: "ELECTRICAL TAPE" },
    { pattern: /\b(CABLE\s*TIE|TIE\s*WRAP|ZIP\s*TIE)\b/i, normalized: "CABLE TIE" },
    { pattern: /\b(NAIL\s*CLIP|STAPLE\s*WIRE|WIRE\s*STAPLE)\b/i, normalized: "WIRE STAPLE" },
    { pattern: /\b(SPLIT\s*BOLT|SPLIT\s*CONNECTOR)\b/i, normalized: "SPLIT BOLT" },
    { pattern: /\b(CONNECTOR)\b/i, normalized: "CONNECTOR" },

    // ── Lighting ──────────────────────────────────────────────────────────
    { pattern: /\b(LED\s*BULB|BULB)\b/i, normalized: "LED BULB" },
    { pattern: /\b(FLUORESCENT|FLUOR)\b/i, normalized: "FLUORESCENT LAMP" },
    { pattern: /\b(DOWNLIGHT|DOWN\s*LIGHT)\b/i, normalized: "DOWNLIGHT" },
    { pattern: /\b(CEILING\s*FAN)\b/i, normalized: "CEILING FAN" },

    // ── Grounding ─────────────────────────────────────────────────────────
    { pattern: /\b(GROUND(?:ING)?\s*ROD|EARTH\s*ROD)\b/i, normalized: "GROUNDING ROD" },
    { pattern: /\b(GROUND\s*CLAMP)\b/i, normalized: "GROUND CLAMP" },
];

const SPEC_PATTERNS: RegExp[] = [
    // wire cross-section: 14mm², 2.0 mm², 3.5mm2, 2.0mm^2
    /\b\d+(?:\.\d+)?\s*mm[²2^]/gi,
    // fraction wire size: 6/7, 3/4, 1/0
    /\b\d+\/\d+\b/gi,
    // amperage: 60 AMP, 30A, 20 AMP., 15AMP
    /\b\d+\s*AMP[S.]*/gi,
    /\b\d+\s*A\b/gi,
    // dimension in inches/mm/cm/m: 1 INCH, 3/8 INCH, 1.5", 50mm, 20cm
    /\b\d+(?:[./]\d+)?\s*(?:INCH|IN|"|MM|CM|MTR?|FT)\b/gi,
    // size codes: 2x4, 4x4, 1x1
    /\b\d+\s*[Xx]\s*\d+(?:\s*[Xx]\s*\d+)?\b/gi,
    // voltage / phase ratings
    /\b(?:220|110|230|380|440)\s*V(?:OLTS?)?\b/gi,
    /\b\d+P\b/gi,
    // common ratings already there
    /\b(?:3M|2P|1P|20A|30A|40A|60A|15A)\b/gi,
    // length with unit: 3m, 5ft
    /\b\d+(?:\.\d+)?\s*(?:M|FT)\b/gi,
];

const NON_ITEM_PATTERNS: RegExp[] = [
    /^QTY\b/i,
    /^QUANTITY\b/i,
    /^ITEM\b/i,
    /^DESCRIPTION\b/i,
    /^SPEC(?:IFICATION)?\b/i,
    /^UNIT\b/i,
    /^PRICE\b/i,
    /^AMOUNT\b/i,
    /^TOTAL\b/i,
    /^SUB-?TOTAL\b/i,
    /^GRAND\s+TOTAL\b/i,
    /^COMPANY\b/i,
    /^ADDRESS\b/i,
    /^TEL(?:EPHONE)?\b/i,
    /^PHONE\b/i,
    /^EMAIL\b/i,
    /^TIN\b/i,
    /^VAT\b/i,
    /^DATE\b/i,
    /^PROJECT\b/i,
    /^CLIENT\b/i,
    /^CUSTOMER\b/i,
    /^ATTN\b/i,
    /^ATTENTION\b/i,
    /^DELIVER\s+TO\b/i,
    /^BILL\s+TO\b/i,
    /^SHIP\s+TO\b/i,
    /^PURCHASE\s+ORDER\b/i,
    /^PO\s*#?\b/i,
    /^REQUISITION\b/i,
    /^INVOICE\b/i,
    /^RECEIPT\b/i,
    /^QUOTATION\b/i,
    /^ESTIMATE\b/i,
    /^MATERIALS?\b/i,
    /^ELECTRICAL\s+MATERIALS?\b/i,
    /^PLEASE\b/i,
    /^THANK\s*YOU\b/i,
    /^TERMS\b/i,
    /^NOTE\b/i,
    /^NOTED\b/i,
];

const INVENTORY_HINT_PATTERNS: RegExp[] = [
    /\bPIPE\b/i,
    /\bCONDUIT\b/i,
    /\bELBOW\b/i,
    /\bCOUPL(?:ING)?\b/i,
    /\bWIRE\b/i,
    /\bBREAKER\b/i,
    /\bOUTLET\b/i,
    /\bSWITCH\b/i,
    /\bBOX\b/i,
    /\bTAPE\b/i,
    /\bCLAMP\b/i,
    /\bBUSHING\b/i,
    /\bCONNECTOR\b/i,
    /\bROD\b/i,
    /\bBULB\b/i,
    /\bCORD\b/i,
    /\bFAN\b/i,
    /\bGANG\b/i,
    /\bRECEPTACLE\b/i,
    /\bPANEL\b/i,
    /\bFUSE\b/i,
    /\bCAP\b/i,
    /\bMETER\s+BASE\b/i,
];

export function normalizeText(input: string): string {
    return input
        .replace(/[|]/g, " ")
        .replace(/[""]/g, '"')
        .replace(/[']/g, "'")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();
}

/**
 * Strip brand / parenthetical annotations from a description before matching
 * e.g. "(AMERICAN BRAND)(PLUG-IN)" "(PHILFLEX)" "W/COVER" "(KOTEN)" "(KAPEZ)" "(OMNI)" "(POLY)"
 * Returns them as a separate `brandNote` string so they can be stored in spec.
 */
function stripBrandAnnotations(text: string): { cleaned: string; brandNote: string } {
    const BRAND_KEYWORDS = [
        "AMERICAN BRAND", "PLUG-IN", "PLUGIN", "PHILFLEX", "KOTEN", "KAPEZ",
        "OMNI", "POLY", "FLUSH TYPE", "FLUSH", "SURFACE TYPE", "SURFACE",
        "METAL", "PLASTIC", "POLY", "NYLON",
    ];
    const brandNotes: string[] = [];

    // Extract everything inside parentheses
    let cleaned = text.replace(/\(([^)]*)\)/g, (_match, inner) => {
        brandNotes.push(inner.trim());
        return " ";
    });

    // Strip w/cover, w/ cover, w/COUTR (OCR noise for "w/COVER")
    cleaned = cleaned.replace(/\bW\/\s*C(?:OVER|OUTR|OUTN|OVR)?\b/gi, (_m) => {
        brandNotes.push("W/COVER");
        return " ";
    });

    // Strip standalone known brand keywords left after paren removal
    for (const kw of BRAND_KEYWORDS) {
        const re = new RegExp(`\\b${kw}\\b`, "gi");
        cleaned = cleaned.replace(re, " ");
    }

    return {
        cleaned: cleaned.replace(/\s+/g, " ").trim(),
        brandNote: brandNotes.join(" / "),
    };
}

/**
 * Pre-process raw OCR text lines before per-line parsing:
 * 1. Resolves ditto-mark continuation lines (lines starting with " or '' or ditto symbol)
 *    that inherit the item description from the previous substantive line.
 * 2. Normalises common OCR mis-reads (e.g. "CIRCUITBREAKER" → "CIRCUIT BREAKER")
 */
export function preprocessOcrLines(rawText: string): string[] {
    const lines = rawText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    const result: string[] = [];
    let lastItemDescription = ""; // last successfully extracted item description

    for (const line of lines) {
        const norm = normalizeText(line);

        // Skip header lines (all caps label with no leading number)
        if (/^[A-Z ]+MATERIALS?$/.test(norm) || /^ELECTRICAL MATERIALS?$/.test(norm)) {
            continue;
        }

        // Ditto detection: line starts with " or '' or repeated single-quote, with qty + spec
        // e.g.  '2  "  "   30 AMP.'  or  '2 PES "  "  15 AMP.'
        const dittoMatch = norm.match(/^(\d+)\s+(?:[A-Z]{1,5}\s+)?["""']{1,2}\s+["""']{1,2}\s+(.+)$/);
        if (dittoMatch && lastItemDescription) {
            // Reconstruct as "QTY PCS LAST_ITEM SPEC"
            const qty = dittoMatch[1];
            const spec = dittoMatch[2].trim();
            result.push(`${qty} PCS ${lastItemDescription} ${spec}`);
            continue;
        }

        // Track the last item description (after removing leading qty + uom)
        const itemMatch = norm.match(/^\d+(?:\.\d+)?\s+[A-Z]+\s+(.+)$/);
        if (itemMatch) {
            // Strip spec-like tokens to get core item name
            const coreItem = itemMatch[1]
                .replace(/\(([^)]*)\)/g, "")
                .replace(/\b\d+(?:\.\d+)?\s*(?:INCH|IN|MM|CM|AMP|A|MM2|MM\u00B2)\b/gi, "")
                .replace(/\s+/g, " ")
                .trim();
            if (coreItem.length > 2) lastItemDescription = coreItem;
        }

        result.push(line);
    }

    return result;
}

export function normalizeUom(input?: string | null): string | null {
    if (!input) return null;
    const normalized = normalizeText(input).replace(/[^A-Z]/g, "");
    return UOM_MAP[normalized] ?? null;
}

function detectNormalizedItem(text: string): string {
    for (const rule of ITEM_NORMALIZATION_RULES) {
        if (rule.pattern.test(text)) return rule.normalized;
    }
    return text
        .replace(/\b\d+(?:\.\d+)?\b/g, "")
        .replace(/\b(PC|PCS|MTR|METER|METERS|ROLL|BOX|SET|PACK|BAG|FT)\b/g, "")
        .replace(/\s+/g, " ")
        .trim() || "UNKNOWN ITEM";
}

function extractSpecification(text: string): string | null {
    const specs: string[] = [];
    for (const pattern of SPEC_PATTERNS) {
        const found = text.match(pattern);
        if (found?.length) specs.push(...found.map((v) => normalizeText(v)));
    }
    if (!specs.length) return null;
    return Array.from(new Set(specs)).join(" ");
}

function tokenize(text: string): Set<string> {
    return new Set(
        normalizeText(text)
            .split(/[^A-Z0-9]+/)
            .filter(Boolean)
    );
}

function tokenizeArray(text: string): string[] {
    return normalizeText(text)
        .split(/[^A-Z0-9]+/)
        .filter(Boolean);
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
    if (!a.size && !b.size) return 1;
    const intersection = new Set([...a].filter((token) => b.has(token))).size;
    const union = new Set([...a, ...b]).size;
    return union === 0 ? 0 : intersection / union;
}

function diceSimilarity(a: string[], b: string[]): number {
    if (!a.length && !b.length) return 1;
    if (!a.length || !b.length) return 0;

    const bCounts = new Map<string, number>();
    for (const token of b) {
        bCounts.set(token, (bCounts.get(token) ?? 0) + 1);
    }

    let overlap = 0;
    for (const token of a) {
        const count = bCounts.get(token) ?? 0;
        if (count > 0) {
            overlap += 1;
            bCounts.set(token, count - 1);
        }
    }

    return (2 * overlap) / (a.length + b.length);
}

function longestCommonSubstringLength(a: string, b: string): number {
    if (!a || !b) return 0;

    const table = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
    let longest = 0;

    for (let i = 1; i <= a.length; i += 1) {
        for (let j = 1; j <= b.length; j += 1) {
            if (a[i - 1] === b[j - 1]) {
                table[i][j] = table[i - 1][j - 1] + 1;
                longest = Math.max(longest, table[i][j]);
            }
        }
    }

    return longest;
}

function computeInventorySimilarity(query: string, candidate: string): number {
    const queryTokens = tokenizeArray(query);
    const candidateTokens = tokenizeArray(candidate);
    const querySet = new Set(queryTokens);
    const candidateSet = new Set(candidateTokens);

    const jaccard = jaccardSimilarity(querySet, candidateSet);
    const dice = diceSimilarity(queryTokens, candidateTokens);

    const normalizedQuery = normalizeText(query);
    const normalizedCandidate = normalizeText(candidate);
    const containsBoost =
        normalizedCandidate.includes(normalizedQuery) || normalizedQuery.includes(normalizedCandidate)
            ? 1
            : 0;
    const commonSubstring = longestCommonSubstringLength(normalizedQuery, normalizedCandidate);
    const substringScore = commonSubstring / Math.max(normalizedQuery.length, normalizedCandidate.length, 1);

    return Number((jaccard * 0.4 + dice * 0.35 + containsBoost * 0.15 + substringScore * 0.1).toFixed(4));
}

function looksLikeNonItemText(normalizedLine: string, inventoryItems: InventoryItem[]): boolean {
    if (!normalizedLine) return true;

    const compact = normalizedLine.replace(/\s+/g, " ").trim();
    const withoutLeadingQty = compact.replace(/^\d+(?:\.\d+)?\s+/, "");

    if (NON_ITEM_PATTERNS.some((pattern) => pattern.test(compact) || pattern.test(withoutLeadingQty))) {
        return true;
    }

    if (/^[A-Z0-9 .,&()\-/#]+:?$/.test(compact) && !/^\d/.test(compact)) {
        const hasInventoryHint = INVENTORY_HINT_PATTERNS.some((pattern) => pattern.test(compact));
        const hasStrongInventoryMatch = inventoryItems.some((item) => computeInventorySimilarity(compact, item.item) >= 0.82);
        if (!hasInventoryHint && !hasStrongInventoryMatch) {
            return true;
        }
    }

    if (!/^\d/.test(compact)) {
        const hasInventoryHint = INVENTORY_HINT_PATTERNS.some((pattern) => pattern.test(compact));
        const looksLikeAddressOrMeta = /\b(STREET|ST\.?|BRGY|BARANGAY|CITY|BLDG|BUILDING|FLOOR|ROOM|CONTACT|MOBILE|ZIP)\b/i.test(compact);
        if (looksLikeAddressOrMeta && !hasInventoryHint) {
            return true;
        }
    }

    return false;
}

export function matchInventoryItem(
    normalizedItem: string,
    inventoryItems: InventoryItem[]
): InventoryMatchResult {
    if (!inventoryItems.length || !normalizedItem) {
        return { matched_code: null, confidence: 0, needs_review: true };
    }

    const normalizedQuery = normalizeText(normalizedItem);
    let best: { code: string; score: number } | null = null;

    for (const item of inventoryItems) {
        const score = computeInventorySimilarity(normalizedQuery, item.item);
        if (!best || score > best.score) {
            best = { code: item.code, score };
        }
    }

    if (!best || best.score < 0.58) {
        return { matched_code: null, confidence: best?.score ?? 0, needs_review: true };
    }

    return { matched_code: best.code, confidence: best.score, needs_review: best.score < 0.7 };
}

export function parseInventoryLine(
    rawLine: string,
    inventoryItems: InventoryItem[]
): ParseLineResult {
    const raw_text = rawLine;
    const normalizedLine = normalizeText(rawLine);

    if (!normalizedLine) {
        return { row: null, warning: "Skipped blank line." };
    }

    if (looksLikeNonItemText(normalizedLine, inventoryItems)) {
        return { row: null, warning: `Skipped non-item text: "${raw_text}"` };
    }

    const qtyMatch = normalizedLine.match(/^\s*(\d+(?:\.\d+)?)/);
    const qty = qtyMatch ? Number(qtyMatch[1]) : null;

    const remainderAfterQty = qtyMatch
        ? normalizedLine.slice(qtyMatch[0].length).trim()
        : normalizedLine;

    const parts = remainderAfterQty.split(/\s+/);
    const firstTokenUom = normalizeUom(parts[0]);
    const uom = firstTokenUom;
    const rawDescriptionText = firstTokenUom ? parts.slice(1).join(" ") : remainderAfterQty;

    // Strip brand/parenthetical annotations before item matching
    const { cleaned: descriptionText, brandNote } = stripBrandAnnotations(rawDescriptionText);

    const normalized_item = detectNormalizedItem(descriptionText);

    // Combine spec from patterns + brand notes
    const specFromPatterns = extractSpecification(descriptionText);
    const specParts = [specFromPatterns, brandNote].filter(Boolean);
    const specification = specParts.length ? specParts.join(" | ") : null;

    const description = rawDescriptionText || normalized_item;

    if (!description || description === "UNKNOWN ITEM") {
        return {
            row: null,
            warning: `Could not parse a valid inventory item from line: "${raw_text}"`,
        };
    }

    const match = matchInventoryItem(normalized_item, inventoryItems);

    const row: ParsedInventoryRow = {
        qty,
        uom,
        description,
        specification,
        normalized_item,
        matched_code: match.matched_code,
        confidence: Number(match.confidence.toFixed(3)),
        needs_review: match.needs_review || qty === null || uom === null,
        raw_text,
    };

    if (qty === null || uom === null) {
        return {
            row,
            warning: `Line parsed with missing fields (qty/uom): "${raw_text}"`,
        };
    }

    return { row };
}

export function parseExtractedInventoryText(
    extractedText: string,
    inventoryItems: InventoryItem[]
): { rows: ParsedInventoryRow[]; warnings: string[] } {
    // Pre-process: resolve ditto lines, strip headers, normalise OCR noise
    const lines = preprocessOcrLines(extractedText);

    const rows: ParsedInventoryRow[] = [];
    const warnings: string[] = [];

    for (const line of lines) {
        const parsed = parseInventoryLine(line, inventoryItems);
        if (parsed.row) rows.push(parsed.row);
        if (parsed.warning) warnings.push(parsed.warning);
    }

    return { rows, warnings };
}

// ---------------------------------------------------------------------------
// Real OCR integration
// The OCR endpoint is resolved in order:
//   1. VITE_OCR_ENDPOINT env var  (explicit override)
//   2. App base URL + "api/ocr/extract"  (default route on your existing API)
// Set VITE_OCR_ENDPOINT only if your OCR endpoint lives on a different host.
// ---------------------------------------------------------------------------
import baseUrl from "../Helpers/environment";

const OCR_ENDPOINT: string =
    ((import.meta as any).env?.VITE_OCR_ENDPOINT as string | undefined)?.trim() ||
    `${baseUrl}api/ocr/extract`;

function extractTextFromOcrResponse(data: unknown): string | null {
    if (!data || typeof data !== "object") return null;
    const d = data as Record<string, unknown>;

    // { text: string }
    if (typeof d.text === "string" && d.text.trim()) return d.text.trim();

    // { result: { text: string } }
    if (d.result && typeof (d.result as any).text === "string") {
        const t = ((d.result as any).text as string).trim();
        if (t) return t;
    }

    // { lines: string[] }
    if (Array.isArray(d.lines) && d.lines.length > 0) {
        return (d.lines as string[]).join("\n");
    }

    // { result: { lines: string[] } }
    if (d.result && Array.isArray((d.result as any).lines)) {
        return ((d.result as any).lines as string[]).join("\n");
    }

    return null;
}

function toArray<T>(value: T[] | { $values?: T[] } | null | undefined): T[] {
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object" && Array.isArray((value as any).$values)) {
        return (value as any).$values as T[];
    }
    return [];
}

function extractMatchedLinesFromOcrResponse(data: unknown): OcrMatchedLine[] {
    if (!data || typeof data !== "object") return [];
    const d = data as OcrApiPayload;

    const direct = toArray(d.matched_lines);
    if (direct.length) return direct;

    const nested = toArray(d.result?.matched_lines);
    if (nested.length) return nested;

    return [];
}

function buildRowFromMatchedLine(line: OcrMatchedLine): ParsedInventoryRow | null {
    const rawText = (line.raw_line ?? "").trim();
    if (!rawText) return null;

    const parsed = parseInventoryLine(rawText, []);
    if (!parsed.row) {
        return null;
    }

    const baseQty = parsed.row?.qty ?? null;
    const baseUom = parsed.row?.uom ?? null;
    const baseSpec = parsed.row?.specification ?? null;
    const backendMatches = toArray(line.matches)
        .slice()
        .sort((a, b) => computeInventorySimilarity(line.search_term || rawText, b.item) - computeInventorySimilarity(line.search_term || rawText, a.item));
    const topMatch = backendMatches[0];

    return {
        qty: baseQty,
        uom: baseUom,
        description: line.search_term?.trim() || parsed.row?.description || rawText,
        specification: baseSpec,
        normalized_item: line.search_term?.trim() || parsed.row?.normalized_item || rawText,
        matched_code: topMatch?.code ?? null,
        confidence: topMatch ? 1 : 0,
        needs_review: !topMatch,
        raw_text: rawText,
    };
}

export async function callRealOcr(file: File): Promise<OcrApiPayload> {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("bearer");
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(OCR_ENDPOINT, {
        method: "POST",
        headers,
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`OCR endpoint returned HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as OcrApiPayload;
    const text = extractTextFromOcrResponse(data);

    if (!text) {
        throw new Error("OCR endpoint returned no readable text.");
    }

    return data;
}

export async function extractAndParseInventoryFromImage(
    file: File,
    inventoryItems: InventoryItem[]
): Promise<ExtractionResult & { ocrSource: "live" }> {
    const ocrPayload = await callRealOcr(file);
    const extractedText = extractTextFromOcrResponse(ocrPayload) ?? "";
    const matchedLines = extractMatchedLinesFromOcrResponse(ocrPayload);

    let rows: ParsedInventoryRow[] = [];
    let warnings: string[] = [];

    if (matchedLines.length) {
        rows = matchedLines
            .map(buildRowFromMatchedLine)
            .filter((row): row is ParsedInventoryRow => Boolean(row));

        warnings = rows
            .filter((row) => row.needs_review)
            .map((row) => `Needs review: "${row.raw_text}"`);
    }

    if (!rows.length) {
        const fallback = parseExtractedInventoryText(extractedText, inventoryItems);
        rows = fallback.rows;
        warnings = fallback.warnings;
    }

    return { extractedText, rows, warnings, ocrSource: "live" };
}

export function rowsToCsv(rows: ParsedInventoryRow[]): string {
    const headers = [
        "qty",
        "uom",
        "description",
        "specification",
        "normalized_item",
        "confidence",
        "matched_code",
        "needs_review",
        "raw_text",
    ];

    const escape = (value: unknown): string => {
        const text = value == null ? "" : String(value);
        return `"${text.replace(/"/g, '""')}"`;
    };

    const body = rows.map((row) =>
        [
            row.qty,
            row.uom,
            row.description,
            row.specification,
            row.normalized_item,
            row.confidence,
            row.matched_code,
            row.needs_review,
            row.raw_text,
        ]
            .map(escape)
            .join(",")
    );

    return [headers.join(","), ...body].join("\n");
}

