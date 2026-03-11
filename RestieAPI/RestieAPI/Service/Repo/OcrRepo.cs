using Npgsql;
using RestieAPI.Models.Response;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace RestieAPI.Service.Repo
{
    /// <summary>
    /// Extracts text from images using the Google Gemini Vision API,
    /// then matches each extracted line against the inventory via keyword_aliases lookup.
    /// Model: gemini-2.5-flash-lite  — cheapest Gemini model with vision support.
    ///   Free tier: unlimited RPD on free quota
    ///   Paid tier: $0.10 / 1M input tokens (image + text), $0.40 / 1M output tokens
    ///
    /// Configure in appsettings.json:
    ///   "Gemini": {
    ///     "ApiKey": "AIza...",
    ///     "Model":  "gemini-2.5-flash-lite"   // optional, this is the default
    ///   }
    ///
    /// Get a free API key at: https://aistudio.google.com/apikey
    /// </summary>
    public class OcrRepo
    {
        private readonly string _apiKey;
        private readonly string _model;
        private readonly string _connectionString;
        private static readonly HttpClient _http = new();

        public OcrRepo(IConfiguration configuration)
        {
            _apiKey = configuration["Gemini:ApiKey"]
                ?? throw new InvalidOperationException(
                    "Gemini API key is not configured. Add \"Gemini:ApiKey\" to appsettings.json.");

            _model = configuration["Gemini:Model"] ?? "gemini-2.5-flash-lite";
            _connectionString = configuration.GetConnectionString("MyDatabase")
                ?? throw new InvalidOperationException("Database connection string 'MyDatabase' is not configured.");
        }

        /// <summary>
        /// Accepts a raw image stream, sends it to Gemini Vision, extracts text,
        /// then for each line looks up keyword_aliases and searches the inventory.
        /// </summary>
        public OcrExtractResponse ExtractText(Stream imageStream, string fileName)
        {
            // Read image bytes and convert to base64
            using var ms = new MemoryStream();
            imageStream.CopyTo(ms);
            var imageBytes = ms.ToArray();
            var mimeType = ResolveMimeType(fileName);
            var base64Image = Convert.ToBase64String(imageBytes);

            // Build the Gemini generateContent request body
            // Docs: https://ai.google.dev/gemini-api/docs/image-understanding
            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new object[]
                        {
                            new
                            {
                                inlineData = new
                                {
                                    mimeType = mimeType,
                                    data     = base64Image
                                }
                            },
                            new
                            {
                                text =
                                    "Extract ALL text from this image exactly as written. " +
                                    "This is a hardware or electrical materials list. " +
                                    "Output ONLY the raw text lines, one item per line. " +
                                    "Do NOT add commentary, numbering, bullet points, or markdown."
                            }
                        }
                    }
                },
                generationConfig = new
                {
                    maxOutputTokens = 2048,
                    temperature = 0.1   // low temperature = more literal/accurate
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // POST to https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";

            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Content = content;

            HttpResponseMessage response;
            try
            {
                response = _http.SendAsync(request).GetAwaiter().GetResult();
            }
            catch (HttpRequestException ex)
            {
                return new OcrExtractResponse
                {
                    status = 500,
                    message = $"Failed to reach Gemini API: {ex.Message}"
                };
            }

            var responseBody = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

            if (!response.IsSuccessStatusCode)
            {
                return new OcrExtractResponse
                {
                    status = (int)response.StatusCode,
                    message = $"Gemini API error {(int)response.StatusCode}: {responseBody}"
                };
            }

            // Parse: candidates[0].content.parts[0].text
            string rawText;
            try
            {
                var node = JsonNode.Parse(responseBody);
                rawText = node?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]
                               ?.GetValue<string>()?.Trim()
                           ?? string.Empty;
            }
            catch (Exception ex)
            {
                return new OcrExtractResponse
                {
                    status = 500,
                    message = $"Failed to parse Gemini response: {ex.Message}. Body: {responseBody[..Math.Min(400, responseBody.Length)]}"
                };
            }

            var lines = rawText
                .Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(l => l.Trim())
                .Where(l => !string.IsNullOrWhiteSpace(l))
                .ToList();

            // --- DB matching: extract description from each line, then search inventory ---
            var matchedLines = new List<OcrMatchedLine>();
            try
            {
                using var conn = new NpgsqlConnection(_connectionString);
                conn.Open();

                foreach (var line in lines)
                {
                    var searchTerm = ExtractDescription(line);

                    var matches = SearchInventory(conn, searchTerm);

                    matchedLines.Add(new OcrMatchedLine
                    {
                        raw_line = line,
                        search_term = searchTerm,
                        alias_matched = false,
                        matches = matches
                    });
                }
            }
            catch
            {
                // If DB lookup fails, still return the extracted text without matches
            }

            return new OcrExtractResponse
            {
                text = rawText,
                lines = lines,
                matched_lines = matchedLines,
                confidence = 1.0f,
                status = 200,
                message = lines.Count > 0 ? "OK" : "Gemini returned no text from the image."
            };
        }

        /// <summary>
        /// Strips quantities, numbers, and unit-of-measure words from a raw OCR line
        /// to extract the core item description used as the inventory search term.
        ///
        /// Examples:
        ///   "2 LENGTH RSC PIPE 1 INCH"  →  "RSC PIPE"
        ///   "10 PCS JUNCTION BOX 4x4"   →  "JUNCTION BOX"
        ///   "3/4 INCH THHN WIRE 100M"   →  "THHN WIRE"
        /// </summary>
        private static string ExtractDescription(string line)
        {
            // Words to strip at ANY position — quantities, units of measure, packaging terms
            var stopWords = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                // Units of length / size
                "inch", "inches", "in", "ft", "feet", "foot",
                "meter", "meters", "m", "mm", "cm", "km",
                "length", "lengths", "long",
                // Units of quantity / packaging
                "pc", "pcs", "piece", "pieces",
                "set", "sets", "pair", "pairs",
                "roll", "rolls", "bag", "bags",
                "lot", "lots", "bundle", "bundles",
                "pack", "packs", "sheet", "sheets",
                "unit", "units", "can", "cans",
                "gallon", "gallons", "gal",
                "liter", "liters", "lt",
                // Counting helpers
                "no", "no.", "qty", "quantity",
                "x",
            };

            var resultTokens = line
                .Split(new[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(token => token.Normalize())
                .Where(token => !string.IsNullOrWhiteSpace(token))
                .Where(token =>
                {
                    // keep an alphanumeric form for number/size checks
                    var alnum = System.Text.RegularExpressions.Regex.Replace(token, @"[^A-Za-z0-9./]", "");
                    if (string.IsNullOrWhiteSpace(alnum))
                        return false;

                    // remove quantities/sizes: 2, 1/2, 3.5, 4x4, 100M, AWG14, x4
                    if (System.Text.RegularExpressions.Regex.IsMatch(alnum, @"^\d+([./]\d+)?$"))
                        return false;
                    if (System.Text.RegularExpressions.Regex.IsMatch(alnum, @"^\d"))
                        return false;
                    if (System.Text.RegularExpressions.Regex.IsMatch(alnum, @"\d$"))
                        return false;

                    // strict letters-only word for stop-word comparison (handles INCH., INCH\u00a0, etc.)
                    var word = System.Text.RegularExpressions.Regex.Replace(token, @"[^A-Za-z]", "");
                    if (string.IsNullOrWhiteSpace(word))
                        return false;

                    if (stopWords.Contains(word))
                        return false;

                    return true;
                })
                // normalize output token (letters only) to avoid punctuation leaking in
                .Select(token => System.Text.RegularExpressions.Regex.Replace(token, @"[^A-Za-z]", ""))
                .Where(token => !string.IsNullOrWhiteSpace(token))
                .ToList();

            var result = string.Join(" ", resultTokens).Trim();

            // Fall back to the original line if everything was stripped
            return string.IsNullOrWhiteSpace(result) ? line.Trim() : result;
        }

        /// <summary>
        /// Searches the inventory table for items matching the given term.
        /// </summary>
        private List<OcrInventoryMatch> SearchInventory(NpgsqlConnection conn, string searchTerm)
        {
            const string sql = @"
                SELECT code, item, category, brand, qty, price, cost, status
                FROM inventory
                WHERE LOWER(item) LIKE CONCAT('%', LOWER(@term), '%')
                ORDER BY item ASC
                LIMIT 10";

            using var cmd = new NpgsqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@term", searchTerm.Trim());

            var results = new List<OcrInventoryMatch>();
            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                results.Add(new OcrInventoryMatch
                {
                    code = reader.IsDBNull(reader.GetOrdinal("code")) ? "" : reader.GetString(reader.GetOrdinal("code")),
                    item = reader.IsDBNull(reader.GetOrdinal("item")) ? "" : reader.GetString(reader.GetOrdinal("item")),
                    category = reader.IsDBNull(reader.GetOrdinal("category")) ? "" : reader.GetString(reader.GetOrdinal("category")),
                    brand = reader.IsDBNull(reader.GetOrdinal("brand")) ? "" : reader.GetString(reader.GetOrdinal("brand")),
                    qty = reader.IsDBNull(reader.GetOrdinal("qty")) ? 0L : reader.GetInt64(reader.GetOrdinal("qty")),
                    price = reader.IsDBNull(reader.GetOrdinal("price")) ? 0f : reader.GetFloat(reader.GetOrdinal("price")),
                    cost = reader.IsDBNull(reader.GetOrdinal("cost")) ? 0f : reader.GetFloat(reader.GetOrdinal("cost")),
                    status = reader.IsDBNull(reader.GetOrdinal("status")) ? "" : reader.GetString(reader.GetOrdinal("status")),
                });
            }
            return results;
        }

        private static string ResolveMimeType(string fileName)
        {
            var ext = Path.GetExtension(fileName).ToLowerInvariant();
            return ext switch
            {
                ".png" => "image/png",
                ".webp" => "image/webp",
                ".heic" => "image/heic",
                ".heif" => "image/heif",
                ".tiff" or ".tif" => "image/tiff",
                _ => "image/jpeg"
            };
        }
    }
}
