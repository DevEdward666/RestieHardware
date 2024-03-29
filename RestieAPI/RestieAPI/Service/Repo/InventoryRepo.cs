﻿using Microsoft.AspNetCore.Mvc;
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
                                orderid = orderid.ToString(),
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

            var orderid = Guid.NewGuid();
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
                                        cmd.ExecuteNonQuery();
                                    }
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
        public OrderInfoResponseModel getOrderInfo(InventoryRequestModel.GetSelectedOrder getUserOrder)
        {
            var sql = @"select inv.qty as onhandqty,cts.name,cts.address,cts.contactno, ct.cartid, ors.orderid, ors.paidcash,ors.paidthru, ors.total,ors.createdat,ct.code, ct.item,ct.price,ct.qty,ors.status,ors.createdby,ors.type
                        from orders AS ors join cart AS ct on ors.cartid = ct.cartid join customer cts on cts.customerid = ors.userid 
                        join inventory AS inv on inv.code=ct.code 
                        where  ors.orderid = @orderid and ors.cartid=@cartid";

            var parameters = new Dictionary<string, object>
            {
                { "@orderid", getUserOrder.orderid },
                { "@cartid", getUserOrder.cartid },
            };


            var results = new List<OrderInfoResponse>();

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
                                    var orderResponse = new OrderInfoResponse
                                    {
                                        orderid = reader.GetString(reader.GetOrdinal("orderid")),
                                        cartid = reader.GetString(reader.GetOrdinal("cartid")),
                                        total = reader.GetFloat(reader.GetOrdinal("total")),

                                        code = reader.GetString(reader.GetOrdinal("code")),
                                        item = reader.GetString(reader.GetOrdinal("item")),
                                        price = reader.GetFloat(reader.GetOrdinal("price")),
                                        qty = reader.GetInt16(reader.GetOrdinal("qty")),
                                        onhandqty = reader.GetInt16(reader.GetOrdinal("onhandqty")),

                                        name = reader.GetString(reader.GetOrdinal("name")),
                                        address = reader.GetString(reader.GetOrdinal("address")),
                                        contactno = reader.GetString(reader.GetOrdinal("contactno")),

                                        paidthru = reader.GetString(reader.GetOrdinal("paidthru")),
                                        paidcash = reader.GetFloat(reader.GetOrdinal("paidcash")),
                                        createdby = reader.GetString(reader.GetOrdinal("createdby")),
                                        createdat = reader.GetInt64(reader.GetOrdinal("createdat")),
                                        status = reader.GetString(reader.GetOrdinal("status")),
                                        type = reader.GetString(reader.GetOrdinal("type")),
                                    };

                                    results.Add(orderResponse);
                                }
                            }
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new OrderInfoResponseModel
                        {
                            result = results,
                            statusCode = 200,
                            success = true,

                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new OrderInfoResponseModel
                        {
                            result = [],
                            statusCode = 500,
                            success = false,
                            message = ex.Message

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
