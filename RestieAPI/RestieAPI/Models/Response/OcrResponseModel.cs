namespace RestieAPI.Models.Response
{
    public class OcrExtractResponse
    {
        /// <summary>
        /// The full raw text extracted from the image by OCR.
        /// </summary>
        public string text { get; set; } = string.Empty;

        /// <summary>
        /// Individual lines of the extracted text (empty lines removed).
        /// </summary>
        public List<string> lines { get; set; } = new();

        /// <summary>
        /// Per-line inventory match results (alias lookup + inventory search).
        /// </summary>
        public List<OcrMatchedLine> matched_lines { get; set; } = new();

        /// <summary>
        /// Confidence score (1.0 for Gemini AI).
        /// </summary>
        public float confidence { get; set; }

        /// <summary>
        /// HTTP-style status code mirrored in the body for client convenience.
        /// </summary>
        public int status { get; set; } = 200;

        /// <summary>
        /// Human-readable result message.
        /// </summary>
        public string message { get; set; } = "OK";
    }

    /// <summary>
    /// One extracted line paired with its resolved inventory matches.
    /// </summary>
    public class OcrMatchedLine
    {
        /// <summary>The raw text line as extracted by Gemini.</summary>
        public string raw_line { get; set; } = string.Empty;

        /// <summary>
        /// The term actually used to search inventory.
        /// If an alias was found in keyword_aliases, this is the resolved_name;
        /// otherwise it is the raw_line itself.
        /// </summary>
        public string search_term { get; set; } = string.Empty;

        /// <summary>True when the search_term came from keyword_aliases.</summary>
        public bool alias_matched { get; set; }

        /// <summary>Inventory rows that matched the search_term.</summary>
        public List<OcrInventoryMatch> matches { get; set; } = new();
    }

    /// <summary>
    /// A single inventory row returned as a match for an extracted line.
    /// </summary>
    public class OcrInventoryMatch
    {
        public string code { get; set; } = string.Empty;
        public string item { get; set; } = string.Empty;
        public string category { get; set; } = string.Empty;
        public string brand { get; set; } = string.Empty;
        public long qty { get; set; }
        public float price { get; set; }
        public float cost { get; set; }
        public string status { get; set; } = string.Empty;
    }
}
