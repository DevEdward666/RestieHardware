using Microsoft.AspNetCore.Mvc;
using Npgsql;
using RestieAPI.Configs;
using RestieAPI.Models.Request;
using RestieAPI.Models.Response;
using System.Collections.Generic;
using static RestieAPI.Models.Request.InventoryRequestModel;

namespace RestieAPI.Service.Repo
{
    public class InventoryRepo
    {
        public IConfiguration configuration;
        private readonly DatabaseService _databaseService;
        private readonly string _connectionString;
        public InventoryRepo(IConfiguration configuration)
        {
            this.configuration = configuration;
            _databaseService = new DatabaseService(configuration);
            _connectionString = configuration.GetConnectionString("MyDatabase");
        }


        public InventoryItemModel fetchInventory(InventoryRequestModel.GetAllInventory getAllInventory)
        {
            var sql = @"SELECT * FROM Inventory ORDER BY code LIMIT @limit OFFSET @offset;";

            var parameters = new Dictionary<string, object>
            {
                { "@limit", getAllInventory.limit },
                { "@offset", getAllInventory.offset },
                { "@searchTerm", getAllInventory.searchTerm }
            };

            var results = new List<InventoryItems>();

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
                                    var inventoryItem = new InventoryItems
                                    {
                                        code = reader.GetString(reader.GetOrdinal("code")),
                                        item = reader.GetString(reader.GetOrdinal("item")),
                                        category = reader.GetString(reader.GetOrdinal("category")),
                                        qty = reader.GetInt64(reader.GetOrdinal("qty")),
                                        reorderqty = reader.GetInt32(reader.GetOrdinal("reorderqty")),
                                        cost = reader.GetFloat(reader.GetOrdinal("cost")),
                                        price = reader.GetFloat(reader.GetOrdinal("price")),
                                        status = reader.GetString(reader.GetOrdinal("status")),
                                        createdat = reader.GetInt64(reader.GetOrdinal("createdat")),
                                        updatedat = reader.GetInt64(reader.GetOrdinal("updatedat"))
                                    };

                                    results.Add(inventoryItem);
                                }
                            }
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                    }
                    catch (Exception)
                    {
                        tran.Rollback();
                        throw;
                    }
                }
            }

            return new InventoryItemModel
            {
                result = results
            };
        }
        public InventoryItemModel searchInventory(InventoryRequestModel.GetAllInventory getAllInventory)
        {
            var sql = @"SELECT * FROM Inventory 
                        WHERE LOWER(code) LIKE CONCAT('%', LOWER(@searchTerm), '%') OR 
                              LOWER(item) LIKE CONCAT('%', LOWER(@searchTerm), '%') OR 
                              LOWER(category) LIKE CONCAT('%', LOWER(@searchTerm), '%') 
                        ORDER BY code 
                        LIMIT @limit;";

            var parameters = new Dictionary<string, object>
            {
                { "@limit", getAllInventory.limit },
                { "@searchTerm", getAllInventory.searchTerm }
            };


            var results = new List<InventoryItems>();

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
                                    var inventoryItem = new InventoryItems
                                    {
                                        code = reader.GetString(reader.GetOrdinal("code")),
                                        item = reader.GetString(reader.GetOrdinal("item")),
                                        category = reader.GetString(reader.GetOrdinal("category")),
                                        qty = reader.GetInt64(reader.GetOrdinal("qty")),
                                        reorderqty = reader.GetInt32(reader.GetOrdinal("reorderqty")),
                                        cost = reader.GetFloat(reader.GetOrdinal("cost")),
                                        price = reader.GetFloat(reader.GetOrdinal("price")),
                                        status = reader.GetString(reader.GetOrdinal("status")),
                                        createdat = reader.GetInt64(reader.GetOrdinal("createdat")),
                                        updatedat = reader.GetInt64(reader.GetOrdinal("updatedat"))
                                    };

                                    results.Add(inventoryItem);
                                }
                            }
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                    }
                    catch (Exception)
                    {
                        tran.Rollback();
                        throw;
                    }
                }
            }

            return new InventoryItemModel
            {
                result = results
            };
        }


        public PostInventoryResponse PostInventory(InventoryRequestModel.PostInventory postInventory)
        {
            var sql = @"insert into inventorylogs (logid,code,onhandqty,addedqty,supplierid,cost,price,createdat) values(@logid,@code,@onhandqty,@addedqty,@supplierid,@cost,@price,@createdat)";
            var updatesql = @"update  inventory set qty=@onhandqty + @addedqty,cost=@cost,price=@price,createdat=@createdat where code=@code";

            var parameters = new Dictionary<string, object>
            {
                { "@logid", postInventory.logid },
                { "@code", postInventory.code },
                { "@onhandqty", postInventory.onhandqty },
                { "@addedqty", postInventory.addedqty },
                { "@supplierid", postInventory.supplierid },
                { "@cost", postInventory.cost },
                { "@price", postInventory.price },
                { "@createdat", postInventory.createdat },
            };

            var results = new List<InventoryItems>();

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        var insert = 0;
                        var update = 0;
                        using (var cmd = new NpgsqlCommand(sql, connection))
                        {
                            foreach (var param in parameters)
                            {
                                cmd.Parameters.AddWithValue(param.Key, param.Value);
                            }

                            insert = cmd.ExecuteNonQuery();
                        }
                        using (var cmd = new NpgsqlCommand(updatesql, connection))
                        {
                            foreach (var param in parameters)
                            {
                                cmd.Parameters.AddWithValue(param.Key, param.Value);
                            }

                            if (insert > 0)
                            {
                                var updateparameters = new Dictionary<string, object>
                                    {
                                    { "@code", postInventory.code },
                                    { "@onhandqty", postInventory.onhandqty },
                                    { "@addedqty", postInventory.addedqty },
                                    { "@cost", postInventory.cost },
                                    { "@price", postInventory.price },
                                    { "@createdat", postInventory.createdat },
                                };
                                update = cmd.ExecuteNonQuery();

                            }
                        }
                       

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new PostInventoryResponse
                        {
                            status = update
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new PostInventoryResponse
                        {
                            status = 500,
                            ErrorMessage = ex.Message
                        };
                        throw;
                    }
                }
            }

          
        }

        public PostInventoryResponse AddtoCart(InventoryRequestModel.AddToCart addToCart)
        {
            var sql = @"insert into cart (cartid,code,item,qty,price,total,createdat,status) values(@cartid,@code,@item,@qty,@price,@total,@createdat,@status)";
            var updatesql = @"update  inventory set qty=@onhandqty where code=@code";

            var parameters = new Dictionary<string, object>
            {
                { "@cartid", addToCart.cartid },
                { "@code", addToCart.code },
                { "@item", addToCart.item },
                { "@qty", addToCart.qty },
                { "@price", addToCart.price },
                { "@total", addToCart.qty * addToCart.price },
                { "@createdat", addToCart.createdat },
                { "@status", addToCart.status },
            };

            var results = new List<InventoryItems>();

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        var insert = 0;
                        var update = 0;
                        using (var cmd = new NpgsqlCommand(sql, connection))
                        {
                            foreach (var param in parameters)
                            {
                                cmd.Parameters.AddWithValue(param.Key, param.Value);
                            }

                            insert = cmd.ExecuteNonQuery();
                        }
                        using (var cmd = new NpgsqlCommand(updatesql, connection))
                        {

                            if (insert > 0)
                            {
                                var updateparameters = new Dictionary<string, object>
                                    {
                                    { "@onhandqty", addToCart.onhandqty - addToCart.qty },
                                     { "@code", addToCart.code },
                                };
                                foreach (var param in updateparameters)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                                update = cmd.ExecuteNonQuery();

                            }
                          

                        }


                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new PostInventoryResponse
                        {
                            status = update
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new PostInventoryResponse
                        {
                            status = 500,
                            ErrorMessage = ex.Message
                        };
                        throw;
                    }
                }
            }


        }
        //public PostInventoryResponse PostInventory(InventoryRequestModel.PostInventory postInventory)
        //{
        //    try
        //    {
        //        var sql = @"insert into inventorylogs (logid,code,onhandqty,addedqty,supplierid,cost,price,createdat) values(@logid,@code,@onhandqty,@addedqty,@supplierid,@cost,@price,@createdat)";
        //        var updatesql = @"update  inventory set qty=@onhandqty + @addedqty,cost=@cost,price=@price,createdat=@createdat where code=@code";

        //        var parameters = new Dictionary<string, object>
        //    {
        //        { "@logid", postInventory.logid },
        //        { "@code", postInventory.code },
        //        { "@onhandqty", postInventory.onhandqty },
        //        { "@addedqty", postInventory.addedqty },
        //        { "@supplierid", postInventory.supplierid },
        //        { "@cost", postInventory.cost },
        //        { "@price", postInventory.price },
        //        { "@createdat", postInventory.createdat },
        //    };
        //        var res = _databaseService.ExecuteNonQuery(sql, parameters);
        //        var updateRes = 0;
        //        if (res.reader > 0)
        //        {
        //            var updateparameters = new Dictionary<string, object>
        //        {
        //        { "@code", postInventory.code },
        //        { "@onhandqty", postInventory.onhandqty },
        //        { "@addedqty", postInventory.addedqty },
        //        { "@cost", postInventory.cost },
        //        { "@price", postInventory.price },
        //        { "@createdat", postInventory.createdat },
        //    };
        //            updateRes = _databaseService.ExecuteNonQuery(updatesql, updateparameters).reader;
        //        }
        //        return new PostInventoryResponse
        //        {
        //            status = updateRes
        //        };
        //    }
        //    catch (Exception ex)
        //    {
        //        return new PostInventoryResponse
        //        {
        //            status = 500,
        //            ErrorMessage = ex.Message
        //        };
        //    }

        //}
    }
}
