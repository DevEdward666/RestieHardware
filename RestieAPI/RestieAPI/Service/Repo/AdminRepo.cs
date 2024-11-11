using Microsoft.AspNetCore.Mvc;
using Npgsql;
using RestieAPI.Configs;
using RestieAPI.Models.Request;
using RestieAPI.Models.Response;
using static RestieAPI.Models.Request.AdminRequestModel;
using static RestieAPI.Models.Response.AdminResponseModel;
using OfficeOpenXml;
using static RestieAPI.Models.Request.InventoryRequestModel;
using MailKit.Search;
using System.Data;
using System;
namespace RestieAPI.Service.Repo
{
    public class AdminRepo
    {
        public IConfiguration configuration;
        private readonly DatabaseService _databaseService;
        private readonly string _connectionString;
        public AdminRepo(IConfiguration configuration)
        {
            this.configuration = configuration;
            _databaseService = new DatabaseService(configuration);
            _connectionString = configuration.GetConnectionString("MyDatabase");
        }

        public InventoryItemModel searchInventory(InventoryRequestModel.GetAllInventory getAllInventory)
        {
            var sql = "";
                sql = @"SELECT * FROM Inventory 
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
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new InventoryItemModel
                        {
                            message = ex.Message,
                            result = [],
                            success = false,
                            statusCode = 500
                        };
                        throw;
                    }
                }
            }
        }

        public SupplierResponseModel searchSupplier(AdminRequestModel.GetAllSupplier getAllSupplier)
        {
            var sql = @"SELECT * FROM supplier 
                        WHERE LOWER(company) LIKE CONCAT('%', LOWER(@searchTerm), '%') OR 
                              LOWER(address) LIKE CONCAT('%', LOWER(@searchTerm), '%') 
                        ORDER BY company 
                        LIMIT @limit;";

            var parameters = new Dictionary<string, object>
            {
                { "@limit", getAllSupplier.limit },
                { "@searchTerm", getAllSupplier.searchTerm }
            };


            var results = new List<Suppliers>();

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
                                    var inventoryItem = new Suppliers
                                    {
                                        supplierid = reader.GetString(reader.GetOrdinal("supplierid")),
                                        company = reader.GetString(reader.GetOrdinal("company")),
                                        contactno = reader.GetString(reader.GetOrdinal("contactno")),
                                        address = reader.GetString(reader.GetOrdinal("address")),
                                    };

                                    results.Add(inventoryItem);
                                }
                            }
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new SupplierResponseModel
                        {
                            result = results,
                            success = true,
                            statusCode = 200
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new SupplierResponseModel
                        {
                            result = [],
                            message = ex.Message,
                            success = false,
                            statusCode = 500
                        };
                        throw;
                    }
                }
            }
        }
        public AdminVoucherResponseModel searchVoucher(AdminRequestModel.GetAllVoucher getAllVoucher)
        {
            var sql = @"SELECT * FROM vouchers 
                        WHERE LOWER(vouchercode) LIKE CONCAT('%', LOWER(@searchTerm), '%') OR 
                              LOWER(name) LIKE CONCAT('%', LOWER(@searchTerm), '%') 
                        ORDER BY vouchercode 
                        LIMIT @limit;";

            var parameters = new Dictionary<string, object>
            {
                { "@limit", getAllVoucher.limit },
                { "@searchTerm", getAllVoucher.searchTerm }
            };


            var results = new List<Vouchers>();

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
                                    var inventoryItem = new Vouchers
                                    {
                                        voucher_seq = reader.GetInt16(reader.GetOrdinal("voucher_seq")),
                                        vouchercode = reader.GetString(reader.GetOrdinal("vouchercode")),
                                        name = reader.GetString(reader.GetOrdinal("name")),
                                        description = reader.GetString(reader.GetOrdinal("description")),
                                        maxredemption = reader.GetInt64(reader.GetOrdinal("maxredemption")),
                                        type = reader.GetString(reader.GetOrdinal("type")),
                                        voucher_for = reader.GetString(reader.GetOrdinal("voucher_for")),
                                        discount = reader.GetFloat(reader.GetOrdinal("discount")),
                                    };

                                    results.Add(inventoryItem);
                                }
                            }
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new AdminVoucherResponseModel
                        {
                            result = results,
                            success = true,
                            statusCode = 200
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new AdminVoucherResponseModel
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
        public AdminUsersResponseModel searchUser(AdminRequestModel.GetAllUser getAllUser)
        {
            var sql = @"SELECT * FROM useraccount 
                        WHERE LOWER(name) LIKE CONCAT('%', LOWER(@searchTerm), '%') OR 
                              LOWER(username) LIKE CONCAT('%', LOWER(@searchTerm), '%') 
                        ORDER BY name 
                        LIMIT @limit;";

            var parameters = new Dictionary<string, object>
            {
                { "@limit", getAllUser.limit },
                { "@searchTerm", getAllUser.searchTerm }
            };


            var results = new List<Users>();

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
                                    var inventoryItem = new Users
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
                        return new AdminUsersResponseModel
                        {
                            result = results,
                            success = true,
                            statusCode = 200
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new AdminUsersResponseModel
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
        public PostInventoryAddResponse PostInventory(InventoryRequestModel.PostInventoryItems postInventory)
        {   
            var sql = @"insert into inventorylogs (logid,code,onhandqty,addedqty,supplierid,cost,price,createdat) values(@logid,@code,@onhandqty,@addedqty,@supplierid,@cost,@price,@createdat)";
           
            var updatesql = @"update  inventory set category=@category,brand=@brand,item=@item, qty=@onhandqty + @addedqty,cost=@cost,price=@price,updatedat=@updatedat where code=@code";
            var logid = Guid.NewGuid().ToString();
            var parameters = new Dictionary<string, object>
            {
                { "@logid", logid },
                { "@category", postInventory.category },
                { "@brand", postInventory.brand },
                { "@item", postInventory.item },
                { "@code", postInventory.code },
                { "@onhandqty", postInventory.onhandqty },
                { "@addedqty", postInventory.addedqty },
                { "@supplierid", postInventory.supplierid },
                { "@cost", postInventory.cost },
                { "@price", postInventory.price },
                { "@createdat", postInventory.createdat },
                { "@updatedat", postInventory.updatedat },
            };

            var results = new List<InventoryItems>();
            var insert = 0;
            var update = 0;
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                       if(postInventory.addedqty != 0)
                        {
                            using (var cmd = new NpgsqlCommand(sql, connection))
                            {
                                foreach (var param in parameters)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }

                                insert = cmd.ExecuteNonQuery();
                            }
                        }
                   
                        using (var cmd = new NpgsqlCommand(updatesql, connection))
                        {
                            foreach (var param in parameters)
                            {
                                cmd.Parameters.AddWithValue(param.Key, param.Value);
                            }
                                var updateparameters = new Dictionary<string, object>
                                 {
                                    { "@code", postInventory.code },
                                    { "@item", postInventory.item },
                                    { "@supplierid", postInventory.supplierid },
                                    { "@category", postInventory.category },
                                    { "@brand", postInventory.brand },
                                    { "@onhandqty", postInventory.onhandqty },
                                    { "@addedqty", postInventory.addedqty },
                                    { "@cost", postInventory.cost },
                                    { "@price", postInventory.price },
                                    { "@createdat", postInventory.createdat },
                                };
                                update = cmd.ExecuteNonQuery();
                        }


                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new PostInventoryAddResponse
                        {
                            message = "Successfully added",
                            status = 200
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new PostInventoryAddResponse
                        {
                            status = 500,
                            message = ex.Message
                        };
                        throw;
                    }
                }
            }


        }
        public PostInventoryAddResponse PostMultipleInventory(InventoryRequestModel.PostInventory postInventory)
        {
            var sql = @"INSERT INTO inventorylogs (logid, code, onhandqty, addedqty, supplierid, cost, price, createdat) 
                VALUES (@logid, @code, @onhandqty, @addedqty, @supplierid, @cost, @price, @createdat)";

            var updatesql = @"UPDATE inventory 
                      SET category = @category, brand = @brand, item = @item, qty = qty + @addedqty, 
                          cost = @cost, price = @price, updatedat = @updatedat 
                      WHERE code = @code";

            var logid = Guid.NewGuid().ToString();
            var results = new List<InventoryItems>();
            DateTime dateTime = DateTime.UtcNow;
            long unixTimestampMilliseconds = (long)(dateTime.ToUniversalTime() -
            new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).TotalMilliseconds;
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();
                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        foreach (var item in postInventory.items)
                        {
                            var parameters = new Dictionary<string, object>
                    {
                        { "@logid", logid },
                        { "@code", item.code },
                        { "@onhandqty", item.onhandqty },
                        { "@addedqty", item.addedqty },
                        { "@supplierid", postInventory.supplierId },
                        { "@cost", item.cost },
                        { "@price", item.price },
                        { "@createdat", unixTimestampMilliseconds }, 
                        { "@updatedat",unixTimestampMilliseconds }, 
                        { "@category", item.category },
                        { "@brand", item.brand },
                        { "@item", item.item }
                    };

                            using (var cmd = new NpgsqlCommand(sql, connection))
                            {
                                foreach (var param in parameters)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                                cmd.ExecuteNonQuery();
                            }

                            // Update the inventory
                            using (var cmd = new NpgsqlCommand(updatesql, connection))
                            {
                                foreach (var param in parameters)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }
                                cmd.ExecuteNonQuery();
                            }
                        }

                        // Commit the transaction
                        tran.Commit();
                        return new PostInventoryAddResponse
                        {
                            message = "Successfully added",
                            status = 200
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new PostInventoryAddResponse
                        {
                            status = 500,
                            message = ex.Message
                        };
                    }
                }
            }
        }

        public PostInventoryAddResponse PostNewItemInventory(InventoryRequestModel.PostNewItemInventory postNewItem)
        {   
            var sql = @"insert into inventory (code,item,qty,category,brand,cost,price,createdat,status,image,updatedat,reorderqty) 
                        values(@code,@item,@onhandqty,@category,@brand,@cost,@price,@createdat,@status,@image,@updatedat,0)";
            var logsSql = @"insert into inventorylogs (logid,code,onhandqty,addedqty,supplierid,cost,price,createdat) values(@logid,@code,@onhandqty,@addedqty,@supplierid,@cost,@price,@createdat)";
            var logid = Guid.NewGuid().ToString();

            var results = new List<InventoryItems>();
            var insert = 0;
            var insertLogs = 0;
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        using (var cmd = new NpgsqlCommand(sql, connection))
                        {
                            var parameters = new Dictionary<string, object>
                            {
                                { "@code", postNewItem.code },
                                { "@item", postNewItem.item },
                                { "@onhandqty", postNewItem.onhandqty },
                                { "@category", postNewItem.category },
                                { "@brand", postNewItem.brand },
                                { "@image", postNewItem.image },
                                { "@cost", postNewItem.cost },
                                { "@price", postNewItem.price },
                                { "@createdat", postNewItem.createdat },
                                { "@status", postNewItem.status },
                                { "@updatedat", postNewItem.updatedat },
                                { "@supplierid", postNewItem.supplierid },
                            };

                            foreach (var param in parameters)
                            {
                                cmd.Parameters.AddWithValue(param.Key, param.Value);
                            }

                            insert = cmd.ExecuteNonQuery();
                        }
                        if (insert > 0)
                        {
                            using (var cmd = new NpgsqlCommand(logsSql, connection))
                            {
                                var logsParameters = new Dictionary<string, object>
                                {
                                    { "@logid", logid },
                                    { "@code", postNewItem.code },
                                    { "@onhandqty", postNewItem.onhandqty },
                                    { "@addedqty", postNewItem.addedqty },
                                    { "@supplierid", postNewItem.supplierid },
                                    { "@cost", postNewItem.cost },
                                    { "@price", postNewItem.price },
                                    { "@createdat", postNewItem.createdat },
                                };
                                foreach (var param in logsParameters)
                                {
                                    cmd.Parameters.AddWithValue(param.Key, param.Value);
                                }

                                insertLogs = cmd.ExecuteNonQuery();
                            }
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new PostInventoryAddResponse
                        {
                            message = "Successfully added",
                            status = 200
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new PostInventoryAddResponse
                        {
                            status = 500,
                            message = ex.Message
                        };
                        throw;
                    }
                }
            }


        }
        public PostInventoryAddResponse PostNewSupplier(InventoryRequestModel.PostNewSupplier postNewSupplier)
        {
            var sql = @"insert into supplier (supplierid,company,contactno,address,createdat) 
                        values(@supplierid,@company,@contactno,@address,@createdat)";
             var supplierId = Guid.NewGuid().ToString();

            var results = new List<InventoryItems>();
            var insert = 0;
            var insertLogs = 0;
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        using (var cmd = new NpgsqlCommand(sql, connection))
                        {
                            var parameters = new Dictionary<string, object>
                            {
                                { "@supplierid", supplierId },
                                { "@company", postNewSupplier.company },
                                { "@contactno", postNewSupplier.contactno },
                                { "@address", postNewSupplier.address },
                                { "@createdat", postNewSupplier.createdat },
                            };

                            foreach (var param in parameters)
                            {
                                cmd.Parameters.AddWithValue(param.Key, param.Value);
                            }

                            insert = cmd.ExecuteNonQuery();
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new PostInventoryAddResponse
                        {
                            message = "Successfully added",
                            status = 200
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new PostInventoryAddResponse
                        {
                            status = 500,
                            message = ex.Message
                        };
                        throw;
                    }
                }
            }
        }

        public PostInventoryAddResponse PutSupplier(InventoryRequestModel.PutSupplier putSupplier)
        {
            var updatesql = @"update  supplier set company=@company,contactno=@contactno,
                            address=@address where supplierid = @supplierid";

            var results = new List<InventoryItems>();
            var update = 0;
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        using (var cmd = new NpgsqlCommand(updatesql, connection))
                        {
                            var parameters = new Dictionary<string, object>
                            {
                                { "@supplierid", putSupplier.supplierid },
                                { "@company", putSupplier.company },
                                { "@contactno", putSupplier.contactno },
                                { "@address", putSupplier.address },
                            };

                            foreach (var param in parameters)
                            {
                                cmd.Parameters.AddWithValue(param.Key, param.Value);
                            }

                            update = cmd.ExecuteNonQuery();
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new PostInventoryAddResponse
                        {
                            message = "Successfully added",
                            status = 200
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new PostInventoryAddResponse
                        {
                            status = 500,
                            message = ex.Message
                        };
                        throw;
                    }
                }
            }
        }
        public PostInventoryAddResponse AddNewVoucher(PostVouchers postVouchers)
        {
            var sql = @"insert into vouchers (voucher_seq,vouchercode,name,description,maxredemption,discount,type,voucher_for,createdat,createdby) 
                        values(nextval('voucher_seq_seq'), @vouchercode,@name,@description,@maxredemption,@discount,@type,@voucher_for,@createdat,@createdby)";

            var results = new List<PostVouchers>();
            var insert = 0;
            DateTime dateTime = DateTime.UtcNow;
            long unixTimestampMilliseconds = (long)(dateTime.ToUniversalTime() -
            new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).TotalMilliseconds;
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        using (var cmd = new NpgsqlCommand(sql, connection))
                        {
                            var parameters = new Dictionary<string, object>
                            {
                                { "@vouchercode", postVouchers.vouchercode },
                                { "@name", postVouchers.name },
                                { "@description", postVouchers.description },
                                { "@maxredemption", 999 },
                                { "@discount", postVouchers.discount },
                                { "@type", postVouchers.type },
                                { "@voucher_for", postVouchers.voucher_for },
                                { "@createdat", unixTimestampMilliseconds },
                                { "@createdby", postVouchers.createdby },
                            };

                            foreach (var param in parameters)
                            {
                                cmd.Parameters.AddWithValue(param.Key, param.Value);
                            }

                            insert = cmd.ExecuteNonQuery();
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new PostInventoryAddResponse
                        {
                            message = "Successfully added",
                            status = 200
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new PostInventoryAddResponse
                        {
                            status = 500,
                            message = ex.Message
                        };
                        throw;
                    }
                }
            }
        }
        public PostInventoryAddResponse PutVoucher(PostVouchers postVouchers)
        {
            var updatesql = @"update  vouchers set vouchercode=@vouchercode,name=@name,
                            description=@description,discount=@discount,type=@type,voucher_for=@voucher_for where voucher_seq = @voucher_seq";

            var results = new List<InventoryItems>();
            var update = 0;
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using (var tran = connection.BeginTransaction())
                {
                    try
                    {
                        using (var cmd = new NpgsqlCommand(updatesql, connection))
                        {
                            var parameters = new Dictionary<string, object>
                            {
                                { "@voucher_seq", postVouchers.voucher_seq },
                                { "@vouchercode", postVouchers.vouchercode },
                                { "@name", postVouchers.name },
                                { "@description", postVouchers.description },
                                { "@discount", postVouchers.discount },
                                { "@type", postVouchers.type },
                                { "@voucher_for", postVouchers.voucher_for },
                            };

                            foreach (var param in parameters)
                            {
                                cmd.Parameters.AddWithValue(param.Key, param.Value);
                            }

                            update = cmd.ExecuteNonQuery();
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new PostInventoryAddResponse
                        {
                            message = "Successfully updated",
                            status = 200
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new PostInventoryAddResponse
                        {
                            status = 500,
                            message = ex.Message
                        };
                        throw;
                    }
                }
            }
        }
        public PostInventoryAddResponse ImportDataFromExcel(IFormFile forExcel)
        {
            //FileInfo file = new FileInfo(forExcel);
            using (var stream = new MemoryStream())
            {
                forExcel.CopyTo(stream);
                using (ExcelPackage package = new ExcelPackage(stream))
                {
                    ExcelWorksheet worksheet = package.Workbook.Worksheets.FirstOrDefault();
                    if (worksheet == null)
                    {
                        throw new Exception("No worksheet found in Excel file.");
                    }

                    List<ImportOrderFromExcel> orderEntities = new List<ImportOrderFromExcel>();

                    for (int row = 3; row <= 3; row++) // Assuming first row is header
                    {
                        ImportOrderFromExcel entity = new ImportOrderFromExcel
                        {
                            orderid = worksheet.Cells[row, 1].Value.ToString(),
                            cartid = worksheet.Cells[row, 2].Value.ToString(),
                            total = Convert.ToInt64(worksheet.Cells[row, 3].Value),
                            paidthru = worksheet.Cells[row, 4].Value.ToString(),
                            paidcash = Convert.ToInt64(worksheet.Cells[row, 5].Value),
                            createdby = worksheet.Cells[row, 6].Value.ToString(),
                            status = worksheet.Cells[row, 7].Value.ToString(),
                            userid = worksheet.Cells[row, 8].Value.ToString(),
                            type = worksheet.Cells[row, 9].Value.ToString(),
                           
                           
                        };

                        orderEntities.Add(entity);
                    }
                    int cartRowCount = worksheet.Dimension.Rows;
                    List<ImportCartFromExcel> cartEntities = new List<ImportCartFromExcel>();

                    int rowCount = worksheet.Dimension.Rows;
                    for (int row = 7; row <= rowCount; row++) // Assuming first row is header
                    {
                        ImportCartFromExcel entity = new ImportCartFromExcel();

                        // Assuming cartid, code, item, and status cannot be null
                        entity.cartid = (worksheet.Cells[row, 1].Value ?? string.Empty).ToString();
                        entity.code = (worksheet.Cells[row, 2].Value ?? string.Empty).ToString();
                        entity.item = (worksheet.Cells[row, 3].Value ?? string.Empty).ToString();
                        entity.status = (worksheet.Cells[row, 7].Value ?? string.Empty).ToString();

                        // Handle nullable columns (qty, price, total)
                        if (worksheet.Cells[row, 4].Value != null && !string.IsNullOrWhiteSpace(worksheet.Cells[row, 4].Value.ToString()))
                        {
                            if (short.TryParse(worksheet.Cells[row, 4].Value.ToString(), out short qtyValue))
                            {
                                entity.qty = qtyValue;
                            }
                            else
                            {
                                // Handle invalid format for qty
                                entity.qty = 0; // or any other default value or error handling logic
                            }
                        }
                        else
                        {
                            // Handle null or empty value for qty
                            entity.qty = 0; // or any other default value
                        }

                        if (worksheet.Cells[row, 5].Value != null && !string.IsNullOrWhiteSpace(worksheet.Cells[row, 5].Value.ToString()))
                        {
                            if (long.TryParse(worksheet.Cells[row, 5].Value.ToString(), out long priceValue))
                            {
                                entity.price = priceValue;
                            }
                            else
                            {
                                // Handle invalid format for price
                                entity.price = 0; // or any other default value or error handling logic
                            }
                        }
                        else
                        {
                            // Handle null or empty value for price
                            entity.price = 0; // or any other default value
                        }

                        if (worksheet.Cells[row, 6].Value != null && !string.IsNullOrWhiteSpace(worksheet.Cells[row, 6].Value.ToString()))
                        {
                            if (long.TryParse(worksheet.Cells[row, 6].Value.ToString(), out long totalValue))
                            {
                                entity.total = totalValue;
                            }
                            else
                            {
                                // Handle invalid format for total
                                entity.total = 0; // or any other default value or error handling logic
                            }
                        }
                        else
                        {
                            // Handle null or empty value for total
                            entity.total = 0; // or any other default value
                        }

                        cartEntities.Add(entity);
                    }
                    DateTime dateTime = DateTime.UtcNow; // Use DateTime.Now for local time

                    // Convert DateTime to Unix timestamp (milliseconds)
                    long unixTimestampMilliseconds = (long)(dateTime.ToUniversalTime() -
                        new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).TotalMilliseconds;
                    var sql = @"insert into orders (orderid,cartid,total,paidthru,paidcash,createdby,createdat,updateat,status,userid,type) 
                        values(@orderid,@cartid,@total,@paidthru,@paidcash,@createdby,@createdat,@updateat,@status,@userid,@type)";
                    var cartsql = @"insert into cart (cartid,code,item,qty,price,total,createdat,status) 
                                    values(@cartid,@code,@item,@qty,@price,@total,@createdat,@status)";
                    var updatesql = @"update  inventory set qty=@onhandqty where code=@code";
                    var InsertTransaction = @"insert into transaction (transid,orderid,customer,cashier,status,createdat) 
                                    values(@transid,@orderid,@customer,@cashier,@status,@createdat)";
                    using (var connection = new NpgsqlConnection(_connectionString))
                    {
                        connection.Open();
                        var transid = Guid.NewGuid().ToString();
                        using (var transaction = connection.BeginTransaction())
                        {
                            try
                            {
                                foreach (var item in orderEntities)
                                {
                                    using (var cmd = new NpgsqlCommand(sql, connection))
                                    {
                                        cmd.Parameters.AddWithValue("@orderid", item.orderid);
                                        cmd.Parameters.AddWithValue("@cartid", item.cartid);
                                        cmd.Parameters.AddWithValue("@total", item.total);
                                        cmd.Parameters.AddWithValue("@paidthru", item.paidthru);
                                        cmd.Parameters.AddWithValue("@paidcash", item.paidcash);
                                        cmd.Parameters.AddWithValue("@status", item.status);
                                        cmd.Parameters.AddWithValue("@type", item.type);
                                        cmd.Parameters.AddWithValue("@userid", item.userid);
                                        cmd.Parameters.AddWithValue("@createdat", unixTimestampMilliseconds);
                                        cmd.Parameters.AddWithValue("@createdby", item.createdby);
                                        cmd.Parameters.AddWithValue("@updateat", 0);

                                        cmd.ExecuteNonQuery();
                                    }
                                }

                                foreach (var item in orderEntities)
                                {
                                    using (var cmd = new NpgsqlCommand(InsertTransaction, connection))
                                    {
                                        cmd.Parameters.AddWithValue("@transid", transid);
                                        cmd.Parameters.AddWithValue("@orderid", item.orderid);
                                        cmd.Parameters.AddWithValue("@customer", "automate");
                                        cmd.Parameters.AddWithValue("@cashier", "automate");
                                        cmd.Parameters.AddWithValue("@status", item.status);
                                        cmd.Parameters.AddWithValue("@createdat", unixTimestampMilliseconds);

                                        cmd.ExecuteNonQuery();
                                    }
                                }  
                                foreach (var item in cartEntities)
                                {
                                    using (var cmd = new NpgsqlCommand(cartsql, connection))
                                    {
                                        cmd.Parameters.AddWithValue("@cartid", item.cartid);
                                        cmd.Parameters.AddWithValue("@code", item.code);
                                        cmd.Parameters.AddWithValue("@item", item.item);
                                        cmd.Parameters.AddWithValue("@qty", item.qty);
                                        cmd.Parameters.AddWithValue("@price", item.price);
                                        cmd.Parameters.AddWithValue("@total", item.total);
                                        cmd.Parameters.AddWithValue("@createdat", unixTimestampMilliseconds);
                                        cmd.Parameters.AddWithValue("@status", item.status);

                                        cmd.ExecuteNonQuery();
                                    }
                                }
                                foreach (var item in cartEntities)
                                {
                                    
                                    var onhandqty = getInventoryQty(item.code);
                                   
                                    // Execute the updatesql command for each item
                                    using (var cmd = new NpgsqlCommand(updatesql, connection))
                                    {
                                        var updateparameters = new Dictionary<string, object>
                                        {
                                            { "@onhandqty",onhandqty.qty - item.qty },
                                            { "@code", item.code },
                                        };
                                        foreach (var param in updateparameters)
                                        {
                                            cmd.Parameters.AddWithValue(param.Key, param.Value);
                                        }
                                        cmd.ExecuteNonQuery();
                                    }
                                }
                                transaction.Commit();

                                return new PostInventoryAddResponse
                                {
                                    message = "Successfully added",
                                    status = 200
                                };
                            }
                            catch (Exception ex)
                            {
                                transaction.Rollback();
                                return new PostInventoryAddResponse
                                {
                                    status = 500,
                                    message = ex.Message
                                };
                            }
                        }
                    }
                }
            }
             
        }
        public QTYResponse  getInventoryQty(string code)
        {
            var sql = @"select qty from inventory where code=@code";

            var parameters = new Dictionary<string, object>
            {
                { "@code", code },
            };


            var results = new QTYResponse();
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
                                    var orderResponse = new QTYResponse
                                    {
                                        qty = reader.GetInt32(reader.GetOrdinal("qty")),
                                    };
                                    results.qty = orderResponse.qty;

                                }
                            }
                        }

                        // Commit the transaction after the reader has been fully processed
                        tran.Commit();
                        return new QTYResponse
                        {
                            qty = results.qty,
                            success = true,
                        };
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        return new QTYResponse
                        {
                            qty = 0,
                            success = false,
                        };
                        throw;
                    }
                }
            }


        }

    }
}
