using Microsoft.AspNetCore.Mvc;
using Npgsql;
using RestieAPI.Configs;
using RestieAPI.Models.Request;
using RestieAPI.Models.Response;
using System.Collections.Generic;
using System.Data;
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
                        return new InventoryItemModel
                        {
                            result = results,
                            success = true,
                            statusCode = 200
                        };
                    }
                    catch (Exception)
                    {
                        tran.Rollback();
                        return new InventoryItemModel
                        {
                            result = [],
                            success = false,
                            statusCode = 500
                        };
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
                        return new InventoryItemModel
                        {
                            result = results,
                            success=true,
                            statusCode= 200
                        };
                    }
                    catch (Exception)
                    {
                        tran.Rollback();
                        return new InventoryItemModel
                        {
                            result = [],
                            success = false,
                            statusCode = 500
                        };
                        throw;
                    }
                }
            }

            return new InventoryItemModel
            {
                result = results
            };
        }


        public PostResponse PostInventory(InventoryRequestModel.PostInventory postInventory)
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
                        return new PostResponse
                        {
                            Message="Successfully added",
                            status = update
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new PostResponse
                        {
                            status = 500,
                            Message = ex.Message
                        };
                        throw;
                    }
                }
            }

          
        }

        public PostResponse AddtoCart(InventoryRequestModel.AddToCart[] addToCartItems)
        {
            var sql = @"insert into cart (cartid,code,item,qty,price,total,createdat,status) 
                values(@cartid,@code,@item,@qty,@price,@total,@createdat,@status)";
            var insertOrder = @"insert into orders (orderid,cartid,total,paidthru,paidcash,createdby,createdat,status) 
                        values(@orderid,@cartid,@total,@paidthru,@paidcash,@createdby,@createdat,@status)";
            var updatesql = @"update  inventory set qty=@onhandqty where code=@code";

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();
                var total = 0.0;
                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        foreach (var addToCart in addToCartItems)
                        {
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

                            // Execute the insertion command for each item
                            using (var cmd = new NpgsqlCommand(sql, connection))
                            {
                                foreach (var param in parameters)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                                cmd.ExecuteNonQuery();
                            }
                            total = total + addToCart.qty * addToCart.price;
                        }
                          
                            // Execute the insertOrder command for each item
                            using (var cmd = new NpgsqlCommand(insertOrder, connection))
                            {
                                var insertOrderParams = new Dictionary<string, object>
                                {
                                    { "@orderid", addToCartItems[0].orderid },
                                    { "@cartid", addToCartItems[0].cartid },
                                    { "@total",  total},
                                    { "@paidthru", addToCartItems[0].paidthru },
                                    { "@paidcash", addToCartItems[0].paidcash },
                                    { "@createdby", addToCartItems[0].createdby },
                                    { "@createdat", addToCartItems[0].createdat },
                                    { "@status", addToCartItems[0].status },
                                };
                                foreach (var param in insertOrderParams)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                                cmd.ExecuteNonQuery();
                            }
                        foreach (var addToCart in addToCartItems)
                        {
                            // Execute the updatesql command for each item
                            using (var cmd = new NpgsqlCommand(updatesql, connection))
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
                                cmd.ExecuteNonQuery();
                            }
                        }
                        

                        // Commit the transaction after all items have been processed
                        tran.Commit();
                        return new PostResponse
                        {
                            status = 200,
                            Message = "Order successfully saved"
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new PostResponse
                        {
                            status = 500,
                            Message = ex.Message
                        };
                        throw;
                    }
                }
            }
        }
        public PostResponse UpdateCart(InventoryRequestModel.AddToCart[] addToCartItems)
        {
            var insertSql = @"SELECT update_or_insert_cart (@code, @item, @qty, @price, @total, @createdat, @status, @cartid);";


            var updateSql = @"UPDATE inventory AS i
                                SET qty = i.qty + COALESCE((@qty - c.qty), @qty)
                                FROM (
                                    SELECT SUM(qty) as qty
                                    FROM cart
                                    WHERE code = @code AND status = 'pending' AND cartid = @cartid
                                ) AS c
                                WHERE i.code = @code;";

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();
                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        foreach (var addToCart in addToCartItems)
                        {
                            using (var insertCommand = new NpgsqlCommand(insertSql, connection))
                            {
                                insertCommand.CommandType = CommandType.Text;
                                insertCommand.Parameters.AddWithValue("@cartid", addToCart.cartid);
                                insertCommand.Parameters.AddWithValue("@code", addToCart.code);
                                insertCommand.Parameters.AddWithValue("@item", addToCart.item);
                                insertCommand.Parameters.AddWithValue("@qty", addToCart.qty);
                                insertCommand.Parameters.AddWithValue("@price", addToCart.price);
                                insertCommand.Parameters.AddWithValue("@total", addToCart.qty * addToCart.price);
                                insertCommand.Parameters.AddWithValue("@createdat", addToCart.createdat);
                                insertCommand.Parameters.AddWithValue("@status", addToCart.status);
                                insertCommand.ExecuteNonQuery();
                            }
                        }
                        foreach (var addToCart in addToCartItems)
                        {
                            using (var updateCommand = new NpgsqlCommand(updateSql, connection))
                            {
                                updateCommand.Parameters.AddWithValue("@qty", addToCart.qty);
                                updateCommand.Parameters.AddWithValue("@code", addToCart.code);
                                updateCommand.Parameters.AddWithValue("@cartid", addToCart.cartid); // Assuming cartid is the same for all items
                                updateCommand.ExecuteNonQuery();
                            }
                        }

                        transaction.Commit();
                        return new PostResponse
                        {
                            status = 200,
                            Message = "Order successfully saved"
                        };
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        return new PostResponse
                        {
                            status = 500,
                            Message = ex.Message
                        };
                    }
                }
            }
        }

        public OrderResponseModel getOrder(InventoryRequestModel.GetUserOrder getUserOrder)
        {
            var sql = @"select * from orders where userid=@userid ORDER BY createdat LIMIT @limit OFFSET @offset;";

            var parameters = new Dictionary<string, object>
            {
                { "@userid", getUserOrder.userid },
                { "@limit", getUserOrder.limit },
                { "@offset", getUserOrder.offset },
            };


            var results = new List<OrderResponse>();

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
                                    var orderResponse = new OrderResponse
                                    {
                                        orderid = reader.GetString(reader.GetOrdinal("orderid")),
                                        cartid = reader.GetString(reader.GetOrdinal("cartid")),
                                        total = reader.GetFloat(reader.GetOrdinal("total")),
                                        paidthru = reader.GetString(reader.GetOrdinal("paidthru")),
                                        paidcash = reader.GetFloat(reader.GetOrdinal("paidcash")),
                                        createdby = reader.GetString(reader.GetOrdinal("createdby")),
                                        createdat = reader.GetInt64(reader.GetOrdinal("createdat")),
                                        status = reader.GetString(reader.GetOrdinal("status")),
                                        userid = reader.GetString(reader.GetOrdinal("userid")),
                                    };

                                    results.Add(orderResponse);
                                }
                            }
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new OrderResponseModel
                        {
                            result = results,
                            statusCode = 200,
                            success = true,

                        };
                    }
                    catch (Exception)
                    {
                        tran.Rollback();
                        return new OrderResponseModel
                        {
                            result = [],
                            statusCode = 500,
                            success = false,

                        };
                        throw;
                    }
                }
            }

          
        }
        public SelectedOrderResponseModel selectOrder(InventoryRequestModel.GetSelectedOrder getUserOrder)
        {
            var sql = @"SELECT ct.*,ors.createdby, ors.orderid,ors.total,ors.status
                        FROM orders AS ors
                        JOIN cart AS ct ON ors.cartid = ct.cartid
                        WHERE ors.userid = @userid and ors.orderid = @orderid;
                        ";

                var parameters = new Dictionary<string, object>
                {
                    { "@userid", getUserOrder.userid },
                    { "@orderid", getUserOrder.orderid },
                };


            var results = new List<SelectedOrderResponse>();

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
                                    var orderResponse = new SelectedOrderResponse
                                    {
                                        orderid = reader.GetString(reader.GetOrdinal("orderid")),
                                        cartid = reader.GetString(reader.GetOrdinal("cartid")),
                                        total = reader.GetFloat(reader.GetOrdinal("total")),
                                        item = reader.GetString(reader.GetOrdinal("item")),
                                        code = reader.GetString(reader.GetOrdinal("code")),
                                        createdby = reader.GetString(reader.GetOrdinal("createdby")),
                                        createdat = reader.GetInt64(reader.GetOrdinal("createdat")),
                                        status = reader.GetString(reader.GetOrdinal("status")),
                                        qty = reader.GetInt16(reader.GetOrdinal("qty")),
                                        price = reader.GetFloat(reader.GetOrdinal("price")),

                                    };

                                    results.Add(orderResponse);
                                }
                            }
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new SelectedOrderResponseModel
                        {
                            result = results,
                            statusCode = 200,
                            success = true,

                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new SelectedOrderResponseModel
                        {
                            result = [],
                            statusCode = 500,
                            success = false,

                        };
                        throw;
                    }
                }
            }


        }
        //public PostResponse PostInventory(InventoryRequestModel.PostInventory postInventory)
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
        //        return new PostResponse
        //        {
        //            status = updateRes
        //        };
        //    }
        //    catch (Exception ex)
        //    {
        //        return new PostResponse
        //        {
        //            status = 500,
        //            ErrorMessage = ex.Message
        //        };
        //    }

        //}
    }
}
