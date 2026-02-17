using Npgsql;
using RestieAPI.Models.Response;
using RestieAPI.Services;

namespace RestieAPI.Service.Repo
{
    public partial class InventoryRepo
    {
        // Small response model for chat/AI flows.
        public sealed class InventoryLiteItem
        {
            public string code { get; set; } = "";
            public string item { get; set; } = "";
            public string category { get; set; } = "";
            public string brand { get; set; } = "";
            public float price { get; set; }
            public long qty { get; set; }
        }

        private static string NormalizeSort(string? sort)
            => string.Equals(sort?.Trim(), "desc", System.StringComparison.OrdinalIgnoreCase) ? "DESC" : "ASC";

    public List<InventoryLiteItem> SearchInventoryLite(
   string? q,
   string? category,
   string? brand,
   string sort = "asc",
   int limit = 10)
{
    // 1. Sanitize inputs to ensure no nulls reach the query
    q = (q ?? "").Trim();
    category = (category ?? "").Trim();
    brand = (brand ?? "").Trim();

    // 2. Use a cleaner SQL string structure. 
    // Note: I removed the extra parentheses around the @q check that often cause "Pos 126" errors.
    var sql = @"SELECT code, item, category, brand, price, qty,
       -- We use word_similarity to score how well the 'hint' fits the item name
       (word_similarity(@q, item) + similarity(category, @category)) as match_score
FROM inventory
WHERE 
    -- 1. Search the main 'Hint' (q)
    (@q = '' OR item ILIKE '%' || @q || '%' OR item % @q)
    
    -- 2. Category Filter (Handles Pipe vs Pipes)
    AND (@category = '' 
         OR category ILIKE '%' || @category || '%' 
         OR @category ILIKE '%' || category || '%' -- Symmetric ILIKE
         OR category % @category)                   -- Fuzzy match
    
    -- 3. Brand Filter
    AND (@brand = '' OR brand ILIKE '%' || @brand || '%' OR brand % @brand)

ORDER BY match_score DESC
LIMIT @limit;";

    var results = new List<InventoryLiteItem>();

    using var connection = new NpgsqlConnection(_connectionString);
    connection.Open();

    using var cmd = new NpgsqlCommand(sql, connection);
    // Explicitly naming parameters helps Npgsql map them correctly
    cmd.Parameters.AddWithValue("@q", q);
    cmd.Parameters.AddWithValue("@category", category);
    cmd.Parameters.AddWithValue("@brand", brand);
    cmd.Parameters.AddWithValue("@limit", limit);

    using var reader = cmd.ExecuteReader();
    while (reader.Read())
    {
        results.Add(new InventoryLiteItem
        {
            code = reader.SafeGetString("code"),
            item = reader.SafeGetString("item"),
            category = reader.SafeGetString("category"),
            brand = reader.SafeGetString("brand"),
            price = reader.IsDBNull(reader.GetOrdinal("price")) ? 0f : reader.GetFloat(reader.GetOrdinal("price")),
            qty = reader.IsDBNull(reader.GetOrdinal("qty")) ? 0L : reader.GetInt64(reader.GetOrdinal("qty"))
        });
    }
    return results;
}
        public InventoryLiteItem? GetCheapestLite(string? q, string? category, string? brand)
        {
            var items = SearchInventoryLite(q, category, brand, sort: "asc", limit: 1);
            return items.FirstOrDefault();
        }

        public (bool exists, List<InventoryLiteItem> matches) ExistsLite(string? qOrCode, string? category, string? brand, int top = 5)
        {
            top = System.Math.Clamp(top, 1, 25);
            var matches = SearchInventoryLite(qOrCode, category, brand, sort: "asc", limit: top);
            return (matches.Count > 0, matches);
        }
    }
}

