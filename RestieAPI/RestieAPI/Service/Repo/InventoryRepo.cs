﻿using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using Npgsql.Internal;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;
using RestieAPI.Configs;
using RestieAPI.Models.Request;
using RestieAPI.Models.Response;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Globalization;
using System.Reflection.Metadata;
using static RestieAPI.Models.Request.InventoryRequestModel;
using static RestieAPI.Models.Response.AdminResponseModel;
using static System.Runtime.InteropServices.JavaScript.JSType;
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
                                        image = reader.GetString(reader.GetOrdinal("image")),
                                        createdat = reader.GetInt64(reader.GetOrdinal("createdat")),
                                        updatedat = reader.GetInt64(reader.GetOrdinal("updatedat"))
                                    };
                                    string originalPath = inventoryItem.image;
                                    if (originalPath != "0")
                                    {
                                        string formattedPath = originalPath.Replace("\\", "\\\\");
                                        string path = Path.Combine(Directory.GetCurrentDirectory(), formattedPath);

                                        if (!System.IO.File.Exists(path))
                                        {
                                            inventoryItem.image = null;
                                        }
                                        else
                                        {
                                            string contentType = "image/jpeg";
                                            if (Path.GetExtension(path)
                                                .Equals(".png", StringComparison.OrdinalIgnoreCase))
                                            {
                                                contentType = "image/png";
                                            }

                                            byte[] imageData = System.IO.File.ReadAllBytes(path);

                                            inventoryItem.image = Convert.ToBase64String(imageData);
                                            inventoryItem.image_type = contentType;
                                        }
                                    }
                                    else
                                    {
                                        inventoryItem.image = null;
                                        inventoryItem.image_type = null;
                                    }

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
                    catch (Exception ex)
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
        public InventoryItemModel selectedItem(string itemCode)
        {
            var sql = @"SELECT * FROM Inventory where code=@itemCode";

            

            var parameters = new Dictionary<string, object>
            {
                { "@itemCode", itemCode},
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
                                        image = reader.GetString(reader.GetOrdinal("image")),
                                        createdat = reader.GetInt64(reader.GetOrdinal("createdat")),
                                        updatedat = reader.GetInt64(reader.GetOrdinal("updatedat"))
                                    };
                                    string originalPath = inventoryItem.image;
                                    if (originalPath != "0")
                                    {
                                        string formattedPath = originalPath.Replace("\\", "\\\\");
                                        string path = Path.Combine(Directory.GetCurrentDirectory(), formattedPath);

                                        if (!System.IO.File.Exists(path))
                                        {
                                            inventoryItem.image = null;
                                        }
                                        else
                                        {
                                            string contentType = "image/jpeg";
                                            if (Path.GetExtension(path)
                                                .Equals(".png", StringComparison.OrdinalIgnoreCase))
                                            {
                                                contentType = "image/png";
                                            }

                                            byte[] imageData = System.IO.File.ReadAllBytes(path);

                                            inventoryItem.image = Convert.ToBase64String(imageData);
                                            inventoryItem.image_type = contentType;
                                        }
                                    }
                                    else
                                    {
                                        inventoryItem.image = null;
                                        inventoryItem.image_type = null;
                                    }

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
                    catch (Exception ex)
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
                                        image = reader.GetString(reader.GetOrdinal("image")),
                                        createdat = reader.GetInt64(reader.GetOrdinal("createdat")),
                                        updatedat = reader.GetInt64(reader.GetOrdinal("updatedat"))
                                    };
                                    string originalPath = inventoryItem.image;
                                    if (originalPath != "0")
                                    {
                                        string formattedPath = originalPath.Replace("\\", "\\\\");
                                        string path = Path.Combine(Directory.GetCurrentDirectory(), formattedPath);

                                        if (!System.IO.File.Exists(path))
                                        {
                                            inventoryItem.image = null;
                                        }
                                        else
                                        {
                                            string contentType = "image/jpeg";
                                            if (Path.GetExtension(path)
                                                .Equals(".png", StringComparison.OrdinalIgnoreCase))
                                            {
                                                contentType = "image/png";
                                            }

                                            byte[] imageData = System.IO.File.ReadAllBytes(path);

                                            inventoryItem.image = Convert.ToBase64String(imageData);;
                                            inventoryItem.image_type = contentType;
                                        }
                                    }
                                    else
                                    {
                                        inventoryItem.image = null;
                                        inventoryItem.image_type = null;
                                    }

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
                    catch (Exception ex)
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
            var sql = @"insert into customer (customerid,name,contactno,address,createdat,customer_email) 
                values(@customerid,@name,@contactno,@address,@createdat,@customer_email)";
        
            var parameters = new Dictionary<string, object>
            {
                { "@customerid", postCustomerInfo.customerid },
                { "@name", postCustomerInfo.name },
                { "@contactno", postCustomerInfo.contactno },
                { "@address", postCustomerInfo.address },
                { "@createdat", postCustomerInfo.createdat },
                { "@customer_email", postCustomerInfo.customer_email },
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
        public PostResponse UpdateInventoryImage(InventoryRequestModel.PutInventoryImage putInventoryImage)
        {
            var sql = @"update inventory set image=@image where code= @code";

            var parameters = new Dictionary<string, object>
            {
                { "@code", putInventoryImage.code },
                { "@image", putInventoryImage.image },
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
                            Message = "Successfully updated",
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
        public PostResponse UpdateCustomerEmail(InventoryRequestModel.PutCustomerEmail putCustomerEmail)
        {
            var sql = @"update customer set customer_email=@customer_email where customerid= @customerid";

            var parameters = new Dictionary<string, object>
            {
                { "@customerid", putCustomerEmail.customerid },
                { "@customer_email", putCustomerEmail.customer_email },
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
                            Message = "Successfully updated",
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
            var sql = @"insert into cart (cartid,code,item,qty,price,total,createdat,status,voucher_id,discount_price,total_discount) 
                values(@cartid,@code,@item,@qty,@price,@total,@createdat,@status,@voucher_id,@discount,@total_discount)";
            var insertOrder = "";
            if (addToCartItems[0].orderid.Length > 0) 
            {
                insertOrder = @"update orders set voucher=@order_voucher, totaldiscount=@totaldiscount, total=@total,paidthru=@paidthru,paidcash=@paidcash,updateat=@updateat,status=@status,createdat=@createdat  where orderid = @orderid";
            }
            else
            {
                insertOrder = @"insert into orders (orderid,cartid,total,paidthru,paidcash,createdby,createdat,status,userid,type,totaldiscount) 
                        values(@orderid,@cartid,@total,@paidthru,@paidcash,@createdby,@createdat,@status,@userid,@type,@totaldiscount)";
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
                                { "@voucher_id", addToCart.voucher_id ?? (object)DBNull.Value },
                                { "@discount", addToCart.discount?? (object)DBNull.Value},
                                { "@total_discount", addToCart.total_discount ?? (object)DBNull.Value },
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
                                    { "@totaldiscount",  addToCartItems[0].total_discount?? 0},
                                    { "@paidthru", addToCartItems[0].paidthru },
                                    { "@paidcash", addToCartItems[0].paidcash },
                                    { "@updateat", addToCartItems[0].updateat },
                                    { "@createdat", addToCartItems[0].createdat },
                                    { "@status", addToCartItems[0].status },
                                     { "@order_voucher", addToCartItems[0].order_voucher ?? (object)DBNull.Value }, 
                                };
                            }
                            else
                            {
                                insertOrderParams = new Dictionary<string, object>
                                {

                                    { "@orderid",  orderid.ToString() },
                                    { "@cartid", addToCartItems[0].cartid },
                                    { "@total",  total},
                                    { "@totaldiscount",  addToCartItems[0].total_discount},
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
            var sql = @"insert into cart (cartid,code,item,qty,price,total,createdat,status,voucher_id,discount_price,total_discount) 
                values(@cartid,@code,@item,@qty,@price,@total,@createdat,@status,@voucher_id,@discount,@total_discount)";
            var insertOrder = @"insert into orders (orderid,cartid,total,paidthru,paidcash,createdby,createdat,status,userid,type,totaldiscount,voucher) 
                        values(@orderid,@cartid,@total,@paidthru,@paidcash,@createdby,@createdat,@status,@userid,@type,@totaldiscount,@order_voucher)";
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
                var overAllTotalDiscount = 0.0;
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
                                { "@voucher_id", addToCart.voucher_id },
                                { "@discount", addToCart.discount },
                                { "@total_discount", addToCart.total_discount },
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
                            overAllTotalDiscount = overAllTotalDiscount+ (addToCart.discount ?? 0.0f) * addToCart.qty;
                        }
                          
                            // Execute the insertOrder command for each item
                            using (var cmd = new NpgsqlCommand(insertOrder, connection))
                            {
                                var insertOrderParams = new Dictionary<string, object>
                                {
                                    { "@orderid", orderid },
                                    { "@cartid", addToCartItems[0].cartid },
                                    { "@total",  total},
                                    { "@totaldiscount",  addToCartItems[0].total_discount  + overAllTotalDiscount},
                                    { "@order_voucher",  addToCartItems[0].order_voucher},
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
        public PostResponse CancelOrder(InventoryRequestModel.AddToCart[] addToCartItems)
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
                        
                           
                            if (updateOrderRes > 0)
                            {
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
            var updateOrder = @"update orders set total=@total,paidthru=@paidthru,paidcash=@paidcash,updateat=@updateat,status=@status,totaldiscount=@totaldiscount,voucher=@order_voucher  where orderid = @orderid";
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
                                    { "@order_voucher", addToCartItems[0].order_voucher ?? (object)DBNull.Value},
                                    { "@totaldiscount", addToCartItems[0].total_discount ?? 0 },
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
                            }if(updateOrderRes > 0)
                            {
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
        public CategoryResponseModel getCategory(InventoryRequestModel.GetBrand getBrand)
        {
            var sql = @"select category from inventory where category ='' is not true and lower(category)  LIKE CONCAT('%', LOWER(''), '%') group by category;";

            var parameters = new Dictionary<string, object>
            {
                { "@category", getBrand.category },
            };


            var results = new List<CategoryResponse>();

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
                                    var orderResponse = new CategoryResponse
                                    {
                                        category = reader.GetString(reader.GetOrdinal("category")),
                                    };

                                    results.Add(orderResponse);
                                }
                            }
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new CategoryResponseModel
                        {
                            result = results,
                            statusCode = 200,
                            success = true,

                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new CategoryResponseModel
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
            var sql = "";
            DateTime searchDate = new DateTime();
            if (getUserOrder.status == "returns")
            {
                if (getUserOrder.searchdate.Length <= 0)
                {
                    sql = @"select ors.* from orders ors join returns ret on ret.orderid=ors.orderid where  ret.orderid LIKE CONCAT('%', LOWER(@orderid), '%') group by ret.orderid,ors.voucher ,ors.totaldiscount, ors.orderid, cartid, total, paidthru, paidcash, createdby, ors.createdat, status, userid, updateat, type
                            ORDER BY ors.createdat desc LIMIT @limit OFFSET @offset;";

                }else if (getUserOrder.searchdate.Length > 0)
                {
                    sql = @"select ors.* from orders ors join returns ret on ret.orderid=ors.orderid where  ret.orderid LIKE CONCAT('%', LOWER(@orderid), '%') AND DATE(to_timestamp(ret.createdat / 1000.0) AT TIME ZONE 'Asia/Manila')=@searchdate group by ret.orderid, ors.orderid, cartid, total, paidthru, paidcash, createdby, ors.createdat, status, userid, updateat, type
                            ORDER BY ors.createdat desc LIMIT @limit OFFSET @offset;";

                }
            }else if (getUserOrder.paidThru == "debt")
            {
                if (getUserOrder.searchdate.Length <= 0)
                {
                    sql = @"select * from orders where paidthru = 'Debt' AND orderid LIKE CONCAT('%', LOWER(@orderid), '%') ORDER BY createdat desc LIMIT @limit OFFSET @offset;";
                }
                else if (getUserOrder.searchdate.Length > 0)
                {
                    sql = @"select * from orders where paidthru = 'Debt' AND orderid LIKE CONCAT('%', LOWER(@orderid), '%') AND DATE(to_timestamp(createdat / 1000.0) AT TIME ZONE 'Asia/Manila')=@searchdate ORDER BY createdat desc LIMIT @limit OFFSET @offset;";
                    searchDate = DateTime.Parse(getUserOrder.searchdate);
                }
            }
            else
            {
                if (getUserOrder.searchdate.Length <= 0)
                {
                   if( getUserOrder.status == "approved")
                    {
                        sql = @"select * from orders where LOWER(status)=@status and paidThru!='Debt' AND orderid LIKE CONCAT('%', LOWER(@orderid), '%') ORDER BY createdat desc LIMIT @limit OFFSET @offset;";

                    }
                    else
                    {
                        sql = @"select * from orders where LOWER(status)=@status AND orderid LIKE CONCAT('%', LOWER(@orderid), '%') ORDER BY createdat desc LIMIT @limit OFFSET @offset;";

                    }
                }
                else if (getUserOrder.searchdate.Length > 0)
                {
                    sql = @"select * from orders where LOWER(status)=@status AND orderid LIKE CONCAT('%', LOWER(@orderid), '%') AND DATE(to_timestamp(createdat / 1000.0) AT TIME ZONE 'Asia/Manila')=@searchdate ORDER BY createdat desc LIMIT @limit OFFSET @offset;";
                    searchDate = DateTime.Parse(getUserOrder.searchdate);
                }
            }
 
          

            var parameters = new Dictionary<string, object>
            {
                { "@limit", getUserOrder.limit },
                { "@status", getUserOrder.status },
                { "@orderid", getUserOrder.orderid },
                { "@searchdate", searchDate },
                { "@paidThru", getUserOrder.paidThru},
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
                                        totaldiscount = !reader.IsDBNull(reader.GetOrdinal("totaldiscount"))?  reader.GetFloat(reader.GetOrdinal("totaldiscount")) : 0,
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
            var sql = @"SELECT COALESCE((SELECT cts.customerid from customer cts where cts.customerid =ors.userid  limit 1),'') as customerid ,
                        COALESCE((SELECT cts.customer_email from customer cts where cts.customerid =ors.userid  limit 1),'') as customer_email ,
                           inv.category, inv.brand, COALESCE((SELECT tr.transid  from transaction tr where tr.orderid = ors.orderid limit 1),'') as transid,
                           COALESCE(inv.qty, 0) AS onhandqty,
                        COALESCE((SELECT cts.name from customer cts where cts.customerid =ors.userid  limit 1),'') as name,
                        COALESCE((SELECT cts.address from customer cts where cts.customerid =ors.userid  limit 1),'') as address,
                        COALESCE((SELECT cts.contactno from customer cts where cts.customerid =ors.userid  limit 1),'') as contactno,
                           ct.cartid, ors.orderid,
                           ors.paidcash, ors.paidthru, ors.total,ors.totaldiscount, ors.createdat, ct.code,
                           ct.item, ct.price, ct.qty,ct.discount_price,ors.voucher,ors.status, ors.createdby, ors.type
                    FROM orders AS ors
                    left JOIN cart AS ct ON ors.cartid = ct.cartid
                    LEFT JOIN inventory AS inv ON inv.code = ct.code
                    WHERE ors.orderid = @orderid;";

            var parameters = new Dictionary<string, object>
            {
                { "@orderid", getUserOrder.orderid },
            };

            var sqlReturns = @"
                        SELECT ret.transid, ret.orderid, ret.code, ret.item, ret.qty, ret.price, ret.createdat,sum(ret.qty * ret.price) as total,ret.remarks
                        FROM transaction AS trans
                        JOIN returns AS ret ON ret.transid = trans.transid
                        WHERE ret.orderid = @orderid 
                        group by ret.createdat, ret.price, ret.qty, ret.item, ret.code, ret.orderid, ret.transid,ret.remarks";

            var returnsParameters = new Dictionary<string, object>
            {
                { "@orderid", getUserOrder.orderid },
            };

            var orderResponse = new OrderInfoResponse();
            var orderItems = new List<ItemOrders>();
            var returnItems = new List<ReturnItems>();

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        using (var cmd = new NpgsqlCommand(sqlReturns, connection))
                        {
                            foreach (var param in returnsParameters)
                            {
                                cmd.Parameters.AddWithValue(param.Key, param.Value);
                            }

                            using (var reader = cmd.ExecuteReader())
                            {
                                while (reader.Read())
                                {
                                    var returnItemResponse = new ReturnItems
                                    {
                                        transid = reader.GetString(reader.GetOrdinal("transid")),
                                        orderid = reader.GetString(reader.GetOrdinal("orderid")),
                                        code = reader.GetString(reader.GetOrdinal("code")),
                                        item = reader.GetString(reader.GetOrdinal("item")),
                                        remarks = reader.GetString(reader.GetOrdinal("remarks")),
                                        price = reader.GetFloat(reader.GetOrdinal("price")),
                                        qty = reader.GetInt32(reader.GetOrdinal("qty")),
                                        total = reader.GetFloat(reader.GetOrdinal("total")),
                                        createdat = reader.GetInt64(reader.GetOrdinal("createdat")),
                                    };

                                    returnItems.Add(returnItemResponse);
                                }
                            }
                        }
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

                                        customerid = reader.GetString(reader.GetOrdinal("customerid")),
                                        customer_email = reader.GetString(reader.GetOrdinal("customer_email")),

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
                                        totaldiscount = !reader.IsDBNull(reader.GetOrdinal("totaldiscount")) ? reader.GetFloat(reader.GetOrdinal("totaldiscount")): 0,
                                        voucher = !reader.IsDBNull(reader.GetOrdinal("voucher")) ? reader.GetString(reader.GetOrdinal("voucher")) : null,
                                    };

                                    var orderItemResponse = new ItemOrders
                                    {
                                        code = reader.GetString(reader.GetOrdinal("code")),
                                        item = reader.GetString(reader.GetOrdinal("item")),
                                        price = reader.GetFloat(reader.GetOrdinal("price")),
                                        qty = reader.GetInt32(reader.GetOrdinal("qty")),
                                        onhandqty = reader.GetInt32(reader.GetOrdinal("onhandqty")),
                                        discount_price = !reader.IsDBNull(reader.GetOrdinal("discount_price")) ? reader.GetFloat(reader.GetOrdinal("discount_price")) :0,
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
                            return_items = returnItems,
                            statusCode = 200,
                            success = true,
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();

                        // Log the exception for debugging purposes
                        Console.WriteLine($"An error occurred: {ex.Message}");

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
        public AgedReceivableResponseModel GetAllAgedReceivable()
        {
            var sql = @"select ors.orderid,tr.transid,ors.total,ors.createdat,cr.contactno,cr.customer_email,
                        tr.customer,ors.paidthru, DATE(now() AT TIME ZONE 'Asia/Manila') - DATE(to_timestamp(tr.createdat / 1000.0)AT TIME ZONE 'Asia/Manila') as total_days
                        from transaction tr join orders ors on tr.orderid = ors.orderid
                        join customer cr on cr.customerid = ors.userid
                        where ors.paidthru ='Debt'
                        AND DATE(to_timestamp(tr.createdat / 1000.0)AT TIME ZONE 'Asia/Manila') < CURRENT_TIMESTAMP - INTERVAL '1 days';
                        ";

            //var parameters = new Dictionary<string, object>
            //    {
            //        { "@orderid", getUserOrder.orderid },
            //    };


            var results = new List<AgedReceivableResponse>();

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        using (var cmd = new NpgsqlCommand(sql, connection))
                        {
                            //foreach (var param in parameters)
                            //{
                            //    cmd.Parameters.AddWithValue(param.Key, param.Value);
                            //}

                            using (var reader = cmd.ExecuteReader())
                            {
                                while (reader.Read())
                                {
                                    var receivableResponse = new AgedReceivableResponse
                                    {
                                      
                                        transid = reader.GetString(reader.GetOrdinal("transid")),
                                        orderid = reader.GetString(reader.GetOrdinal("orderid")),
                                        customer = reader.GetString(reader.GetOrdinal("customer")),
                                        createdat = reader.GetInt64(reader.GetOrdinal("createdat")),
                                        paidthru = reader.GetString(reader.GetOrdinal("paidthru")),
                                        customer_email = reader.GetString(reader.GetOrdinal("customer_email")),
                                        contactno = reader.GetString(reader.GetOrdinal("contactno")),
                                        total = reader.GetInt32(reader.GetOrdinal("total")),
                                        total_days = reader.GetInt32(reader.GetOrdinal("total_days")),

                                    };

                                    results.Add(receivableResponse);
                                }
                            }
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new AgedReceivableResponseModel
                        {
                            result = results,
                            statusCode = 200,
                            success = true,

                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new AgedReceivableResponseModel
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
        public SingleVoucherResponseModel getVouchers(InventoryRequestModel.GetVoucher getVoucher)
        {
            var sql = @"select * from vouchers where vouchercode=@vouchercode and voucher_for='all'";
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
                                        discount = reader.GetDouble(reader.GetOrdinal("discount")),
                                    };

                                    results = orderResponse;
                                }
                            }
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new SingleVoucherResponseModel
                        {
                            result = results,
                            statusCode = 200,
                            success = true,

                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new SingleVoucherResponseModel
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
        public VoucherResponseModel ListOfVouchers(GetVoucherType getVoucher)
        {
            var sql = @"select * from vouchers where voucher_for=@voucher_for";
            var parameters = new Dictionary<string, object>
            {
                { "@voucher_for", getVoucher.voucher_for },
            };
            var results = new List<VoucherResponse>();

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
                                        id = reader.GetInt32(reader.GetOrdinal("voucher_seq")),
                                        vouchercode = reader.GetString(reader.GetOrdinal("vouchercode")),
                                        name = reader.GetString(reader.GetOrdinal("name")),
                                        description = reader.GetString(reader.GetOrdinal("description")),
                                        maxredemption = reader.GetInt16(reader.GetOrdinal("maxredemption")),
                                        discount = reader.GetDouble(reader.GetOrdinal("discount")),
                                        voucher_for = reader.GetString(reader.GetOrdinal("voucher_for")),
                                        type = reader.GetString(reader.GetOrdinal("type")),
                                    };

                                    results.Add(orderResponse);
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
        public QuotationResponseModel GetQuotationOrderInfo(InventoryRequestModel.GetSelectedOrder getUserOrder)
        {
            var sql = @"select cts.customerid, cts.customer_email, inv.category, inv.brand, trans.transid, inv.qty as onhandqty, cts.name, cts.address, cts.contactno, ct.cartid, ors.orderid, ors.paidcash, ors.paidthru, ors.total, ors.createdat, ct.code, ct.item, ct.price, ct.qty, ors.status, ors.createdby, ors.type
                from orders AS ors 
                join cart AS ct on ors.cartid = ct.cartid 
                join customer cts on cts.customerid = ors.userid 
                join inventory AS inv on inv.code = ct.code
                left join transaction as trans on trans.orderid = ors.orderid
                where ors.orderid = @orderid  group by cts.customerid, cts.customer_email, inv.category, inv.brand, trans.transid, inv.qty, cts.name, cts.address, cts.contactno, ct.cartid, ors.orderid, ors.paidcash, ors.paidthru, ors.total, ors.createdat, ct.code, ct.item, ct.price, ct.qty, ors.status, ors.createdby, ors.type order by trim(ct.item) asc";

            var parameters = new Dictionary<string, object>
                {
                    { "@orderid", getUserOrder.orderid },
                };

            var orderResponse = new OrderInfoResponse();
            var orderItems = new List<ItemOrders>();
            DateTime now = DateTime.Now;
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
                        byte[] fileContents = GenerateQuotationPdfReport(orderItems, orderResponse, now);
                        string fileName = $"Quotation_{now:yyyyMMddHHmmss}.pdf"; // Formatting the datetime for the file name
                        var fileResult = new FileContentResult(fileContents, "application/pdf")
                        {
                            FileDownloadName = fileName
                        };
                        return new QuotationResponseModel
                        {
                            result= fileResult,
                            statusCode = 200,
                            success = true,
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();

                        return new QuotationResponseModel
                        {
                            result = null,
                            statusCode = 500,
                            success = false,
                            message = ex.Message,
                        };
                    }
                }
            }
        }
        public SalesResponseModel getByDaySales(GetSales getSales)
        {
            var sql = "";
            /*var sql = @"select  ct.code, TRIM(ct.item) as item, SUM(ct.qty) as qty, it.cost , it.price,
                TO_CHAR(SUM(it.cost * ct.qty), 'FM999,999,999.00') AS total_cost,
                TO_CHAR(SUM(ct.total), 'FM999,999,999.00') AS total_sales,
                TO_CHAR(SUM(ors.totaldiscount), 'FM999,999,999.00') AS total_discount,

                TO_CHAR(SUM(ct.total) - SUM(it.cost * ct.qty), 'FM999,999,999.00') AS profit
                from transaction as tr
                right join orders as ors on tr.orderid = ors.orderid
                join cart as ct on ct.cartid = ors.cartid
                join inventory it on it.code = ct.code
                where
                (LOWER(ors.status)  IN ('approved', 'delivered') OR LOWER(ct.status) IN ('approved', 'delivered'))
                AND DATE(to_timestamp(ors.createdat / 1000.0) AT TIME ZONE 'Asia/Manila') between @fromDate and @toDate
                group by ct.item, ct.code,it.cost,it.price order by trim(ct.item) asc;";*/
            if (getSales.filter == 1)
            {
                if (getSales.report_type == 0)
                {
                    sql =
                        @"SELECT TRIM(ct.item)as item,sum(ct.qty) AS qty_sold,
                            COALESCE(SUM(rt.qty), 0) AS return_qty,
                            ct.price,SUM(ct.qty) - COALESCE(SUM(rt.qty), 0) as total_qty_sold,
                                  TO_CHAR(
                                    COALESCE(
                                      sum(ct.qty * ct.price) - sum(rt.qty * rt.price)
                                    , sum(ct.qty * ct.price)), 'FM999,999,999.00'
                                  ) AS total_sales
                            FROM cart ct
                            JOIN orders ors ON ct.cartid = ors.cartid
                            LEFT JOIN returns rt ON rt.orderid = ors.orderid and rt.code = ct.code 
                            WHERE (LOWER(ors.status) IN ('approved', 'delivered') OR LOWER(ct.status) IN ('approved', 'delivered')) 
                             AND DATE(to_timestamp(ors.createdat / 1000.0) AT TIME ZONE 'Asia/Manila') between @fromDate and @toDate
                            GROUP BY ct.item,ct.price ORDER BY ct.item;";
                }
                else
                {
                    sql =
                        @"SELECT
                                TO_CHAR(
                                    (to_timestamp(MAX(o.createdat) / 1000.0) AT TIME ZONE 'Asia/Manila')::DATE,
                                    'YYYY-MM-DD'
                                ) AS transaction_date,
                                  split_part(t.transid, '-', 5) AS transid,
                                  TO_CHAR(o.total , 'FM999,999,999.00') AS total,
                                  TO_CHAR(COALESCE(sum(rt.qty * rt.price), 0), 'FM999,999,999.00') AS total_returns,
                               TO_CHAR(
                                    COALESCE(
                                      sum(c.qty * c.price) - sum(rt.qty * rt.price)
                                    , o.total), 'FM999,999,999.00'
                                  ) AS total_sales
                                FROM transaction t
                                JOIN orders o ON t.orderid = o.orderid
                                JOIN cart c ON c.cartid = o.cartid
                                LEFT JOIN returns rt ON rt.transid = t.transid AND rt.code = c.code 
                                WHERE 
                                  (LOWER(o.status) IN ('approved', 'delivered') 
                                   OR LOWER(c.status) IN ('approved', 'delivered'))
                                AND 
                                  DATE(to_timestamp(o.createdat / 1000.0) AT TIME ZONE 'Asia/Manila') 
                                  BETWEEN @fromDate AND @toDate
                                GROUP BY t.transid, o.total ,o.totaldiscount  ;";
                }
                
             
            }
            else
            {
                if (getSales.report_type == 0)
                {
                    sql =
                        @"SELECT     
                           TO_CHAR(
                                    (to_timestamp(MAX(ors.createdat) / 1000.0) AT TIME ZONE 'Asia/Manila')::DATE,
                                    'YYYY-MM-DD'
                                ) AS transaction_date,
                                      split_part(t.transid, '-', 5) AS transid,TRIM(ct.item) as item,sum(ct.qty) AS qty_sold,
                            COALESCE(SUM(rt.qty), 0) AS return_qty,
                           COALESCE(SUM(ct.qty) - SUM(rt.qty), SUM(ct.qty)) as total_qty_sold,

                            TO_CHAR(COALESCE(ct.price,ct.price), 'FM999,999,999.00'
                            )  as gross_sp,

                             TO_CHAR(COALESCE(ct.discount_price,'0'), 'FM999,999,999.00'
                            )  as disc_per_Item,
                             TO_CHAR(COALESCE(ct.price - ct.discount_price,ct.price), 'FM999,999,999.00'
                            )  as Selling_Price_after_Disc_per_Item,
                             TO_CHAR(COALESCE((ct.price - ct.discount_price) * ct.qty,0), 'FM999,999,999.00'
                            )  as Sales_after_Disc_per_Item,
                           TO_CHAR(
                            CASE 
                            WHEN COALESCE(SUM(rt.qty), 0) = 0 THEN
                            COALESCE(MAX(ct.total_discount) / 
                            (SELECT SUM(c.qty) FROM cart c WHERE c.cartid = ct.cartid) * sum(ct.qty), 0) +
                            (COALESCE(ct.discount_price, 1) * SUM(ct.qty))
                            ELSE
                            -- Returns exist, deduct return qty from total qty and adjust discount
                            COALESCE(MAX(ct.total_discount) / 
                            (SELECT SUM(c.qty) FROM cart c WHERE c.cartid = ct.cartid), 0) * 
                            (SUM(ct.qty) - COALESCE(SUM(rt.qty), 0)) +  -- Deduct return quantity
                            (COALESCE(ct.discount_price, 0) * (SUM(ct.qty) - COALESCE(SUM(rt.qty), 0)))  -- Add disc_per_item * qty after returns
                            END, 'FM999,999,999.00'
                            ) AS total_discount,
                            TO_CHAR(
                                    COALESCE(
                                      (ct.price - ct.discount_price) * ct.qty- MAX(ct.total_discount) / 
                                        (SELECT SUM(qty) FROM cart c WHERE c.cartid = ct.cartid) - sum(rt.qty * rt.price - rt.discount_price) + MAX(ct.total_discount) / 
                                        (SELECT SUM(qty) FROM cart c WHERE c.cartid = ct.cartid)
                                    ,  (ct.price - ct.discount_price) * ct.qty- MAX(ct.total_discount) / 
                                        (SELECT SUM(qty) FROM cart c WHERE c.cartid = ct.cartid)* sum(ct.qty) ), 'FM999,999,999.00'
                                  ) AS net_sales
                            FROM cart ct
                            JOIN orders ors ON ct.cartid = ors.cartid
                            join transaction t on t.orderid  = ors.orderid
                            LEFT JOIN returns rt ON rt.orderid = ors.orderid and rt.code = ct.code  
                            WHERE (LOWER(ors.status) IN ('approved', 'delivered') OR LOWER(ct.status) IN ('approved', 'delivered')) 
                             AND DATE(to_timestamp(ors.createdat / 1000.0) AT TIME ZONE 'Asia/Manila')  BETWEEN @fromDate AND @toDate
                            GROUP BY t.transid ,ct.item,ct.price,ct.discount_price,ct.cartid,ct.qty ORDER BY  DATE(to_timestamp(max(ors.createdat)/ 1000.0) AT TIME ZONE 'Asia/Manila') ;  ";
                } else
                {
                    sql =
                        @"SELECT
                              TO_CHAR(
                                    (to_timestamp(MAX(o.createdat) / 1000.0) AT TIME ZONE 'Asia/Manila')::DATE,
                            'YYYY-MM-DD'
                                ) AS transaction_date,
                              split_part(t.transid, '-', 5) AS transid,
                              TO_CHAR(o.total, 'FM999,999,999.00') AS gross_total,
                              TO_CHAR(COALESCE(sum(c.discount_price *c.qty) , 0), 'FM999,999,999.00') AS overall_discount_per_item,
                              TO_CHAR(COALESCE(MAX(c.total_discount) , 0), 'FM999,999,999.00') AS overall_order_discount,
                            TO_CHAR(COALESCE(sum(c.discount_price *c.qty) + MAX(c.total_discount) , sum(c.discount_price *c.qty)), 'FM999,999,999.00') AS overall_discount,
                            TO_CHAR(
                                COALESCE(
                                    MAX(o.totaldiscount) - 
                                    SUM(rt.qty * rt.discount_price) - 
                                    MAX(c.total_discount) / 
                                    (SELECT SUM(cat.qty) FROM cart cat WHERE cat.cartid = MAX(c.cartid)) * sum(rt.qty),
                                    o.totaldiscount
                                ), 
                                'FM999,999,999.00'
                            ) AS total_discount,
                            TO_CHAR(COALESCE(sum(rt.qty * rt.price), 0) - COALESCE(sum(rt.discount_price * rt.qty),0), 'FM999,999,999.00') AS total_returns,
                            TO_CHAR(
                              GREATEST(
                                COALESCE(
                                  SUM(c.qty * c.price) - SUM(c.discount_price * c.qty) - 
                                  (CASE 
                                    WHEN (SELECT SUM(cat.qty) FROM cart cat WHERE cat.cartid = max(c.cartid)) = 0 THEN 0
                                    ELSE MAX(c.total_discount) / 
                                       (SELECT SUM(cat.qty) FROM cart cat WHERE cat.cartid = max(c.cartid)) 
                                  END) - 
                                  SUM(rt.qty * rt.price) + SUM(rt.discount_price * rt.qty), 
                                  o.total - o.totaldiscount
                                ), 
                                0
                              ), 'FM999,999,999.00'
                            ) AS total_sales
                            FROM transaction t
                            JOIN orders o ON t.orderid = o.orderid
                            JOIN cart c ON c.cartid = o.cartid
                            LEFT JOIN returns rt ON rt.transid = t.transid AND rt.code = c.code
                            WHERE 
                              (LOWER(o.status) IN ('approved', 'delivered') 
                               OR LOWER(c.status) IN ('approved', 'delivered'))
                            AND 
                              DATE(to_timestamp(o.createdat / 1000.0) AT TIME ZONE 'Asia/Manila') 
                                BETWEEN @fromDate AND @toDate
                            GROUP BY t.transid, o.total, o.totaldiscount;";
                }
    
            }
     
            
           
            DateTime fromDate = DateTime.Parse(getSales.fromDate);
            DateTime toDate = DateTime.Parse(getSales.toDate); 
            DateTime now = DateTime.Now;
            var parameters = new Dictionary<string, object>
            {
                { "@fromDate", fromDate },
                { "@toDate", toDate },

            };

            var results = new List<SalesReportResponse>();

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
                                if (getSales.filter == 1)
                                {
                                    if (getSales.report_type == 0)
                                    {
                                        while (reader.Read())
                                        {
                                            var salesResponse = new SalesReportResponse
                                            {
                                                item = reader.GetString(reader.GetOrdinal("item")),
                                                qty_sold = reader.GetInt16(reader.GetOrdinal("qty_sold")),
                                                price = reader.GetInt16(reader.GetOrdinal("price")),
                                                return_qty = reader.GetInt16(reader.GetOrdinal("return_qty")),
                                                total_qty_sold = reader.GetInt16(reader.GetOrdinal("total_qty_sold")),
                                                total_sales = reader.GetString(reader.GetOrdinal("total_sales")),
                                            };

                                            results.Add(salesResponse);
                                        }
                                    }
                                    else
                                    {
                                        while (reader.Read())
                                        {
                                            var salesResponse = new SalesReportResponse
                                            {
                                                
                                                transaction_date = reader.GetString(reader.GetOrdinal("transaction_date")),
                                                transid = reader.GetString(reader.GetOrdinal("transid")),
                                                total = reader.GetString(reader.GetOrdinal("total")),
                                                total_returns = reader.GetString(reader.GetOrdinal("total_returns")),
                                                total_sales = reader.GetString(reader.GetOrdinal("total_sales")),
                                            };

                                            results.Add(salesResponse);
                                        }
                                     
                                    }
                                    
                                 
                                }
                                else
                                {
                                    if (getSales.report_type == 0)
                                    {
                                        
                                        while (reader.Read())
                                        {
                                            var salesResponse = new SalesReportResponse
                                            {
                                                transaction_date = reader.GetString(reader.GetOrdinal("transaction_date")),
                                                transid = reader.GetString(reader.GetOrdinal("transid")),
                                                item = reader.GetString(reader.GetOrdinal("item")),
                                                qty_sold = reader.GetInt16(reader.GetOrdinal("qty_sold")),
                                                gross_sp = reader.GetString(reader.GetOrdinal("gross_sp")),
                                                return_qty = reader.GetInt16(reader.GetOrdinal("return_qty")),
                                                total_qty_sold = reader.GetInt16(reader.GetOrdinal("total_qty_sold")),
                                                disc_per_Item = reader.GetString(reader.GetOrdinal("disc_per_Item")),
                                                Selling_Price_after_Disc_per_Item = reader.GetString(reader.GetOrdinal("Selling_Price_after_Disc_per_Item")),
                                                Sales_after_Disc_per_Item = reader.GetString(reader.GetOrdinal("Sales_after_Disc_per_Item")),
                                                total_discount = !reader.IsDBNull(reader.GetOrdinal("total_discount"))? reader.GetString(reader.GetOrdinal("total_discount")): "0",
                                                net_sales = !reader.IsDBNull(reader.GetOrdinal("net_sales"))? reader.GetString(reader.GetOrdinal("net_sales")): "0",
                                            };

                                            results.Add(salesResponse);
                                        }
                                    }
                                    else
                                    {
                                        while (reader.Read())
                                        {
                                            var salesResponse = new SalesReportResponse
                                            {
                                                transaction_date =  reader.GetString(reader.GetOrdinal("transaction_date")),
                                                transid = reader.GetString(reader.GetOrdinal("transid")),
                                                gross_total = reader.GetString(reader.GetOrdinal("gross_total")),
                                                overall_discount_per_item = reader.GetString(reader.GetOrdinal("overall_discount_per_item")),
                                                overall_order_discount = reader.GetString(reader.GetOrdinal("overall_order_discount")),
                                                overall_discount = reader.GetString(reader.GetOrdinal("overall_discount")),
                                                total_discount = reader.GetString(reader.GetOrdinal("total_discount")),
                                                total_returns = reader.GetString(reader.GetOrdinal("total_returns")),
                                                total_sales = reader.GetString(reader.GetOrdinal("total_sales")),
                                            };

                                            results.Add(salesResponse);
                                        }
                                    }
                                }
                               
                            }
                        }

                        tran.Commit();

                        byte[] fileContents = getSales.filter == 1 ? GeneratePdfReportWithoutDiscount(results, fromDate, toDate,getSales.report_type) :  GeneratePdfReport(results, fromDate, toDate,getSales.report_type);
                        string fileName = $"Sales_Report_{now:yyyyMMddHHmmss}.pdf"; // Formatting the datetime for the file name
                        var fileResult = new FileContentResult(fileContents, "application/pdf")
                        {
                            FileDownloadName = fileName
                        };
                        return new SalesResponseModel
                        {
                            result = fileResult,
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
                            message= ex.Message,
                            statusCode = 500,
                            success = true
                        };
                        throw;
                    }
                }
            }
        }
        public SalesResponseModel GenerateSalesReturn(GetSales getSales)
        {
            var sql = @" select  ct.code, TRIM(ct.item) as item, ret.price, SUM(ret.qty) as qty, TO_CHAR(SUM(ret.qty* ret.price), 'FM999,999,999.00') AS total_sales
                from transaction as tr right join orders as ors on tr.orderid = ors.orderid
                join cart as ct on ct.cartid = ors.cartid
                join returns ret on ret.orderid = ors.orderid
                where LOWER(ors.status) = 'approved' and LOWER(ct.status) = 'return'
                AND DATE(to_timestamp(tr.createdat / 1000.0) AT TIME ZONE 'Asia/Manila') between @fromDate and @toDate
                group by ct.item, ct.code,ret.price order by trim(ct.item) asc;";

            DateTime fromDate = DateTime.Parse(getSales.fromDate);
            DateTime toDate = DateTime.Parse(getSales.toDate);
            DateTime now = DateTime.Now;
            var parameters = new Dictionary<string, object>
            {
                { "@fromDate", fromDate },
                { "@toDate", toDate },
            };

            var results = new List<ReturnSalesResponse>();

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
                                    var salesResponse = new ReturnSalesResponse
                                    {
                                        code = reader.GetString(reader.GetOrdinal("code")),
                                        item = reader.GetString(reader.GetOrdinal("item")),
                                        qty = reader.GetInt16(reader.GetOrdinal("qty")),
                                        price = reader.GetFloat(reader.GetOrdinal("price")),
                                        total_sales = reader.GetString(reader.GetOrdinal("total_sales")),
                                    };

                                    results.Add(salesResponse);
                                }
                            }
                        }

                        tran.Commit();

                        byte[] fileContents = GenerateSalesReturnPdfReport(results, fromDate, toDate);
                        string fileName = $"Sales_Report_{now:yyyyMMddHHmmss}.pdf"; // Formatting the datetime for the file name
                        var fileResult = new FileContentResult(fileContents, "application/pdf")
                        {
                            FileDownloadName = fileName
                        };
                        return new SalesResponseModel
                        {
                            result = fileResult,
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
                            statusCode = 500,
                            success = true,
                            message=ex.Message
                        };
                        throw;
                    }
                }
            }
        } 
        public SalesResponseModel GenerateInventoryLogs(GetInventoryLogs getInventoryLogs)
        {
            var sql = @"select i.code,trim(i.item) as item ,i.cost ,i.price ,i.brand ,iv.addedqty , iv.onhandqty,TO_CHAR(TO_TIMESTAMP(iv.createdat / 1000), 'dd/MM/yyyy')  as received_date , s.company,iv.createdat from inventorylogs iv join inventory i  on i.code =iv.code join supplier s on s.supplierid = iv.supplierid 
                        where s.supplierid = @supplier and DATE(to_timestamp(iv.createdat / 1000.0) AT TIME ZONE 'Asia/Manila') between @fromDate and @toDate order by trim(i.item) asc; ";

            DateTime fromDate = DateTime.Parse(getInventoryLogs.fromDate);
            DateTime toDate = DateTime.Parse(getInventoryLogs.toDate);
            DateTime now = DateTime.Now;
            var parameters = new Dictionary<string, object>
            {
                { "@fromDate", fromDate },
                { "@supplier", getInventoryLogs.supplier },
                { "@toDate", toDate },
            };

            var results = new List<InventoryLogsResponse>();

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
                                    var salesResponse = new InventoryLogsResponse
                                    {
                                        code = reader.GetString(reader.GetOrdinal("code")),
                                        item = reader.GetString(reader.GetOrdinal("item")),
                                        cost = reader.GetFloat(reader.GetOrdinal("cost")),
                                        price = reader.GetFloat(reader.GetOrdinal("price")),
                                        addedqty = reader.GetInt16(reader.GetOrdinal("addedqty")),
                                        onhandqty = reader.GetInt16(reader.GetOrdinal("onhandqty")),
                                        brand = reader.GetString(reader.GetOrdinal("brand")),
                                        company = reader.GetString(reader.GetOrdinal("company")),
                                        received_date = reader.GetString(reader.GetOrdinal("received_date")),
                                    };

                                    results.Add(salesResponse);
                                }
                            }
                        }

                        tran.Commit();

                        byte[] fileContents = GenerateInventoryLogsPdfReport(results, fromDate, toDate);
                        string fileName = $"Inventory_Logs_Report_{now:yyyyMMddHHmmss}.pdf"; // Formatting the datetime for the file name
                        var fileResult = new FileContentResult(fileContents, "application/pdf")
                        {
                            FileDownloadName = fileName
                        };
                        return new SalesResponseModel
                        {
                            result = fileResult,
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
                            statusCode = 500,
                            success = false,
                            message=ex.Message
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
                        group by inv.code,inv.item,inv.qty,inv.cost,inv.price order by trim(inv.item) asc;";



            var results = new List<InventoryResponse>();
            DateTime now = DateTime.Now;
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
                        byte[] fileContents = GenerateInventoryPdfReport(results, now);
                        string fileName = $"Sales_Report_{now:yyyyMMddHHmmss}.pdf"; // Formatting the datetime for the file name
                        var fileResult = new FileContentResult(fileContents, "application/pdf")
                        {
                            FileDownloadName = fileName
                        };

                        return new InventoryResponseModel
                        {
                            result = fileResult,
                            statusCode = 200,
                            success = true,
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new InventoryResponseModel
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
        public RequestRefundResponseModel getItemtoRefund(RequestRefundRequest requestRefundRequest)
        {
            var sql = @"select  tr.transid, tr.orderid,ct.cartid,i.image,ct.code,ct.item,ct.qty,ct.price,ct,discount_price,ct.total_discount,ct.total,ct.status,ors.createdat from transaction as tr
                        join orders as ors on tr.orderid = ors.orderid
                        join cart as ct on ct.cartid = ors.cartid 
                        join inventory i on i.code = ct.code   where tr.transid=@transid";
            var parameters = new Dictionary<string, object>
            {
                { "@transid", requestRefundRequest.transid },
            };
            var results = new List<RequestRefundResponse>();
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
                                    var refundItemsResponse = new RequestRefundResponse
                                    {
                                        transid = reader.GetString(reader.GetOrdinal("transid")),
                                        orderid = reader.GetString(reader.GetOrdinal("orderid")),
                                        cartid = reader.GetString(reader.GetOrdinal("cartid")),
                                        code = reader.GetString(reader.GetOrdinal("code")),
                                        item = reader.GetString(reader.GetOrdinal("item")),
                                        status = reader.GetString(reader.GetOrdinal("status")),
                                        price = reader.GetFloat(reader.GetOrdinal("price")),
                                        discount_price = reader.GetFloat(reader.GetOrdinal("discount_price")),
                                        total_discount = reader.GetFloat(reader.GetOrdinal("total_discount")),
                                        qty = reader.GetInt64(reader.GetOrdinal("qty")),
                                        image = reader.GetString(reader.GetOrdinal("image")),
                                        onhandqty = reader.GetInt64(reader.GetOrdinal("qty")),
                                        total = reader.GetFloat(reader.GetOrdinal("total")),
                                        createdat = reader.GetInt64(reader.GetOrdinal("createdat")),
                                    };
                                    string originalPath = refundItemsResponse.image;
                                    if (originalPath != "0")
                                    {
                                        string formattedPath = originalPath.Replace("\\", "\\\\");
                                        string path = Path.Combine(Directory.GetCurrentDirectory(), formattedPath);

                                        if (!System.IO.File.Exists(path))
                                        {
                                            refundItemsResponse.image = null;
                                        }
                                        else
                                        {
                                            string contentType = "image/jpeg";
                                            if (Path.GetExtension(path)
                                                .Equals(".png", StringComparison.OrdinalIgnoreCase))
                                            {
                                                contentType = "image/png";
                                            }

                                            byte[] imageData = System.IO.File.ReadAllBytes(path);

                                            refundItemsResponse.image = Convert.ToBase64String(imageData);
                                            refundItemsResponse.image_type = contentType;
                                        }
                                    }    
                                    else
                                    {
                                        refundItemsResponse.image = null;
                                        refundItemsResponse.image_type = null;
                                    }

                                    results.Add(refundItemsResponse);
                                }
                            }
                        }

                        tran.Commit();

                        return new RequestRefundResponseModel
                        {
                            result = results,
                            statusCode = 200,
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new RequestRefundResponseModel
                        {
                            message = ex.Message,
                            statusCode = 500,
                        };
                        throw;
                    }
                }
            }
        }
        public PostResponse PostReturnItems(InventoryRequestModel.ReturnItems[] returnItems)
        {
            var insertReturn = @"insert into returns (transid,orderid,code,item,qty,price,createdat,remarks,totaldiscount,discount_price) 
                                values(@transid, @orderid, @code, @item, @qty, @price,@createdat,@remarks,@totaldiscount,@discount_price)";
            var updateCart = @"update cart set status='return' where cartid=@cartid and code=@code";
            var reconcileInventory = @"update inventory set qty=qty + @qty where code=@code";
            var cmd = new NpgsqlCommand();
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();
                var insertedReturns = 0;
                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        foreach (var cartItems in returnItems)
                        {
                            // Execute the insertion command for each item
                            using (cmd = new NpgsqlCommand(reconcileInventory, connection))
                            {
                                var parameters = new Dictionary<string, object>
                                {
                                    { "@qty", cartItems.qty },
                                    { "@code", cartItems.code },
                                };
                                foreach (var param in parameters)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                                cmd.ExecuteNonQuery();
                            }
                        }
                        foreach (var cartItems in returnItems)
                        {
                            // Execute the insertion command for each item
                            using (cmd = new NpgsqlCommand(updateCart, connection))
                            {
                                var parameters = new Dictionary<string, object>
                                {
                                    { "@cartid", cartItems.cartid },
                                    { "@code", cartItems.code },
                                };
                                foreach (var param in parameters)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                                cmd.ExecuteNonQuery();
                            }
                        }
                        foreach (var items in returnItems)
                        {
                            // Execute the insertion command for each item
                            items.totaldiscount = items.discount_price * items.qty;
                            using (cmd = new NpgsqlCommand(insertReturn, connection))
                            {
                            
                                var parameters = new Dictionary<string, object>
                                {
                                    { "@transid", items.transid },
                                    { "@orderid", items.orderid },
                                    { "@code", items.code },
                                    { "@item", items.item },
                                    { "@qty", items.qty },
                                    { "@price", items.price },
                                    { "@discount_price", items.discount_price },
                                    { "@totaldiscount", items.totaldiscount },
                                    { "@createdat", items.createdat },
                                    { "@remarks", items.remarks },
                                };

                                foreach (var param in parameters)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                                insertedReturns = cmd.ExecuteNonQuery();
                            }
                        }

                        if (insertedReturns > 0)
                        {

                            tran.Commit();
                            return new PostResponse
                            {
                                status = 200,
                                Message = "Order successfully return"
                            };
                        }
                        else
                        {
                            tran.Rollback();
                            return new PostResponse
                            {
                                status = 500,
                                Message = "Return failed"
                            };
                        }

                        // Commit the transaction after all items have been processed
                     
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
        public byte[] GenerateInventoryPdfReport(List<InventoryResponse> sales,DateTime date)
        {
            //string base64String = LoadCompanyLogoAsBase64();
            //byte[] logoBytes = Convert.FromBase64String(base64String);

            using (MemoryStream ms = new MemoryStream())
            {
                Document doc = new Document();
                PdfWriter.GetInstance(doc, ms);
                doc.Open();

                // Add company logo
                //if (logoBytes != null)
                //{
                    Paragraph logotitle = new Paragraph();
                    logotitle.Alignment = Element.ALIGN_CENTER;
                    logotitle.Add(Chunk.NEWLINE);
                    logotitle.Add(new Chunk("Restie Hardware Inventory Report", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 24)));
                    logotitle.Add(Chunk.NEWLINE);
                    logotitle.Add(Chunk.NEWLINE);
                    logotitle.Add(new Chunk($"Address: SIR Bucana 76-A", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                    logotitle.Add(Chunk.NEWLINE);
                    logotitle.Add(new Chunk($"Sandawa Matina Davao City", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                    logotitle.Add(Chunk.NEWLINE);
                    logotitle.Add(new Chunk($"Davao City, Philippines", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                    logotitle.Add(Chunk.NEWLINE);
                    logotitle.Add(new Chunk($"Contact No.: (082) 224 1362", FontFactory.GetFont(FontFactory.HELVETICA, 12)));

                    //Image logo = Image.GetInstance(logoBytes);
                    //logo.Alignment = Element.ALIGN_CENTER;
                    //logo.ScaleAbsolute(50f, 50f); // Adjust dimensions as needed
                    //doc.Add(logo);
                    doc.Add(logotitle);
                //}

                // Add title
                Paragraph title = new Paragraph();
                title.Alignment = Element.ALIGN_CENTER;
                title.Add(Chunk.NEWLINE);
                title.Add(new Chunk($"Start Date: {date.ToString("MM/dd/yyyy")}", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
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
        public byte[] GenerateSalesReturnPdfReport(List<ReturnSalesResponse> sales, DateTime from_date, DateTime to_date)
        {
            // Load company logo
            //string base64String = LoadCompanyLogoAsBase64();
            //byte[] logoBytes = Convert.FromBase64String(base64String);

            using (MemoryStream ms = new MemoryStream())
            {
                Document doc = new Document();
                PdfWriter.GetInstance(doc, ms);
                doc.Open();

                // Add company logo
                //if (logoBytes != null)
                //{
                Paragraph logotitle = new Paragraph();
                logotitle.Alignment = Element.ALIGN_CENTER;
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk("Restie Hardware", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 24)));
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk("Sales Return/Refund Report", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 24)));
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk($"Address: SIR Bucana 76-A", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk($"Sandawa Matina Davao City", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk($"Davao City, Philippines", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk($"Contact No.: (082) 224 1362", FontFactory.GetFont(FontFactory.HELVETICA, 12)));

                //Image logo = Image.GetInstance(logoBytes);
                //logo.Alignment = Element.ALIGN_CENTER;
                //logo.ScaleAbsolute(50f, 50f); // Adjust dimensions as needed
                //doc.Add(logo);
                doc.Add(logotitle);
                //}

                // Add title
                Paragraph title = new Paragraph();
                title.Alignment = Element.ALIGN_CENTER;
                title.Add(Chunk.NEWLINE);
                title.Add(new Chunk($"Start Date: {from_date.ToString("MM/dd/yyyy")} End Date: {to_date.ToString("MM/dd/yyyy")}", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                title.Add(Chunk.NEWLINE);
                title.Add(Chunk.NEWLINE);
                doc.Add(title);

                // Add table
                PdfPTable table = new PdfPTable(5);
                table.WidthPercentage = 100;
                table.SetWidths(new float[] { 1, 3, 1, 2,2 });
                table.SpacingBefore = 20f; // Add spacing before the table
                                           // Add table headers
                table.AddCell(new PdfPCell(new Phrase("Code", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                table.AddCell(new PdfPCell(new Phrase("Item", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                table.AddCell(new PdfPCell(new Phrase("Qty", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                table.AddCell(new PdfPCell(new Phrase("Price", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                table.AddCell(new PdfPCell(new Phrase("Total", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                // Add table data
                decimal totalSales = 0;
                foreach (var sale in sales)
                {
                    table.AddCell(sale.code);
                    table.AddCell(sale.item);
                    table.AddCell(new PdfPCell(new Phrase(sale.qty.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                    table.AddCell(new PdfPCell(new Phrase(sale.price.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                    table.AddCell(new PdfPCell(new Phrase(Decimal.Parse(sale.total_sales).ToString("N2"), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                    totalSales += Decimal.Parse(sale.total_sales);
                }

                // Add total row
                PdfPCell totalCell = new PdfPCell(new Phrase("Overall Total", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12)));
                totalCell.Colspan = 3;
                totalCell.HorizontalAlignment = Element.ALIGN_RIGHT;
                table.AddCell(totalCell);
                table.AddCell(new PdfPCell(new Phrase(totalSales.ToString("N2"), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
             

                doc.Add(table);
                doc.Close();

                return ms.ToArray();
            }
        }
        public byte[] GenerateInventoryLogsPdfReport(List<InventoryLogsResponse> inventoryLogs, DateTime from_date, DateTime to_date)
        {
            // Load company logo
            //string base64String = LoadCompanyLogoAsBase64();
            //byte[] logoBytes = Convert.FromBase64String(base64String);

            using (MemoryStream ms = new MemoryStream())
            {
                Document doc = new Document(PageSize.A4.Rotate());
                PdfWriter.GetInstance(doc, ms);
                doc.Open();

                // Add company logo
                //if (logoBytes != null)
                //{
                Paragraph logotitle = new Paragraph();
                logotitle.Alignment = Element.ALIGN_CENTER;
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk("Restie Hardware", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 24)));
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk("Inventory Logs Report", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 24)));
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk($"Address: SIR Bucana 76-A", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk($"Sandawa Matina Davao City", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk($"Davao City, Philippines", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk($"Contact No.: (082) 224 1362", FontFactory.GetFont(FontFactory.HELVETICA, 12)));

                //Image logo = Image.GetInstance(logoBytes);
                //logo.Alignment = Element.ALIGN_CENTER;
                //logo.ScaleAbsolute(50f, 50f); // Adjust dimensions as needed
                //doc.Add(logo);
                doc.Add(logotitle);
                //}

                // Add title
                Paragraph title = new Paragraph();
                title.Alignment = Element.ALIGN_CENTER;
                title.Add(Chunk.NEWLINE);
                title.Add(new Chunk($"Start Date: {from_date.ToString("MM/dd/yyyy")} End Date: {to_date.ToString("MM/dd/yyyy")}", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                title.Add(Chunk.NEWLINE);
                title.Add(Chunk.NEWLINE);
                doc.Add(title);

                // Add table
                PdfPTable table = new PdfPTable(9);
                table.WidthPercentage = 100;
                table.SetWidths(new float[] { 1, 3, 2, 1.5f,1.5f,1.5f, 1.5f,1.5f, 2 });
                table.SpacingBefore = 20f; // Add spacing before the table
                                           // Add table headers
                table.AddCell(new PdfPCell(new Phrase("Code", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                table.AddCell(new PdfPCell(new Phrase("Item", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                table.AddCell(new PdfPCell(new Phrase("Brand", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                table.AddCell(new PdfPCell(new Phrase("Cost", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                table.AddCell(new PdfPCell(new Phrase("Price", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                table.AddCell(new PdfPCell(new Phrase("Added Qty", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                table.AddCell(new PdfPCell(new Phrase("Onhand Qty", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                table.AddCell(new PdfPCell(new Phrase("Recieved Date", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                table.AddCell(new PdfPCell(new Phrase("Supplier", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                // Add table data
                foreach (var invLogs in inventoryLogs)
                {
                    table.AddCell(new PdfPCell(new Phrase(invLogs.code.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                    table.AddCell(new PdfPCell(new Phrase(invLogs.item.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                    table.AddCell(new PdfPCell(new Phrase(invLogs.brand.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                    table.AddCell(new PdfPCell(new Phrase(invLogs.cost.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                    table.AddCell(new PdfPCell(new Phrase(invLogs.price.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                    table.AddCell(new PdfPCell(new Phrase(invLogs.addedqty.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                    table.AddCell(new PdfPCell(new Phrase(invLogs.onhandqty.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                    table.AddCell(new PdfPCell(new Phrase(invLogs.received_date.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                    table.AddCell(new PdfPCell(new Phrase(invLogs.company.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                 
                }

                // Add total row
                //PdfPCell totalCell = new PdfPCell(new Phrase("Overall Total", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12)));
                //totalCell.Colspan = 3;
                //totalCell.HorizontalAlignment = Element.ALIGN_RIGHT;
                //table.AddCell(totalCell);
                //table.AddCell(new PdfPCell(new Phrase(totalSales.ToString("N2"), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });


                doc.Add(table);
                doc.Close();

                return ms.ToArray();
            }
        }
        public byte[] GeneratePdfReport(List<SalesReportResponse> sales, DateTime from_date,DateTime to_date, int report_type)
            {
            // Load company logo
            //string base64String = LoadCompanyLogoAsBase64();
            //byte[] logoBytes = Convert.FromBase64String(base64String);

            using (MemoryStream ms = new MemoryStream())
                {
                    Document doc = new Document(PageSize.A4.Rotate());
                    PdfWriter.GetInstance(doc, ms);
                    doc.Open();

                // Add company logo
                //if (logoBytes != null)
                //{
                var report_title_type = "";
                if (report_type == 0 )
                {
                    report_title_type = "Restie Hardware Sales Per Item with discount";
                }
                else
                {
                    report_title_type = "Restie Hardware Sales Summary with discount";
                }
                    Paragraph logotitle = new Paragraph();
                        logotitle.Alignment = Element.ALIGN_CENTER;
                        logotitle.Add(Chunk.NEWLINE);
                        logotitle.Add(new Chunk(report_title_type, FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 24)));
                        logotitle.Add(Chunk.NEWLINE);
                        logotitle.Add(Chunk.NEWLINE);
                        logotitle.Add(new Chunk($"Address: SIR Bucana 76-A", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                        logotitle.Add(Chunk.NEWLINE);
                        logotitle.Add(new Chunk($"Sandawa Matina Davao City", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                        logotitle.Add(Chunk.NEWLINE);
                        logotitle.Add(new Chunk($"Davao City, Philippines", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                        logotitle.Add(Chunk.NEWLINE);
                        logotitle.Add(new Chunk($"Contact No.: (082) 224 1362", FontFactory.GetFont(FontFactory.HELVETICA, 12)));

                    //Image logo = Image.GetInstance(logoBytes);
                    //logo.Alignment = Element.ALIGN_CENTER;
                    //logo.ScaleAbsolute(50f, 50f); // Adjust dimensions as needed
                    //doc.Add(logo);
                    doc.Add(logotitle);
                //}

                // Add title
                    Paragraph title = new Paragraph();
                    title.Alignment = Element.ALIGN_CENTER;
                    title.Add(Chunk.NEWLINE);
                    title.Add(new Chunk($"Start Date: {from_date.ToString("MM/dd/yyyy")} End Date: {to_date.ToString("MM/dd/yyyy")}", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                    title.Add(Chunk.NEWLINE);
                    title.Add(Chunk.NEWLINE);
                    doc.Add(title);

                    // Add table
                    PdfPTable table = new PdfPTable(report_type == 0?12:9);
                    table.WidthPercentage = 100;
                    if (report_type == 0)
                    {
                    
                        table.SetWidths(new float[] {2, 2, 2, 1.5f, 1.5f, 1.5f, 1.5f, 1.5f, 1.5f, 1.5f, 1.5f, 1.5f });
                    }
                    else
                    {
                        table.SetWidths(new float[] { 2, 1.5f, 1.5f, 1.5f, 1.5f, 1.5f, 1.5f, 1.5f, 1.5f});
                    }
                    table.SpacingBefore = 50f; // Add spacing before the table
                                               // Add table headers
                   if (report_type == 0)
                   {
                       table.AddCell(new PdfPCell(new Phrase("Trans Date", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                       table.AddCell(new PdfPCell(new Phrase("Trans ID", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                       table.AddCell(new PdfPCell(new Phrase("Item", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                       table.AddCell(new PdfPCell(new Phrase("Qty Sold", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                       table.AddCell(new PdfPCell(new Phrase("Qty Return", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                       table.AddCell(new PdfPCell(new Phrase("Total Qty Sold", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                       table.AddCell(new PdfPCell(new Phrase("Gross Price", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                       table.AddCell(new PdfPCell(new Phrase("Disc/Item", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                       table.AddCell(new PdfPCell(new Phrase("Selling Price after Disc/Item", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                       table.AddCell(new PdfPCell(new Phrase("Sales after Disc/Item", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                       table.AddCell(new PdfPCell(new Phrase("Overall Discount/Qty", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                       table.AddCell(new PdfPCell(new Phrase("Net Sales", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                   }
                   else
                    {
                        table.AddCell(new PdfPCell(new Phrase("Trans Date", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                        table.AddCell(new PdfPCell(new Phrase("Trans ID", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                        table.AddCell(new PdfPCell(new Phrase("Gross Total", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                        table.AddCell(new PdfPCell(new Phrase("Overall discount per item ", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                        table.AddCell(new PdfPCell(new Phrase("Overall order discount", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                        table.AddCell(new PdfPCell(new Phrase("Overall discount", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                        table.AddCell(new PdfPCell(new Phrase("Total discount - returns disc", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                        table.AddCell(new PdfPCell(new Phrase("Total returns", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                        table.AddCell(new PdfPCell(new Phrase("Total sales", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                    }


                // Add table data
                decimal totalSales = 0;
                    decimal totalSalesWDiscount = 0;
                    decimal totalProfitWDiscount = 0;
                    decimal totalDiscount = 0;
                    decimal totalCost = 0;
                    decimal profit = 0;
                    decimal profitwDiscount = 0;
                    decimal saleswDiscount = 0;
                    if (report_type == 0)
                    {
                        
                        foreach (var sale in sales)
                        {
                            table.AddCell(sale.transaction_date.ToString());
                            table.AddCell(sale.transid);
                            table.AddCell(sale.item);
                            table.AddCell(new PdfPCell(new Phrase(sale.qty_sold.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                            table.AddCell(new PdfPCell(new Phrase(sale.return_qty.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                            table.AddCell(new PdfPCell(new Phrase(sale.total_qty_sold.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                            table.AddCell(new PdfPCell(new Phrase(Decimal.Parse(sale.gross_sp).ToString("N2"), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER }); 
                            table.AddCell(new PdfPCell(new Phrase(Decimal.Parse(sale.disc_per_Item).ToString("N2"), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER }); 
                            table.AddCell(new PdfPCell(new Phrase(Decimal.Parse(sale.Selling_Price_after_Disc_per_Item).ToString("N2"), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER }); 
                            table.AddCell(new PdfPCell(new Phrase(Decimal.Parse(sale.Sales_after_Disc_per_Item).ToString("N2"), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER }); 
                            table.AddCell(new PdfPCell(new Phrase(Decimal.Parse(sale.total_discount.ToString()).ToString("N2"), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                            table.AddCell(new PdfPCell(new Phrase(Decimal.Parse(sale.net_sales).ToString("N2"), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                            totalSales += Decimal.Parse(sale.net_sales);
                            totalDiscount += Decimal.Parse(sale.total_discount);
                        }
                       
                    }
                    else
                    {
                        
                        foreach (var sale in sales)
                        {
                            table.AddCell(sale.transaction_date);
                            table.AddCell(sale.transid);
                            table.AddCell(new PdfPCell(new Phrase(sale.gross_total.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                            table.AddCell(new PdfPCell(new Phrase(sale.overall_discount_per_item.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                            table.AddCell(new PdfPCell(new Phrase(sale.overall_order_discount.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                            table.AddCell(new PdfPCell(new Phrase(sale.overall_discount.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                            table.AddCell(new PdfPCell(new Phrase(sale.total_discount.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                            table.AddCell(new PdfPCell(new Phrase(sale.total_returns.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                            table.AddCell(new PdfPCell(new Phrase(sale.total_sales.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                            totalSales += Decimal.Parse(sale.total_sales);
                            totalDiscount += Decimal.Parse(sale.total_discount);

                        }
                    }

                    // Add total row
                    
                    PdfPCell totalCellDiscount = new PdfPCell(new Phrase("Overall Total Discount", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12)));
                    PdfPCell totalCellPrice = new PdfPCell(new Phrase("Overall Total Sales", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12)));
                 
                    totalCellPrice.Colspan = 6;
                    totalCellPrice.HorizontalAlignment = Element.ALIGN_RIGHT;
                    totalCellDiscount.Colspan = 6;
                    totalCellDiscount.HorizontalAlignment = Element.ALIGN_RIGHT;

                    table.AddCell(totalCellDiscount);
                    table.AddCell(totalCellPrice);

                 
                    PdfPCell totalPriceData = new PdfPCell(new Phrase(totalSales.ToString("N2"), FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12)));
                    PdfPCell totalDiscountData = new PdfPCell(new Phrase(totalDiscount.ToString("N2"), FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12)));
                  
                  
                    totalPriceData.HorizontalAlignment = Element.ALIGN_RIGHT;
                    totalPriceData.Colspan = 6;
                    totalDiscountData.HorizontalAlignment = Element.ALIGN_RIGHT;
                    totalDiscountData.Colspan = 6;

                    table.AddCell(totalDiscountData);
                    table.AddCell(totalPriceData);
                    doc.Add(table);
                    doc.Close();

                    return ms.ToArray();
                }
            }
        public byte[] GeneratePdfReportWithoutDiscount(List<SalesReportResponse> sales, DateTime from_date, DateTime to_date, int report_type)
        {
            // Load company logo
            //string base64String = LoadCompanyLogoAsBase64();
            //byte[] logoBytes = Convert.FromBase64String(base64String);

            using (MemoryStream ms = new MemoryStream())
            {
                Document doc = new Document(PageSize.A4.Rotate());
                PdfWriter.GetInstance(doc, ms);
                doc.Open();

                // Add company logo
                //if (logoBytes != null)
                //{
                var report_title_type = "";
                if (report_type == 0 )
                {
                    report_title_type = "Restie Hardware Sales Per Item without discount";
                }
                else
                {
                    report_title_type = "Restie Hardware Sales Summary without discount";
                }
                Paragraph logotitle = new Paragraph();
                logotitle.Alignment = Element.ALIGN_CENTER;
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk("Restie Hardware Sales Details", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 24)));
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk($"Address: SIR Bucana 76-A", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk($"Sandawa Matina Davao City", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk($"Davao City, Philippines", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk($"Contact No.: (082) 224 1362", FontFactory.GetFont(FontFactory.HELVETICA, 12)));

                //Image logo = Image.GetInstance(logoBytes);
                //logo.Alignment = Element.ALIGN_CENTER;
                //logo.ScaleAbsolute(50f, 50f); // Adjust dimensions as needed
                //doc.Add(logo);
                doc.Add(logotitle);
                //}

                // Add title
                Paragraph title = new Paragraph();
                title.Alignment = Element.ALIGN_CENTER;
                title.Add(Chunk.NEWLINE);
                title.Add(new Chunk($"Start Date: {from_date.ToString("MM/dd/yyyy")} End Date: {to_date.ToString("MM/dd/yyyy")}", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                title.Add(Chunk.NEWLINE);
                title.Add(Chunk.NEWLINE);
                doc.Add(title);

                // Add table
                
                PdfPTable table = new PdfPTable(report_type == 0?6:5);
                table.WidthPercentage = 100;
                if (report_type == 0)
                {
                    
                    table.SetWidths(new float[] {2, 1.5f, 1, 1.5f, 1.5f, 1.5f });
                }
                else
                {
                    table.SetWidths(new float[] {2, 1.5f, 1, 1.5f, 1.5f});
                }
                table.SpacingBefore = 50f; // Add spacing before the table
                                           // Add table headers
               if (report_type == 0)
               {
                   table.AddCell(new PdfPCell(new Phrase("Item", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                   table.AddCell(new PdfPCell(new Phrase("Qty Sold", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                   table.AddCell(new PdfPCell(new Phrase("Qty Return", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                   table.AddCell(new PdfPCell(new Phrase("Total Qty Sold", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                   table.AddCell(new PdfPCell(new Phrase("Price", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                   table.AddCell(new PdfPCell(new Phrase("Total Sales", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
               }
               else
               {
                   table.AddCell(new PdfPCell(new Phrase("Trans Date", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                   table.AddCell(new PdfPCell(new Phrase("Trans ID", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                   table.AddCell(new PdfPCell(new Phrase("Total", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                   table.AddCell(new PdfPCell(new Phrase("Total returns", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                   table.AddCell(new PdfPCell(new Phrase("Total sales", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
               }
            



                // Add table data
                decimal totalSales = 0;
                decimal totalSalesWDiscount = 0;
                decimal totalProfitWDiscount = 0;
                decimal totalDiscount = 0;
                decimal totalCost = 0;
                decimal profit = 0;
                decimal profitwDiscount = 0;
                decimal saleswDiscount = 0;
                if (report_type == 0)
                {
                    
                    foreach (var sale in sales)
                    {
                        table.AddCell(sale.item);
                        table.AddCell(new PdfPCell(new Phrase(sale.qty_sold.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                        table.AddCell(new PdfPCell(new Phrase(sale.return_qty.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                        table.AddCell(new PdfPCell(new Phrase(sale.total_qty_sold.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                        table.AddCell(new PdfPCell(new Phrase(Decimal.Parse(sale.price.ToString()).ToString("N2"), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                        table.AddCell(new PdfPCell(new Phrase(Decimal.Parse(sale.total_sales).ToString("N2"), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
               
                        totalSales += Decimal.Parse(sale.total_sales);
                    }
             
                }
                else
                {
                    foreach (var sale in sales)
                    {
                        table.AddCell(sale.transaction_date);
                        table.AddCell(sale.transid);
                        table.AddCell(new PdfPCell(new Phrase(sale.total.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                        table.AddCell(new PdfPCell(new Phrase(sale.total_returns.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                        table.AddCell(new PdfPCell(new Phrase(sale.total_sales.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                        totalSales += Decimal.Parse(sale.total_sales);
                    }
                }

          

                // Add total row
                PdfPCell totalCellPrice = new PdfPCell(new Phrase("Overall Total Sales", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12)));

                totalCellPrice.Colspan = 3;
                totalCellPrice.HorizontalAlignment = Element.ALIGN_RIGHT;
                
                table.AddCell(totalCellPrice);

                PdfPCell totalPriceData = new PdfPCell(new Phrase(totalSales.ToString("N2"), FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12)));
          
                totalPriceData.HorizontalAlignment = Element.ALIGN_RIGHT;
                totalPriceData.Colspan = 3;


                table.AddCell(totalPriceData);
                doc.Add(table);
                doc.Close();

                return ms.ToArray();
            }
        }

        public byte[] GenerateQuotationPdfReport(List<ItemOrders> orders, OrderInfoResponse customer,DateTime quoted_date)
        {
            // Load company logo
            //string base64String = LoadCompanyLogoAsBase64();
            //byte[] logoBytes = Convert.FromBase64String(base64String);

            using (MemoryStream ms = new MemoryStream())
            {
                Document doc = new Document();
                PdfWriter.GetInstance(doc, ms);
                doc.Open();

                // Add company logo
                //if (logoBytes != null)
                //{
                Paragraph logotitle = new Paragraph();
                logotitle.Alignment = Element.ALIGN_CENTER;
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk("Restie Hardware", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 24)));
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk("Request For Quotation", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 24)));
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk($"Address: SIR Bucana 76-A", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk($"Sandawa Matina Davao City", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk($"Davao City, Philippines", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                logotitle.Add(Chunk.NEWLINE);
                logotitle.Add(new Chunk($"Contact No.: (082) 224 1362", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                logotitle.Add(Chunk.NEWLINE);
                //Image logo = Image.GetInstance(logoBytes);
                //logo.Alignment = Element.ALIGN_CENTER;
                //logo.ScaleAbsolute(50f, 50f); // Adjust dimensions as needed
                //doc.Add(logo);
                doc.Add(logotitle);
                //}

                // Add title
                Paragraph title = new Paragraph();
                title.Alignment = Element.ALIGN_LEFT;
                title.Add(Chunk.NEWLINE);
                title.Add(new Chunk($"Customer", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                title.Add(Chunk.NEWLINE);
                title.Add(new Chunk($"Name: {customer.name} ", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                title.Add(Chunk.NEWLINE);
                title.Add(new Chunk($"Address: {customer.address} ", FontFactory.GetFont(FontFactory.HELVETICA, 12)));
                title.Add(Chunk.NEWLINE);
                title.Add(new Chunk($"Contact No.: {customer.contactno} ", FontFactory.GetFont(FontFactory.HELVETICA, 12)));

                title.Add(Chunk.NEWLINE);
                doc.Add(title);
                Paragraph quote_date = new Paragraph();
                quote_date.Alignment = Element.ALIGN_LEFT;
                quote_date.Add(Chunk.NEWLINE);
                quote_date.Add(new Chunk($"Quote ID: {customer.orderid}", FontFactory.GetFont(FontFactory.HELVETICA, 12)));

                quote_date.Add(Chunk.NEWLINE);
                quote_date.Add(new Chunk($"Quote Date: {quoted_date.ToString("MM/dd/yyyy")}", FontFactory.GetFont(FontFactory.HELVETICA, 12)));

                quote_date.Add(Chunk.NEWLINE);
                quote_date.Add(Chunk.NEWLINE);
                doc.Add(quote_date);
                // Add table
                PdfPTable table = new PdfPTable(5);
                PdfPCell cell = new PdfPCell();
                table.WidthPercentage = 100;
                table.SetWidths(new float[] { 1, 3, 1, 2, 2});
                table.SpacingBefore = 20f;

                table.AddCell(new PdfPCell(new Phrase("Code", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                table.AddCell(new PdfPCell(new Phrase("Item", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                table.AddCell(new PdfPCell(new Phrase("Qty", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                table.AddCell(new PdfPCell(new Phrase("Price", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                table.AddCell(new PdfPCell(new Phrase("Total", FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                // Add table data
                decimal totalSales = 0;
                foreach (var order in orders)
                {
                    var total = order.qty * order.price;
                    table.AddCell(new PdfPCell(new Phrase(order.code, FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                    table.AddCell(new PdfPCell(new Phrase(order.item, FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                    table.AddCell(new PdfPCell(new Phrase(order.qty.ToString(), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                    table.AddCell(new PdfPCell(new Phrase(Decimal.Parse(order.price.ToString()).ToString("N2"), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                    table.AddCell(new PdfPCell(new Phrase(Decimal.Parse(total.ToString()).ToString("N2"), FontFactory.GetFont(FontFactory.HELVETICA, 12))) { HorizontalAlignment = Element.ALIGN_CENTER });
                    totalSales = Decimal.Parse(customer.total.ToString());
                }

                // Add total row
                //PdfPCell totalCell = new PdfPCell(new Phrase("Overall Total", FontFactory.GetFont(FontFactory.HELVETICA_BOLD, 12)));
                //totalCell.Colspan = 3;
                //totalCell.HorizontalAlignment = Element.ALIGN_RIGHT;
                //table.AddCell(totalCell);
                //table.AddCell(totalSales.ToString("N2")); // Format Total Sales as currency
                doc.Add(table);
                Paragraph Total = new Paragraph();
                Total.Alignment = Element.ALIGN_RIGHT;
                Total.Add(Chunk.NEWLINE);
                Total.Add(new Chunk($"Overall Total {totalSales.ToString("N2")}", FontFactory.GetFont(FontFactory.HELVETICA, 18,iTextSharp.text.Font.BOLD)));
                doc.Add(Total);

                Paragraph Terms = new Paragraph();
                Terms.Alignment = Element.ALIGN_LEFT;
                Terms.Add(Chunk.NEWLINE);
                Terms.Add(new Chunk($"Disclaimer:", FontFactory.GetFont(FontFactory.HELVETICA, 12)));

                Terms.Add(Chunk.NEWLINE);
                Terms.Add(new Chunk($"*Kindly note that prices and quantities are subject to change.", FontFactory.GetFont(FontFactory.HELVETICA, 12)));

                Terms.Add(Chunk.NEWLINE);
                Terms.Add(Chunk.NEWLINE);
                doc.Add(Terms);
                doc.Close();

                return ms.ToArray();
            }
        }

        private string LoadCompanyLogoAsBase64()
        {
            string imagePath = Path.Combine("Resources", "Assets", "Icon@3.png");
            byte[] logoBytes = File.ReadAllBytes(imagePath);
            string base64String = Convert.ToBase64String(logoBytes);
            return base64String;
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
