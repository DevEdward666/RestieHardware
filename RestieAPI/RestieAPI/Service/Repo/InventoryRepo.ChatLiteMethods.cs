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
            // Pre-processing the "Hint"
            q = (q ?? "").Trim();
            category = (category ?? "").Trim();
            brand = (brand ?? "").Trim();

            // The SQL now uses 'OR' logic for the hint @q across multiple columns
            // and calculates a similarity score to prioritize the best "guess"
            var sql = @"
                    SELECT code, item, category, brand, price, qty,
                           ((word_similarity(@q, item) * 2) + similarity(category, @category)) as match_score
                    FROM inventory
                    WHERE (
                        (@q = '' OR item ILIKE '%' || @q || '%' OR item % @q OR category ILIKE '%' || @q || '%')
                    )
                    AND (@category = '' OR category ILIKE '%' || @category || '%' OR category % @category)
                    AND (@brand = '' OR brand ILIKE '%' || @brand || '%' OR brand % @brand)
                    ORDER BY match_score DESC
                    LIMIT @limit;";

            var results = new List<InventoryLiteItem>();
            using var connection = new NpgsqlConnection(_connectionString);
            connection.Open();

            using var cmd = new NpgsqlCommand(sql, connection);
            cmd.Parameters.AddWithValue("q", q);
            cmd.Parameters.AddWithValue("category", category);
            cmd.Parameters.AddWithValue("brand", brand);
            cmd.Parameters.AddWithValue("limit", limit);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                results.Add(new InventoryLiteItem
                {
                    // Using the Extension Method from the static class above
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

