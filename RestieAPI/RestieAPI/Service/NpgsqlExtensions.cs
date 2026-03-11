namespace RestieAPI.Services;
using Npgsql;
public static class NpgsqlExtensions
{
    public static string SafeGetString(this NpgsqlDataReader reader, string columnName)
    {
        int ordinal = reader.GetOrdinal(columnName);
        return reader.IsDBNull(ordinal) ? string.Empty : reader.GetString(ordinal);
    }
}