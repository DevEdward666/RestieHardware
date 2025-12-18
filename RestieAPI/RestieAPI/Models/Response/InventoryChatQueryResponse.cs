namespace RestieAPI.Models.Response;

public class InventoryChatQueryResponse
{
    public bool success { get; set; }
    public int statusCode { get; set; }
    public string? message { get; set; }

    public string? intent { get; set; }

    /// <summary>
    /// Echo of the structured query used.
    /// </summary>
    public object? query { get; set; }

    /// <summary>
    /// Intent-specific payload. For chat/tooling, keep it compact and predictable.
    /// </summary>
    public object? data { get; set; }
}

public class InventoryChatItem
{
    public string code { get; set; } = "";
    public string item { get; set; } = "";
    public string category { get; set; } = "";
    public string? brand { get; set; }
    public float price { get; set; }
    public long qty { get; set; }
}

