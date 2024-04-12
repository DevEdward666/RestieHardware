using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Npgsql.Internal;
using RestieAPI.Configs;
using RestieAPI.Models.Request;
using RestieAPI.Models.Response;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Reflection.Metadata;
using static RestieAPI.Models.Request.InventoryRequestModel;
using Document = iTextSharp.text.Document;

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
            var sql = "";
            if(getAllInventory.filter == "asc")
            {
                sql = @"SELECT * FROM Inventory where LOWER(category) LIKE CONCAT('%', LOWER(@category), '%') and LOWER(brand) LIKE CONCAT('%', LOWER(@brand), '%') ORDER BY price ASC LIMIT @limit OFFSET @offset;";

            }
            if(getAllInventory.filter == "desc")
            {
                sql = @"SELECT * FROM Inventory where LOWER(category) LIKE CONCAT('%', LOWER(@category), '%') and LOWER(brand) LIKE CONCAT('%', LOWER(@brand), '%') ORDER BY price DESC LIMIT @limit OFFSET @offset;";

            }
            if (getAllInventory.filter == "alphaAZ")
            {
                sql = @"SELECT * FROM Inventory where LOWER(category) LIKE CONCAT('%', LOWER(@category), '%') and LOWER(brand) LIKE CONCAT('%', LOWER(@brand), '%') ORDER BY item ASC LIMIT @limit OFFSET @offset;";

            }
            if (getAllInventory.filter == "alphaZA")
            {
                sql = @"SELECT * FROM Inventory where LOWER(category) LIKE CONCAT('%', LOWER(@category), '%') and LOWER(brand) LIKE CONCAT('%', LOWER(@brand), '%') ORDER BY item DESC LIMIT @limit OFFSET @offset;";

            }
            if(getAllInventory.filter == "")
            {
                sql = @"SELECT * FROM Inventory where LOWER(category) LIKE CONCAT('%', LOWER(@category), '%') and LOWER(brand) LIKE CONCAT('%', LOWER(@brand), '%') ORDER BY item LIMIT @limit OFFSET @offset;";

            }

            var parameters = new Dictionary<string, object>
            {
                { "@limit", getAllInventory.limit },
                { "@offset", getAllInventory.offset },
                { "@searchTerm", getAllInventory.searchTerm },
                { "@category", getAllInventory.category },
                { "@brand", getAllInventory.brand }
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
                                        brand = reader.GetString(reader.GetOrdinal("brand")),
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
        }
        public InventoryItemModel searchInventory(InventoryRequestModel.GetAllInventory getAllInventory)
        {
            var sql = "";
            if(getAllInventory.filter == "asc")
            {
                sql = @"SELECT * FROM Inventory 
                        WHERE LOWER(code) LIKE CONCAT('%', LOWER(@searchTerm), '%') OR 
                              LOWER(item) LIKE CONCAT('%', LOWER(@searchTerm), '%') AND
                              LOWER(category) LIKE CONCAT('%', LOWER(@category), '%') and LOWER(brand) LIKE CONCAT('%', LOWER(@brand), '%')
                        ORDER BY price ASC 
                        LIMIT @limit;";
            }
            if (getAllInventory.filter == "desc")
            {
                sql = @"SELECT * FROM Inventory 
                        WHERE LOWER(code) LIKE CONCAT('%', LOWER(@searchTerm), '%') OR 
                              LOWER(item) LIKE CONCAT('%', LOWER(@searchTerm), '%') AND
                              LOWER(category) LIKE CONCAT('%', LOWER(@category), '%') and LOWER(brand) LIKE CONCAT('%', LOWER(@brand), '%')
                        ORDER BY price DESC 
                        LIMIT @limit;";
            }
            if (getAllInventory.filter == "alphaAZ")
            {
                sql = @"SELECT * FROM Inventory 
                        WHERE LOWER(code) LIKE CONCAT('%', LOWER(@searchTerm), '%') OR 
                              LOWER(item) LIKE CONCAT('%', LOWER(@searchTerm), '%') AND
                              LOWER(category) LIKE CONCAT('%', LOWER(@category), '%') and LOWER(brand) LIKE CONCAT('%', LOWER(@brand), '%')
                        ORDER BY item ASC 
                        LIMIT @limit;";
            }
            if (getAllInventory.filter == "alphaZA")
            {
                sql = @"SELECT * FROM Inventory 
                        WHERE LOWER(code) LIKE CONCAT('%', LOWER(@searchTerm), '%') OR 
                              LOWER(item) LIKE CONCAT('%', LOWER(@searchTerm), '%') AND
                              LOWER(category) LIKE CONCAT('%', LOWER(@category), '%') and LOWER(brand) LIKE CONCAT('%', LOWER(@brand), '%')
                        ORDER BY item DESC 
                        LIMIT @limit;";
            }
            if (getAllInventory.filter == "")
            {
                sql = @"SELECT * FROM Inventory 
                        WHERE LOWER(code) LIKE CONCAT('%', LOWER(@searchTerm), '%') OR 
                              LOWER(item) LIKE CONCAT('%', LOWER(@searchTerm), '%') AND
                              LOWER(category) LIKE CONCAT('%', LOWER(@category), '%') and LOWER(brand) LIKE CONCAT('%', LOWER(@brand), '%')
                        ORDER BY item 
                        LIMIT @limit;";
            }

            var parameters = new Dictionary<string, object>
            {
                { "@limit", getAllInventory.limit },
                { "@searchTerm", getAllInventory.searchTerm },
                { "@category", getAllInventory.category },
                { "@brand", getAllInventory.brand }
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
                                        brand = reader.GetString(reader.GetOrdinal("brand")),
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


      
        public PostResponse AddCustomerInfo(InventoryRequestModel.PostCustomerInfo postCustomerInfo)
        {
            var sql = @"insert into customer (customerid,name,contactno,address,createdat) 
                values(@customerid,@name,@contactno,@address,@createdat)";
        
            var parameters = new Dictionary<string, object>
            {
                { "@customerid", postCustomerInfo.customerid },
                { "@name", postCustomerInfo.name },
                { "@contactno", postCustomerInfo.contactno },
                { "@address", postCustomerInfo.address },
                { "@createdat", postCustomerInfo.createdat },
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
                        using (var cmd = new NpgsqlCommand(sql, connection))
                        {
                            foreach (var param in parameters)
                            {
                                cmd.Parameters.AddWithValue(param.Key, param.Value);
                            }

                            insert = cmd.ExecuteNonQuery();
                        }
                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new PostResponse
                        {
                            Message = "Successfully added",
                            status = 200
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
        public PostResponse updateCart(InventoryRequestModel.AddToCart[] addToCartItems)
        {
            var updatecart = @"update cart set status=@status,qty=@qty,total=@total,updateat=@updateat where cartid=@cartid";
            var updateOrder = @"update  orders set total=@total,paidthru=@paidthru,paidcash=@paidcash,updateat=@updateat  where orderid = @orderid";

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();
                var total = 0.0;
                var cmd = new NpgsqlCommand();
                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        foreach (var addToCart in addToCartItems)
                        {
                            var parameters = new Dictionary<string, object>
                            {
                                { "@cartid", addToCart.cartid },
                                { "@qty", addToCart.qty },
                                { "@price", addToCart.price },
                                { "@total", addToCart.qty * addToCart.price },
                                { "@createdat", addToCart.createdat },
                                { "@updateat", addToCart.updateat },
                            };

                            // Execute the insertion command for each item
                            using ( cmd = new NpgsqlCommand(updatecart, connection))
                            {
                                foreach (var param in parameters)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                                cmd.ExecuteNonQuery();
                            }
                            total = total + addToCart.qty * addToCart.price;
                        }
                       
                        foreach (var addToCart in addToCartItems)
                        {
                            using ( cmd = new NpgsqlCommand(updateOrder, connection))
                            {
                                var updateOrderParams = new Dictionary<string, object>
                                    {
                                        { "@orderid", addToCart.orderid },
                                        { "@total",  total},
                                        { "@paidthru", addToCart.paidthru },
                                        { "@paidcash", addToCart.paidcash },
                                        { "@createdby", addToCart.createdby },
                                        { "@createdat", addToCart.createdat },
                                        { "@status", addToCart.status },
                                    };
                                foreach (var param in updateOrderParams)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                              
                            }
                           
                        }
                        cmd.ExecuteNonQuery();

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
        public PostResponse AddToCart(InventoryRequestModel.AddToCart[] addToCartItems)
        {
            var orderid = Guid.NewGuid();
            var sql = @"insert into cart (cartid,code,item,qty,price,total,createdat,status) 
                values(@cartid,@code,@item,@qty,@price,@total,@createdat,@status)";
            var insertOrder = "";
            if (addToCartItems[0].orderid.Length > 0) 
            {
                insertOrder = @"update orders set total=@total,paidthru=@paidthru,paidcash=@paidcash,updateat=@updateat,status=@status  where orderid = @orderid";
            }
            else
            {
                insertOrder = @"insert into orders (orderid,cartid,total,paidthru,paidcash,createdby,createdat,status,userid,type) 
                        values(@orderid,@cartid,@total,@paidthru,@paidcash,@createdby,@createdat,@status,@userid,@type)";
            }
          

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
                            var insertOrderParams = new Dictionary<string, object> { };
                            if (addToCartItems[0].orderid.Length > 0)
                            {
                                 insertOrderParams = new Dictionary<string, object>
                                {
                                    { "@orderid", addToCartItems[0].orderid },
                                    { "@total",  total},
                                    { "@paidthru", addToCartItems[0].paidthru },
                                    { "@paidcash", addToCartItems[0].paidcash },
                                    { "@updateat", addToCartItems[0].updateat },
                                    { "@status", addToCartItems[0].status },
                                };
                            }
                            else
                            {
                                insertOrderParams = new Dictionary<string, object>
                                {

                                    { "@orderid",  orderid.ToString() },
                                    { "@cartid", addToCartItems[0].cartid },
                                    { "@total",  total},
                                    { "@paidthru", addToCartItems[0].paidthru },
                                    { "@paidcash", addToCartItems[0].paidcash },
                                    { "@createdby", addToCartItems[0].createdby },
                                    { "@createdat", addToCartItems[0].createdat },
                                    { "@status", addToCartItems[0].status },
                                    { "@userid", addToCartItems[0].userid },
                                    { "@type", addToCartItems[0].type },
                                };
                            }
                          
                            foreach (var param in insertOrderParams)
                            {
                                cmd.Parameters.AddWithValue(param.Key, param.Value);
                            }
                            cmd.ExecuteNonQuery();
                        }
                        // Commit the transaction after all items have been processed
                        tran.Commit();
                        return new PostResponse
                        {
                            result = new SaveOrderResponse
                            {
                                orderid = addToCartItems[0].orderid.Length > 0? addToCartItems[0].orderid: orderid.ToString(),
                                cartid = addToCartItems[0].cartid
                            },
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
        public PostResponse SavetoCartandUpdateInventory(InventoryRequestModel.AddToCart[] addToCartItems)
        {
            var sql = @"insert into cart (cartid,code,item,qty,price,total,createdat,status) 
                values(@cartid,@code,@item,@qty,@price,@total,@createdat,@status)";
            var insertOrder = @"insert into orders (orderid,cartid,total,paidthru,paidcash,createdby,createdat,status,userid,type) 
                        values(@orderid,@cartid,@total,@paidthru,@paidcash,@createdby,@createdat,@status,@userid,@type)";
            //var updatecart = @"update cart set status=@status,qty=@qty,total=@total,updateat=@updateat where cartid=@cartid";
            //var updateOrder = @"update orders set total=@total,paidthru=@paidthru,paidcash=@paidcash,updateat=@updateat  where orderid = @orderid";
            var updatesql = @"update  inventory set qty=@onhandqty where code=@code";
            var InsertTransaction = @"insert into transaction (transid,orderid,customer,cashier,status,createdat) 
                                    values(@transid,@orderid,@customer,@cashier,@status,@createdat)";
            var orderid = Guid.NewGuid();
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();
                var total = 0.0;
                var transid = Guid.NewGuid().ToString();
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
                                    { "@orderid", orderid },
                                    { "@cartid", addToCartItems[0].cartid },
                                    { "@total",  total},
                                    { "@paidthru", addToCartItems[0].paidthru },
                                    { "@paidcash", addToCartItems[0].paidcash },
                                    { "@createdby", addToCartItems[0].createdby },
                                    { "@userid", addToCartItems[0].userid },
                                    { "@type", addToCartItems[0].type },
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
                            using (var cmd = new NpgsqlCommand(InsertTransaction, connection))
                            {
                                var insertOrderParams = new Dictionary<string, object>
                                {
                                    { "@orderid", orderid },
                                    { "@transid", transid},
                                    { "@customer", addToCartItems[0].customer },
                                    { "@cashier", addToCartItems[0].cashier },
                                    { "@createdat", addToCartItems[0].createdat },
                                    { "@status", addToCartItems[0].status },
                                };
                                foreach (var param in insertOrderParams)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                                 cmd.ExecuteNonQuery();
                            }
                        

                        // Commit the transaction after all items have been processed
                        tran.Commit();
                        if (orderid.ToString() != null && addToCartItems != null && addToCartItems.Length > 0)
                        {
                            return new PostResponse
                            {
                                result = new SaveOrderResponse
                                {
                                    orderid = orderid.ToString(),
                                    cartid = addToCartItems[0].cartid
                                },
                                status = 200,
                                Message = "Order successfully saved"
                            };
                        }
                        else
                        {
                            return new PostResponse
                            {
                                result = null,
                                status = 400,
                                Message = "Error occurred while saving the order"
                            };
                        }
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
        public PostResponse updatedOrderAndCart(InventoryRequestModel.AddToCart[] addToCartItems)
        {
            var updatecart = @"update cart set status=@status,qty=@qty,total=@total,updateat=@updateat where cartid=@cartid and code=@code";
           
            var updateOrder = @"update orders set total=@total,paidthru=@paidthru,paidcash=@paidcash,updateat=@updateat,status=@status  where orderid = @orderid";

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();
                var total = 0.0;
                var updateOrderRes = 0;
                var updateCartRes = 0;
                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        foreach (var addToCart in addToCartItems)
                        {
                            var parameters  = new Dictionary<string, object>
                                {
                                    { "@code", addToCart.code },
                                    { "@cartid", addToCart.cartid },
                                    { "@qty", addToCart.qty },
                                    { "@total", addToCart.qty * addToCart.price },
                                    { "@updateat", addToCart.updateat },
                                    { "@status", addToCart.status },
                                };
                           
                         

                            // Execute the insertion command for each item
                            using (var cmd = new NpgsqlCommand(updatecart, connection))
                            {
                                foreach (var param in parameters)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                                updateCartRes = cmd.ExecuteNonQuery();
                            }
                            total = total + addToCart.qty * addToCart.price;
                        }
                        if(updateCartRes > 0)
                        {

                            // Execute the insertOrder command for each item
                            using (var cmd = new NpgsqlCommand(updateOrder, connection))
                            {
                                var insertOrderParams = new Dictionary<string, object>
                                {
                                    { "@orderid", addToCartItems[0].orderid },
                                    { "@total",  total},
                                    { "@paidthru", addToCartItems[0].paidthru },
                                    { "@paidcash", addToCartItems[0].paidcash },
                                    { "@updateat", addToCartItems[0].updateat },
                                    { "@status", addToCartItems[0].status },
                                };
                                foreach (var param in insertOrderParams)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                                updateOrderRes = cmd.ExecuteNonQuery();
                            }

                        }
                        else
                        {
                            tran.Rollback();
                            return new PostResponse
                            {
                                status = 500,
                                Message = "Cart not updated"
                            };
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
        public PostResponse deleteCart(InventoryRequestModel.AddToCart[] addToCartItems)
        {
            var deleteCart = @"delete from cart where cartid=@cartid";


            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();
                var total = 0.0;
                var updateOrderRes = 0;
                var updateCartRes = 0;
                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        foreach (var addToCart in addToCartItems)
                        {
                            var parameters = new Dictionary<string, object>
                                {
                                    { "@cartid", addToCart.cartid },
                                };



                            // Execute the insertion command for each item
                            using (var cmd = new NpgsqlCommand(deleteCart, connection))
                            {
                                foreach (var param in parameters)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                                updateCartRes = cmd.ExecuteNonQuery();
                            }
                            total = total + addToCart.qty * addToCart.price;
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
        public PostResponse ApprovedOrderAndpay(InventoryRequestModel.AddToCart[] addToCartItems)
        {

            var updatecart = @"update cart set status=@status,qty=@qty,total=@total,updateat=@updateat where cartid=@cartid and code=@code";
            var updateOrder = @"update orders set total=@total,paidthru=@paidthru,paidcash=@paidcash,updateat=@updateat,status=@status  where orderid = @orderid";
            var updatesql = @"update  inventory set qty=@onhandqty where code=@code";
            var InsertTransaction = @"insert into transaction (transid,orderid,customer,cashier,status,createdat,updateat) 
                                    values(@transid,@orderid,@customer,@cashier,@status,@createdat,@updateat)";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();
                var total = 0.0;
                var updateOrderRes = 0;
                var updateCartRes = 0;
                var updateInventoryRes = 0;
                var transid = Guid.NewGuid().ToString();
                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        foreach (var addToCart in addToCartItems)
                        {
                            var parameters = new Dictionary<string, object>
                            {
                                { "@code", addToCart.code },
                                { "@cartid", addToCart.cartid },
                                { "@qty", addToCart.qty },
                                { "@total", addToCart.qty * addToCart.price },
                                { "@updateat", addToCart.updateat },
                                { "@status", addToCart.status },
                            };

                            // Execute the insertion command for each item
                            using (var cmd = new NpgsqlCommand(updatecart, connection))
                            {
                                foreach (var param in parameters)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                                updateCartRes = cmd.ExecuteNonQuery();
                            }
                            total = total + addToCart.qty * addToCart.price;
                        }
                        if (updateCartRes > 0)
                        {

                            // Execute the insertOrder command for each item
                            using (var cmd = new NpgsqlCommand(updateOrder, connection))
                            {
                                var insertOrderParams = new Dictionary<string, object>
                                {
                                    { "@orderid", addToCartItems[0].orderid },
                                    { "@total",  total},
                                    { "@paidthru", addToCartItems[0].paidthru },
                                    { "@paidcash", addToCartItems[0].paidcash },
                                    { "@updateat", addToCartItems[0].updateat },
                                    { "@status", addToCartItems[0].status },
                                };
                                foreach (var param in insertOrderParams)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                                updateOrderRes = cmd.ExecuteNonQuery();
                            }
                            if(updateOrderRes > 0)
                            {
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
                                        updateInventoryRes = cmd.ExecuteNonQuery();
                                    }
                                }
                            }
                            if (updateInventoryRes > 0)
                            {
                                using (var cmd = new NpgsqlCommand(InsertTransaction, connection))
                                {
                                    var insertOrderParams = new Dictionary<string, object>
                                {
                                    { "@orderid", addToCartItems[0].orderid },
                                    { "@transid", transid },
                                    { "@customer", addToCartItems[0].customer },
                                    { "@cashier", addToCartItems[0].cashier },
                                    { "@createdat", addToCartItems[0].createdat },
                                    { "@status", addToCartItems[0].status },
                                    { "@updateat", addToCartItems[0].updateat },
                                };
                                    foreach (var param in insertOrderParams)
                                    {
                                        cmd.Parameters.AddWithValue(param.Key, param.Value);
                                    }
                                    updateOrderRes = cmd.ExecuteNonQuery();
                                }
                            }
                            else
                            {
                                tran.Rollback();
                                return new PostResponse
                                {
                                    result = new SaveOrderResponse
                                    {
                                        orderid = addToCartItems[0].orderid.ToString(),
                                        cartid = addToCartItems[0].cartid
                                    },
                                    status = 500,
                                    Message = "Cart not updated"
                                };
                            }

                        }
                        else
                        {
                            tran.Rollback();
                            return new PostResponse
                            {
                                status = 500,
                                Message = "Cart not updated"
                            };
                        }

                        // Commit the transaction after all items have been processed
                        tran.Commit();
                        return new PostResponse
                        {
                            result = new SaveOrderResponse
                            {
                                orderid = addToCartItems[0].orderid.ToString(),
                                cartid = addToCartItems[0].cartid
                            },
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
        //public PostResponse UpdateCart(InventoryRequestModel.AddToCart[] addToCartItems)
        //{
        //    var insertSql = @"SELECT update_or_insert_cart (@code, @item, @qty, @price, @total, @createdat, @status, @cartid);";


        //    var updateSql = @"UPDATE inventory AS i
        //                        SET qty = i.qty + COALESCE((@qty - c.qty), @qty)
        //                        FROM (
        //                            SELECT SUM(qty) as qty
        //                            FROM cart
        //                            WHERE code = @code AND status = 'pending' AND cartid = @cartid
        //                        ) AS c
        //                        WHERE i.code = @code;";

        //    using (var connection = new NpgsqlConnection(_connectionString))
        //    {
        //        connection.Open();
        //        using (var transaction = connection.BeginTransaction())
        //        {
        //            try
        //            {
        //                foreach (var addToCart in addToCartItems)
        //                {
        //                    using (var insertCommand = new NpgsqlCommand(insertSql, connection))
        //                    {
        //                        insertCommand.CommandType = CommandType.Text;
        //                        insertCommand.Parameters.AddWithValue("@cartid", addToCart.cartid);
        //                        insertCommand.Parameters.AddWithValue("@code", addToCart.code);
        //                        insertCommand.Parameters.AddWithValue("@item", addToCart.item);
        //                        insertCommand.Parameters.AddWithValue("@qty", addToCart.qty);
        //                        insertCommand.Parameters.AddWithValue("@price", addToCart.price);
        //                        insertCommand.Parameters.AddWithValue("@total", addToCart.qty * addToCart.price);
        //                        insertCommand.Parameters.AddWithValue("@createdat", addToCart.createdat);
        //                        insertCommand.Parameters.AddWithValue("@status", addToCart.status);
        //                        insertCommand.ExecuteNonQuery();
        //                    }
        //                }
        //                foreach (var addToCart in addToCartItems)
        //                {
        //                    using (var updateCommand = new NpgsqlCommand(updateSql, connection))
        //                    {
        //                        updateCommand.Parameters.AddWithValue("@qty", addToCart.qty);
        //                        updateCommand.Parameters.AddWithValue("@code", addToCart.code);
        //                        updateCommand.Parameters.AddWithValue("@cartid", addToCart.cartid); // Assuming cartid is the same for all items
        //                        updateCommand.ExecuteNonQuery();
        //                    }
        //                }

        //                transaction.Commit();
        //                return new PostResponse
        //                {
        //                    status = 200,
        //                    Message = "Order successfully saved"
        //                };
        //            }
        //            catch (Exception ex)
        //            {
        //                transaction.Rollback();
        //                return new PostResponse
        //                {
        //                    status = 500,
        //                    Message = ex.Message
        //                };
        //            }
        //        }
        //    }
        //}

        public BrandResponseModel getBrands(InventoryRequestModel.GetBrand getBrand)
        {
            var sql = @"select brand from inventory where brand ='' is not true and lower(category)  LIKE CONCAT('%', LOWER(@category), '%') group by brand;";

            var parameters = new Dictionary<string, object>
            {
                { "@category", getBrand.category },
            };


            var results = new List<BrandResponse>();

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
                                    var orderResponse = new BrandResponse
                                    {
                                        brand = reader.GetString(reader.GetOrdinal("brand")),
                                    };

                                    results.Add(orderResponse);
                                }
                            }
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new BrandResponseModel
                        {
                            result = results,
                            statusCode = 200,
                            success = true,

                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new BrandResponseModel
                        {
                            result = [],
                            message= ex.Message,
                            statusCode = 500,
                            success = false,

                        };
                        throw;
                    }
                }
            }

          
        }
        public OrderResponseModel getOrder(InventoryRequestModel.GetUserOrder getUserOrder)
        {
            var sql = @"select * from orders  ORDER BY createdat desc LIMIT @limit OFFSET @offset;";

            var parameters = new Dictionary<string, object>
            {
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
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new OrderResponseModel
                        {
                            result = [],
                            message= ex.Message,
                            statusCode = 500,
                            success = false,

                        };
                        throw;
                    }
                }
            }

          
        }
        public OrderInfoResponseModel GetOrderInfo(InventoryRequestModel.GetSelectedOrder getUserOrder)
        {
            var sql = @"select inv.category, inv.brand, trans.transid, inv.qty as onhandqty, cts.name, cts.address, cts.contactno, ct.cartid, ors.orderid, ors.paidcash, ors.paidthru, ors.total, ors.createdat, ct.code, ct.item, ct.price, ct.qty, ors.status, ors.createdby, ors.type
                from orders AS ors 
                join cart AS ct on ors.cartid = ct.cartid 
                join customer cts on cts.customerid = ors.userid 
                join inventory AS inv on inv.code = ct.code
                left join transaction as trans on trans.orderid = ors.orderid
                where ors.orderid = @orderid";

            var parameters = new Dictionary<string, object>
                {
                    { "@orderid", getUserOrder.orderid },
                };

            var orderResponse = new OrderInfoResponse();
            var orderItems = new List<ItemOrders>();

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
                                    var transidOrdinal = reader.GetOrdinal("transid");
                                    var transid = !reader.IsDBNull(transidOrdinal) ? reader.GetString(transidOrdinal) : null;
                                    orderResponse = new OrderInfoResponse
                                    {
                                        transid = transid,
                                        orderid = reader.GetString(reader.GetOrdinal("orderid")),
                                        cartid = reader.GetString(reader.GetOrdinal("cartid")),

                                        name = reader.GetString(reader.GetOrdinal("name")),
                                        address = reader.GetString(reader.GetOrdinal("address")),
                                        contactno = reader.GetString(reader.GetOrdinal("contactno")),

                                        paidthru = reader.GetString(reader.GetOrdinal("paidthru")),
                                        paidcash = reader.GetFloat(reader.GetOrdinal("paidcash")),
                                        createdby = reader.GetString(reader.GetOrdinal("createdby")),
                                        createdat = reader.GetInt64(reader.GetOrdinal("createdat")),
                                        status = reader.GetString(reader.GetOrdinal("status")),
                                        type = reader.GetString(reader.GetOrdinal("type")),
                                        total = reader.GetFloat(reader.GetOrdinal("total")),


                                    };

                                    var orderItemResponse = new ItemOrders
                                    {

                                        code = reader.GetString(reader.GetOrdinal("code")),
                                        item = reader.GetString(reader.GetOrdinal("item")),
                                        price = reader.GetFloat(reader.GetOrdinal("price")),
                                        qty = reader.GetInt16(reader.GetOrdinal("qty")),
                                        onhandqty = reader.GetInt16(reader.GetOrdinal("onhandqty")),

                                        brand = reader.GetString(reader.GetOrdinal("brand")),
                                        category = reader.GetString(reader.GetOrdinal("category")),
                                    };

                                    orderItems.Add(orderItemResponse);
                                }
                            }
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();

                        return new OrderInfoResponseModel
                        {
                            order_item = orderItems,
                            order_info = orderResponse,
                            statusCode = 200,
                            success = true,
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();

                        return new OrderInfoResponseModel
                        {
                            order_item = new List<ItemOrders>(),
                            order_info = null,
                            statusCode = 500,
                            success = false,
                            message = ex.Message,
                        };
                    }
                }
            }
        }

        public SelectedOrderResponseModel selectOrder(InventoryRequestModel.GetSelectedOrder getUserOrder)
        {
            var sql = @"SELECT ct.*,ors.createdby, ors.orderid,ors.total,ors.status
                        FROM orders AS ors
                        JOIN cart AS ct ON ors.cartid = ct.cartid
                        WHERE ors.orderid = @orderid;
                        ";

                var parameters = new Dictionary<string, object>
                {
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

        public CustomerInfoResponseModel getCustomers()
        {
            var sql = @"select * from customer";
    

            var results = new List<CustomerResponse>();

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        using (var cmd = new NpgsqlCommand(sql, connection))
                        {

                            using (var reader = cmd.ExecuteReader())
                            {
                                while (reader.Read())
                                {
                                    var orderResponse = new CustomerResponse
                                    {
                                        customerid = reader.GetString(reader.GetOrdinal("customerid")),
                                        name = reader.GetString(reader.GetOrdinal("name")),
                                        address = reader.GetString(reader.GetOrdinal("address")),
                                        contactno = reader.GetString(reader.GetOrdinal("contactno")),
                                    };

                                    results.Add(orderResponse);
                                }
                            }
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new CustomerInfoResponseModel
                        {
                            result = results,
                            statusCode = 200,
                            success = true,

                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new CustomerInfoResponseModel
                        {
                            result = [],
                            message = ex.Message,
                            statusCode = 500,
                            success = false,

                        };
                        throw;
                    }
                }
            }


        } 
        public GetCustomerInfoResponseModel getCustomerInfo(InventoryRequestModel.GetCustomer getCustomer)
        {
            var sql = @"select * from customer  where customerid=@customerid";
            var parameters = new Dictionary<string, object>
            {
                { "@customerid", getCustomer.customerid },
            };
            var results = new CustomerResponse();

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
                                    var orderResponse = new CustomerResponse
                                    {
                                        customerid = reader.GetString(reader.GetOrdinal("customerid")),
                                        name = reader.GetString(reader.GetOrdinal("name")),
                                        address = reader.GetString(reader.GetOrdinal("address")),
                                        contactno = reader.GetString(reader.GetOrdinal("contactno")),
                                    };

                                    results = orderResponse;
                                }
                            }
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new GetCustomerInfoResponseModel
                        {
                            result = results,
                            statusCode = 200,
                            success = true,

                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new GetCustomerInfoResponseModel
                        {
                            result = null,
                            message = ex.Message,
                            statusCode = 500,
                            success = false,

                        };
                        throw;
                    }
                }
            }


        }   
        public DeliveryResponseModel getDelivery(InventoryRequestModel.GetDelivery getDelivery)
        {
            var sql = @"select dr.deliveryid ,dr.deliveredby,dr.deliverydate,img.path from delivery AS dr join images AS img on dr.imgsid = img.imgsid where dr.orderid=@orderid";
            var parameters = new Dictionary<string, object>
            {
                { "@orderid", getDelivery.orderid },
            };
            var results = new DeliveryResponse();

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
                                    var orderResponse = new DeliveryResponse
                                    {
                                        deliveryid = reader.GetString(reader.GetOrdinal("deliveryid")),
                                        deliveredby = reader.GetString(reader.GetOrdinal("deliveredby")),
                                        path = reader.GetString(reader.GetOrdinal("path")),
                                        deliverydate = reader.GetInt64(reader.GetOrdinal("deliverydate")),
                                    };

                                    results = orderResponse;
                                }
                            }
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new DeliveryResponseModel
                        {
                            result = results,
                            statusCode = 200,
                            success = true,

                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new DeliveryResponseModel
                        {
                            result = null,
                            statusCode = 500,
                            success = false,
                            message = ex.Message,

                        };
                        throw;
                    }
                }
            }
        }
        public VoucherResponseModel getVouchers(InventoryRequestModel.GetVoucher getVoucher)
        {
            var sql = @"select * from vouchers where vouchercode=@vouchercode";
            var parameters = new Dictionary<string, object>
            {
                { "@vouchercode", getVoucher.vouchercode },
            };
            var results = new VoucherResponse();

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
                                    var orderResponse = new VoucherResponse
                                    {
                                        name = reader.GetString(reader.GetOrdinal("name")),
                                        description = reader.GetString(reader.GetOrdinal("description")),
                                        maxredemption = reader.GetInt16(reader.GetOrdinal("maxredemption")),
                                        discount = reader.GetDecimal(reader.GetOrdinal("discount")),
                                    };

                                    results = orderResponse;
                                }
                            }
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new VoucherResponseModel
                        {
                            result = results,
                            statusCode = 200,
                            success = true,

                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new VoucherResponseModel
                        {
                            result = null,
                            statusCode = 500,
                            success = false,
                            message = ex.Message,

                        };
                        throw;
                    }
                }
            }
        }
        public PostResponse PostDeliveryInfo(InventoryRequestModel.DeliveryInfo deliveryInfo)
        {

            var insertDeliveryInfo = @"insert into delivery (deliveryid,imgsid,deliveredby,deliverydate,orderid)
                                        values(@deliveryid,@imgsid,@deliveredby,@deliverydate,@orderid)";

            var insertDeliveryImages = @"insert into images (imgsid,path,createdat,createdby)
                                        values(@imgsid,@path,@createdat,@createdby)";

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();
                var total = 0.0;
                var insertedDeliveryInfo = 0;
                var insertedDeliveryImages = 0;
                var deliveryid = Guid.NewGuid().ToString();
                var imgsid = Guid.NewGuid().ToString();
                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        var parameters = new Dictionary<string, object>
                            {
                                { "@deliveryid", deliveryid },
                                { "@imgsid", imgsid },
                                { "@deliveredby", deliveryInfo.deliveredby },
                                { "@deliverydate", deliveryInfo.deliverydate },
                                { "@orderid", deliveryInfo.orderid },
                            };



                        // Execute the insertion command for each item
                        using (var cmd = new NpgsqlCommand(insertDeliveryInfo, connection))
                        {
                            foreach (var param in parameters)
                            {
                                cmd.Parameters.AddWithValue(param.Key, param.Value);
                            }
                            insertedDeliveryInfo = cmd.ExecuteNonQuery();
                        }
                        if (insertedDeliveryInfo > 0)
                        {

                            // Execute the insertOrder command for each item
                            using (var cmd = new NpgsqlCommand(insertDeliveryImages, connection))
                            {
                                var insertOrderParams = new Dictionary<string, object>
                                {
                                    { "@imgsid", imgsid },
                                    { "@path",  deliveryInfo.path},
                                    { "@createdat", deliveryInfo.createdat },
                                    { "@createdby", deliveryInfo.createdby },
                                };
                                foreach (var param in insertOrderParams)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                                insertedDeliveryImages = cmd.ExecuteNonQuery();
                            }

                        }
                        else
                        {
                            tran.Rollback();
                            return new PostResponse
                            {
                                status = 500,
                                Message = "Delivery Not inserted"
                            };
                        }

                        // Commit the transaction after all items have been processed
                        tran.Commit();
                        return new PostResponse
                        {
                            status = 200,
                            Message = "Delivery successfully saved"
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
        public PostResponse UpdateDelivered(InventoryRequestModel.UpdateDelivery updateDelivery)
        {
            var updatecart = @"update cart set status=@status,updateat=@updateat where cartid = @cartid";

            var updateOrder = @"update orders set status=@status,updateat=@updateat  where orderid = @orderid";
            var updateTransaction = @"update transaction set status=@status,updateat=@updateat where transid = @transid";
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();
                var updateOrderRes = 0;
                var updateCartRes = 0;
                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        // Execute the insertion command for each item
                            using (var cmd = new NpgsqlCommand(updatecart, connection))
                            {

                            var parameters = new Dictionary<string, object>
                                {
                                    { "@updateat", updateDelivery.updateat },
                                    { "@status", updateDelivery.status },
                                    { "@cartid", updateDelivery.cartid },
                                };
                                foreach (var param in parameters)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                                updateCartRes = cmd.ExecuteNonQuery();
                            }
                        
                        if (updateCartRes > 0)
                        {

                            // Execute the insertOrder command for each item
                            using (var cmd = new NpgsqlCommand(updateOrder, connection))
                            {
                                var insertOrderParams = new Dictionary<string, object>
                                {
                                    { "@updateat", updateDelivery.updateat },
                                    { "@status", updateDelivery.status },
                                    { "@orderid", updateDelivery.orderid },
                                };
                                foreach (var param in insertOrderParams)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                                updateOrderRes = cmd.ExecuteNonQuery();
                            }

                        }
                        if (updateOrderRes > 0)
                        {
                            using (var cmd = new NpgsqlCommand(updateTransaction, connection))
                            {
                                var insertTransactionParams = new Dictionary<string, object>
                                {
                                    { "@updateat", updateDelivery.updateat },
                                    { "@status", updateDelivery.status },
                                    { "@transid", updateDelivery.transid },
                                };
                                foreach (var param in insertTransactionParams)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                                 cmd.ExecuteNonQuery();
                            }
                        }
                        else
                        {
                            tran.Rollback();
                            return new PostResponse
                            {
                                status = 500,
                                Message = "Cart not updated"
                            };
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

        public SalesResponseModel getByDaySales(GetSales getSales)
        {
            var sql = @"select  ct.code, TRIM(ct.item) as item, SUM(ct.qty) as qty, TO_CHAR(SUM(ct.total), 'FM999,999,999.00') AS total_sales
                from transaction as tr join orders as ors on tr.orderid = ors.orderid
                join cart as ct on ct.cartid = ors.cartid where LOWER(ors.status) = 'delivered'
                AND DATE(to_timestamp(tr.createdat / 1000.0) AT TIME ZONE 'Asia/Manila') between @fromDate and @toDate
                group by ct.item, ct.code;";

            DateTime fromDate = DateTime.Parse(getSales.fromDate);
            DateTime toDate = DateTime.Parse(getSales.toDate); 
            DateTime now = DateTime.Now;
            var parameters = new Dictionary<string, object>
            {
                { "@fromDate", fromDate },
                { "@toDate", toDate },
            };

            var results = new List<SalesResponse>();

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
                                    var salesResponse = new SalesResponse
                                    {
                                        code = reader.GetString(reader.GetOrdinal("code")),
                                        item = reader.GetString(reader.GetOrdinal("item")),
                                        qty = reader.GetInt16(reader.GetOrdinal("qty")),
                                        total_sales = reader.GetString(reader.GetOrdinal("total_sales")),
                                    };

                                    results.Add(salesResponse);
                                }
                            }
                        }

                        tran.Commit();

                        //byte[] fileContents = GeneratePdfReport(results, fromDate, toDate);
                        //string fileName = $"Sales_Report_{now:yyyyMMddHHmmss}.pdf"; // Formatting the datetime for the file name
                        //var fileResult = new FileContentResult(fileContents, "application/pdf")
                        //{
                        //    FileDownloadName = fileName
                        //};
                        return new SalesResponseModel
                        {
                            result = null,
                            statusCode = 200,
                            success = true
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new SalesResponseModel
                        {
                            result = null,
                            statusCode = 200,
                            success = true
                        };
                        throw;
                    }
                }
            }
        }  
        public InventoryResponseModel getInventoryQty()
        {
            var sql = @"select  inv.code,inv.item,inv.qty as onhandqty, count(ct.qty) as soldqty,inv.cost,inv.price
                        from inventory as inv left join cart ct on inv.code = ct.code 
                        group by inv.code,inv.item,inv.qty,inv.cost,inv.price order by  inv.qty ASC;";



            var results = new List<InventoryResponse>();

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        using (var cmd = new NpgsqlCommand(sql, connection))
                        {

                            using (var reader = cmd.ExecuteReader())
                            {
                                while (reader.Read())
                                {
                                    var salesResponse = new InventoryResponse
                                    {
                                        code = reader.GetString(reader.GetOrdinal("code")),
                                        item = reader.GetString(reader.GetOrdinal("item")),
                                        onhandqty = reader.GetInt32(reader.GetOrdinal("onhandqty")),
                                        soldqty = reader.GetInt32(reader.GetOrdinal("soldqty")),
                                        cost = reader.GetDecimal(reader.GetOrdinal("cost")),
                                        price = reader.GetDecimal(reader.GetOrdinal("price")),
                                    };

                                    results.Add(salesResponse);
                                }
                            }
                        }

                        tran.Commit();


                        return new InventoryResponseModel
                        {
                            inventory = results,
                            statusCode = 200,
                            success = true,
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new InventoryResponseModel
                        {
                            inventory = new List<InventoryResponse>(),
                            message = ex.Message,
                            statusCode = 500,
                            success = false,
                        };
                        throw;
                    }
                }
            }
        }
        public byte[] GenerateInventoryPdfReport(List<InventoryResponse> sales)
        {
            // Load company logo
            byte[] logoBytes = LoadCompanyLogo(); // Assuming this method loads your company logo as byte[]

            using (MemoryStream ms = new MemoryStream())
            {
                Document doc = new Document();
                PdfWriter.GetInstance(doc, ms);
                doc.Open();

                // Add company logo
                if (logoBytes != null)
                {
                    Paragraph logotitle = new Paragraph();
                    logotitle.Alignment = Element.ALIGN_CENTER;
                    logotitle.Add(Chunk.NEWLINE);
                    logotitle.Add(new Chunk($"Address: SIR Bucana 76-A", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                    logotitle.Add(Chunk.NEWLINE);
                    logotitle.Add(new Chunk($"Sandawa Matina Davao City", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                    logotitle.Add(Chunk.NEWLINE);
                    logotitle.Add(new Chunk($"Davao City, Philippines", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                    logotitle.Add(Chunk.NEWLINE);
                    logotitle.Add(new Chunk($"Contact No.: (082) 224 1362", FontFactory.GetFont(FontFactory.HELVETICA, 12)));

                    Image logo = Image.GetInstance(logoBytes);
                    logo.Alignment = Element.ALIGN_CENTER;
                    logo.ScaleAbsolute(50f, 50f); // Adjust dimensions as needed
                    doc.Add(logo);
                    doc.Add(logotitle);
                }

                // Add title
                Paragraph title = new Paragraph();
                title.Alignment = Element.ALIGN_CENTER;
                title.Add(Chunk.NEWLINE);
                title.Add(new Chunk("Inventory Report", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 24)));
                title.Add(Chunk.NEWLINE);
                title.Add(Chunk.NEWLINE);
                doc.Add(title);

                // Add table
                PdfPTable table = new PdfPTable(6);
                table.WidthPercentage = 100;
                table.SetWidths(new float[] { 1, 3, 1, 2,1,1 });
                table.SpacingBefore = 20f; // Add spacing before the table
                                           // Add table headers
                table.AddCell("Code");
                table.AddCell("Item");
                table.AddCell("Onhand Qty");
                table.AddCell("Sold Qty");
                table.AddCell("Cost");
                table.AddCell("Price");

                // Add table data
                foreach (var sale in sales)
                {
                    table.AddCell(sale.code);
                    table.AddCell(sale.item);
                    table.AddCell(sale.onhandqty.ToString());
                    table.AddCell(sale.soldqty.ToString());
                    table.AddCell(sale.cost.ToString("N2"));
                    table.AddCell(sale.price.ToString("N2"));
                }

              
                doc.Add(table);
                doc.Close();

                return ms.ToArray();
            }
        }
        public byte[] GeneratePdfReport(List<SalesResponse> sales, DateTime from_date,DateTime to_date)
            {
                // Load company logo
                byte[] logoBytes = LoadCompanyLogo(); // Assuming this method loads your company logo as byte[]

                using (MemoryStream ms = new MemoryStream())
                {
                    Document doc = new Document();
                    PdfWriter.GetInstance(doc, ms);
                    doc.Open();

                    // Add company logo
                    if (logoBytes != null)
                    {
                        Paragraph logotitle = new Paragraph();
                        logotitle.Alignment = Element.ALIGN_CENTER;
                        logotitle.Add(Chunk.NEWLINE);
                        logotitle.Add(new Chunk($"Address: SIR Bucana 76-A", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                        logotitle.Add(Chunk.NEWLINE);
                        logotitle.Add(new Chunk($"Sandawa Matina Davao City", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                        logotitle.Add(Chunk.NEWLINE);
                        logotitle.Add(new Chunk($"Davao City, Philippines", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                        logotitle.Add(Chunk.NEWLINE);
                        logotitle.Add(new Chunk($"Contact No.: (082) 224 1362", FontFactory.GetFont(FontFactory.HELVETICA, 12)));

                        Image logo = Image.GetInstance(logoBytes);
                        logo.Alignment = Element.ALIGN_CENTER;
                        logo.ScaleAbsolute(50f, 50f); // Adjust dimensions as needed
                        doc.Add(logo);
                        doc.Add(logotitle);
                    }

                    // Add title
                    Paragraph title = new Paragraph();
                    title.Alignment = Element.ALIGN_CENTER;
                    title.Add(Chunk.NEWLINE);
                    title.Add(new Chunk("Sales Report", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 24)));
                    title.Add(Chunk.NEWLINE);
                    title.Add(Chunk.NEWLINE);
                    title.Add(new Chunk($"Start Date: {from_date.ToString("MM/dd/yyyy")} End Date: {to_date.ToString("MM/dd/yyyy")}", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                    title.Add(Chunk.NEWLINE);
                    title.Add(Chunk.NEWLINE);
                    doc.Add(title);

                    // Add table
                    PdfPTable table = new PdfPTable(4);
                    table.WidthPercentage = 100;
                    table.SetWidths(new float[] { 1, 3, 1, 2 });
                    table.SpacingBefore = 20f; // Add spacing before the table
                    // Add table headers
                    table.AddCell("Code");
                    table.AddCell("Item");
                    table.AddCell("Qty");
                    table.AddCell("Total");

                    // Add table data
                    decimal totalSales = 0;
                    foreach (var sale in sales)
                    {
                        table.AddCell(sale.code);
                        table.AddCell(sale.item);
                        table.AddCell(sale.qty.ToString());
                        table.AddCell(Decimal.Parse(sale.total_sales).ToString("N2"));// Format Total Sales as currency
                    totalSales += Decimal.Parse(sale.total_sales);
                    }

                    // Add total row
                    PdfPCell totalCell = new PdfPCell(new Phrase("Overall Total", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12)));
                    totalCell.Colspan = 3;
                    totalCell.HorizontalAlignment = Element.ALIGN_RIGHT;
                    table.AddCell(totalCell);
                    table.AddCell(totalSales.ToString("N2")); // Format Total Sales as currency

                    doc.Add(table);
                    doc.Close();

                    return ms.ToArray();
                }
            }
        


            private byte[] LoadCompanyLogo()
        {
            // Implement logic to load company logo as byte[]
            // Example:
            string imagePath = Path.Combine("Resources", "Assets", "Icon@3.png");
            byte[] logoBytes = File.ReadAllBytes(imagePath);
            return logoBytes;
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
