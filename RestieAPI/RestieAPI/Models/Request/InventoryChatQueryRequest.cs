using System.Text.Json.Serialization;

namespace RestieAPI.Models.Request;

public class InventoryChatQueryRequest
{
    /// <summary>
    /// Action the workflow wants to do. Designed to be stable for OpenAI tool outputs.
    /// </summary>
    [JsonPropertyName("intent")]
    public string? Intent { get; set; } // exists | price | list_brands | cheapest | details | search

    /// <summary>
    /// Free text query (product name/keyword). Example: "cement", "Royu".
    /// </summary>
    [JsonPropertyName("q")]
    public string? Q { get; set; }

    /// <summary>
    /// Exact item code (if you already have it).
    /// </summary>
    [JsonPropertyName("code")]
    public string? Code { get; set; }

    [JsonPropertyName("category")]
    public string? Category { get; set; }

    [JsonPropertyName("brand")]
    public string? Brand { get; set; }

    /// <summary>
    /// Sorting. Supported: price_asc, price_desc, name_asc, name_desc
    /// </summary>
    [JsonPropertyName("sort")]
    public string? Sort { get; set; }

    [JsonPropertyName("limit")]
    public int Limit { get; set; } = 10;

    [JsonPropertyName("offset")]
    public int Offset { get; set; } = 0;

    /// <summary>
    /// If true, allows including base64 images in some responses. False by default for chat payload size.
    /// </summary>
    [JsonPropertyName("includeImage")]
    public bool IncludeImage { get; set; } = false;
}

