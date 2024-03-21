using Npgsql;
using System.Collections.Generic;
using System.Xml;
using Microsoft.Extensions.Configuration;
using RestieAPI.Models.Response;

namespace RestieAPI.Configs
{
    public class DatabaseService
    {
        private readonly string _connectionString;

        public DatabaseService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("MyDatabase");
        }
        public CommonModels.ResponseModelNonQuery ExecuteNonQuery(string sql  ,Dictionary<string, object> parameters = null)
        {


            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        var cmd = new NpgsqlCommand(sql, connection);

                        if (parameters != null)
                        {
                            foreach (var param in parameters)
                            {
                                cmd.Parameters.AddWithValue(param.Key, param.Value);
                            }
                        }

                        tran.Commit();
                        return new CommonModels.ResponseModelNonQuery
                        {
                            reader = cmd.ExecuteNonQuery(),
                            success = true,
                            statusCode = 200,
                        };
                    }
                    catch (Exception)
                    {
                        tran.Rollback();
                        return new CommonModels.ResponseModelNonQuery
                        {
                            reader = 0,
                            success = false,
                            statusCode = 500,
                        };
                        throw;
                    }
                }
            }




        }

        public CommonModels.ResponseModelReader ExecuteQuery(string sql, Dictionary<string, object> parameters = null)
        {

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        using (var cmd = new NpgsqlCommand(sql, connection))
                        {
                            if (parameters != null)
                            {
                                foreach (var param in parameters)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                            }

                            var reader = cmd.ExecuteReader();
                            tran.Commit();
                            return  new CommonModels.ResponseModelReader
                                {
                                    reader = reader,
                                    success = true,
                                    statusCode = 200
                                };

                                
                            
                        }
                    }
                    catch (Exception)
                    {
                        tran.Rollback();
                        return new CommonModels.ResponseModelReader
                        {
                            reader = null,
                            success = false,
                            statusCode = 500
                        };
                        //throw; // You don't need to throw the exception here; it will be rethrown by the caller
                    }
                }
            }



        }


    }
}
