using Npgsql;
using System.Collections.Generic;
using System.Xml;
using Microsoft.Extensions.Configuration;

namespace RestieAPI.Configs
{
    public class DatabaseService
    {
        private readonly string _connectionString;

        public DatabaseService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("MyDatabase");
        }
        public int ExecuteNonQuery(string sql  ,Dictionary<string, object> parameters = null)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            connection.Open();

            using var cmd = new NpgsqlCommand(sql, connection);
            if (parameters != null)
            {
                foreach (var param in parameters)
                {
                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                }
            }
           return cmd.ExecuteNonQuery();
        }

        public NpgsqlDataReader ExecuteQuery(string sql, Dictionary<string, object> parameters = null)
        {
            var connection = new NpgsqlConnection(_connectionString);
            connection.Open();

            var cmd = new NpgsqlCommand(sql, connection);
            // Set parameters if provided
            if (parameters != null)
            {
                foreach (var param in parameters)
                {
                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                }
            }
            return cmd.ExecuteReader();
        }

      
    }
}
