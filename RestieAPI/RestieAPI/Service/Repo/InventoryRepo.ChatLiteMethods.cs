using Npgsql;
using RestieAPI.Models.Response;

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
            int limit = 10,
            int offset = 0)
        {
            q = (q ?? string.Empty).Trim();
            category = (category ?? string.Empty).Trim();
            brand = (brand ?? string.Empty).Trim();

            limit = System.Math.Clamp(limit, 1, 25);
            offset = System.Math.Max(0, offset);

            var order = NormalizeSort(sort);

            var sql = $@"
SELECT code, item, category, brand, price, qty
FROM inventory
WHERE (
    LOWER(code) LIKE CONCAT('%', LOWER(@q), '%')
    OR LOWER(item) LIKE CONCAT('%', LOWER(@q), '%')
)
AND LOWER(category) LIKE CONCAT('%', LOWER(@category), '%')
AND LOWER(brand) LIKE CONCAT('%', LOWER(@brand), '%')
ORDER BY price {order}
LIMIT @limit OFFSET @offset;";

            var results = new List<InventoryLiteItem>();
            using var connection = new NpgsqlConnection(_connectionString);
            connection.Open();

            using var cmd = new NpgsqlCommand(sql, connection);
            cmd.Parameters.AddWithValue("@q", q);
            cmd.Parameters.AddWithValue("@category", category);
            cmd.Parameters.AddWithValue("@brand", brand);
            cmd.Parameters.AddWithValue("@limit", limit);
            cmd.Parameters.AddWithValue("@offset", offset);

            using var reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                results.Add(new InventoryLiteItem
                {
                    code = reader.IsDBNull(reader.GetOrdinal("code")) ? "" : reader.GetString(reader.GetOrdinal("code")),
                    item = reader.IsDBNull(reader.GetOrdinal("item")) ? "" : reader.GetString(reader.GetOrdinal("item")),
                    category = reader.IsDBNull(reader.GetOrdinal("category")) ? "" : reader.GetString(reader.GetOrdinal("category")),
                    brand = reader.IsDBNull(reader.GetOrdinal("brand")) ? "" : reader.GetString(reader.GetOrdinal("brand")),
                    price = reader.IsDBNull(reader.GetOrdinal("price")) ? 0f : reader.GetFloat(reader.GetOrdinal("price")),
                    qty = reader.IsDBNull(reader.GetOrdinal("qty")) ? 0L : reader.GetInt64(reader.GetOrdinal("qty")),
                });
            }

            return results;
        }

        public InventoryLiteItem? GetCheapestLite(string? q, string? category, string? brand)
        {
            var items = SearchInventoryLite(q, category, brand, sort: "asc", limit: 1, offset: 0);
            return items.FirstOrDefault();
        }

        public (bool exists, List<InventoryLiteItem> matches) ExistsLite(string? qOrCode, string? category, string? brand, int top = 5)
        {
            top = System.Math.Clamp(top, 1, 25);
            var matches = SearchInventoryLite(qOrCode, category, brand, sort: "asc", limit: top, offset: 0);
            return (matches.Count > 0, matches);
        }
    }
}

