using Npgsql;
using RestieAPI.Configs;
using RestieAPI.Models.Request;
using RestieAPI.Models.Response;
using static RestieAPI.Models.Request.UserRequestModel;

namespace RestieAPI.Service.Repo
{
    public class UserRepo
    {
        public IConfiguration configuration;
        private readonly DatabaseService _databaseService;
        private readonly string _connectionString;
        public UserRepo(IConfiguration configuration)
        {
            this.configuration = configuration;
            _databaseService = new DatabaseService(configuration);
            _connectionString = configuration.GetConnectionString("MyDatabase");
        }

        public List<GetAuthuser> authenticateUser(Authuser authuser)
        {
            var sql = @"SELECT * FROM useraccount WHERE username = @username AND password = crypt(@password, password);";
            var parameters = new Dictionary<string, object>
            {
                { "@username", authuser.username },
                { "@password", authuser.password },
            };

            var results = new List<GetAuthuser>();

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        using (var cmd = new NpgsqlCommand(sql, connection))
                        {
                            foreach (var param in parameters)
                            {
                                cmd.Parameters.AddWithValue(param.Key, param.Value);
                            }

                            using (var reader = cmd.ExecuteReader())
                            {
                                while (reader.Read())
                                {
                                    var inventoryItem = new GetAuthuser
                                    {
                                        id = reader.GetString(reader.GetOrdinal("id")),
                                        username = reader.GetString(reader.GetOrdinal("username")),
                                        name = reader.GetString(reader.GetOrdinal("name")),
                                        role = reader.GetString(reader.GetOrdinal("role")),
                                    };

                                    results.Add(inventoryItem);
                                }
                            }
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return results;
                    }
                    catch (Exception)
                    {
                        tran.Rollback();
                        return null;
                        throw;
                    }
                }
            }
        }

    }
}
