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
using System.Text;
using System.Text.RegularExpressions;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;
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
                        if (postInventory.addedqty != 0)
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
                        values(nextval('voucher_sequence'), @vouchercode,@name,@description,@maxredemption,@discount,@type,@voucher_for,@createdat,@createdby)";

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
        public QTYResponse getInventoryQty(string code)
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

        // Import POS Transaction Log from another POS system.
        // Parses Sale rows → inserts into orders / cart / transaction tables + deducts inventory qty.
        // Columns: A=Date, B=Time, C=Ref#, D=ItemCode, E=Description, F=Qty, G=Price, H=Amount, I=Type, J=Customer, K=Cashier
        public async Task<POSImportResult> ImportPOSLog(IFormFile file)
        {
            int ordersInserted = 0;
            int itemsProcessed = 0;
            int inventoryUpdated = 0;
            int skipped = 0;
            var errors = new List<string>();
            long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            try
            {
                // ── 1. Extract all text from PDF ──────────────────────────────────────────
                using var stream = new MemoryStream();
                await file.CopyToAsync(stream);
                stream.Position = 0;

                var sb = new StringBuilder();
                using (var pdfReader = new PdfReader(stream))
                using (var pdfDoc = new PdfDocument(pdfReader))
                {
                    for (int p = 1; p <= pdfDoc.GetNumberOfPages(); p++)
                    {
                        string pageText = PdfTextExtractor.GetTextFromPage(
                            pdfDoc.GetPage(p),
                            new LocationTextExtractionStrategy());
                        sb.AppendLine(pageText);
                    }
                }

                // ── 2. Parse lines ────────────────────────────────────────────────────────
                // iText7 LocationTextExtractionStrategy splits each POS row into TWO physical lines:
                //  Line A: date time refNo itemCode description  amount  type  customer+cashier
                //  Line B: qty  price  balance
                //
                // After joining A+B the full line looks like:
                //   07/03/2024 12:02 PM 0008434 000500 Wall Clip 0.4 350.00 Sale DREAM BOLT... 100 3.50 2,850.00
                //
                // Joined pattern groups:
                //   G1=date G2=time G3=refNo G4=itemCode G5=description
                //   G6=amount G7=type("Sale") G8=customer+cashier G9=qty G10=price G11=balance

                // Pattern for the "continuation" line B: one or more numbers (qty price balance)
                var continuationPat = new Regex(@"^-?[\d,]+(?:\.\d+)?(?:\s+-?[\d,]+(?:\.\d+)?)*\s*$");

                // Full joined-line Sale pattern
                var salePattern = new Regex(
                    @"^(\d{2}/\d{2}/\d{4})\s+" +           // G1 date
                    @"(\d{1,2}:\d{2}\s+[AP]M)\s+" +        // G2 time
                    @"(\d{7})\s+" +                          // G3 refNo
                    @"(\d{6})\s+" +                          // G4 itemCode
                    @"(.+?)\s+" +                            // G5 description (non-greedy)
                    @"(\d[\d,]*(?:\.\d+)?)\s+" +            // G6 amount
                    @"Sale\s+" +                             // type literal
                    @"(.+?)\s+" +                            // G7 customer+cashier (merged)
                    @"(\d[\d,]*(?:\.\d+)?)\s+" +            // G8 qty  (from continuation line)
                    @"(\d[\d,]*(?:\.\d+)?)\s+" +            // G9 price (from continuation line)
                    @"([\d,]+\.\d+)\s*$",                   // G10 balance
                    RegexOptions.IgnoreCase);

                var saleGroups = new Dictionary<string, List<(string code, string item, int qty, double price, double amount, string customer, string cashier, long createdAt)>>();

                // Join line-A and line-B pairs before processing
                var rawLines = sb.ToString().Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
                var joinedLines = new List<string>();
                for (int i = 0; i < rawLines.Length; i++)
                {
                    string cur = rawLines[i].Trim();
                    if (string.IsNullOrWhiteSpace(cur)) continue;

                    // If next line is a pure-numbers continuation, merge it
                    if (i + 1 < rawLines.Length)
                    {
                        string next = rawLines[i + 1].Trim();
                        if (continuationPat.IsMatch(next))
                        {
                            joinedLines.Add(cur + " " + next);
                            i++; // skip continuation line
                            continue;
                        }
                    }
                    joinedLines.Add(cur);
                }

                foreach (var line in joinedLines)
                {
                    if (!Regex.IsMatch(line, @"^\d{2}/\d{2}/\d{4}")) continue;
                    if (!line.Contains("Sale", StringComparison.OrdinalIgnoreCase)) { skipped++; continue; }

                    var m = salePattern.Match(line);
                    if (!m.Success) { skipped++; continue; }

                    string refNo = m.Groups[3].Value.Trim();
                    string code = m.Groups[4].Value.Trim();
                    string desc = m.Groups[5].Value.Trim();
                    string customer = m.Groups[7].Value.Trim();
                    string cashier = string.Empty;

                    double.TryParse(m.Groups[8].Value.Replace(",", ""), out double qty);
                    double.TryParse(m.Groups[9].Value.Replace(",", ""), out double price);
                    double.TryParse(m.Groups[6].Value.Replace(",", ""), out double amount);

                    long rowTs = now;
                    if (DateTime.TryParse($"{m.Groups[1].Value} {m.Groups[2].Value}", out DateTime parsedDt))
                        rowTs = new DateTimeOffset(parsedDt, TimeSpan.Zero).ToUnixTimeMilliseconds();

                    if (!saleGroups.ContainsKey(refNo))
                        saleGroups[refNo] = new List<(string, string, int, double, double, string, string, long)>();

                    saleGroups[refNo].Add((code, desc, (int)qty, price, amount, customer, cashier, rowTs));
                }

                if (saleGroups.Count == 0)
                    return new POSImportResult { success = true, message = "No Sale rows found in PDF.", errors = errors };

                // ── 3. Insert into DB ─────────────────────────────────────────────────────
                using var con = new NpgsqlConnection(_connectionString);
                await con.OpenAsync();
                using var tran = await con.BeginTransactionAsync();

                // Regex to validate a 6-digit numeric item code
                var validCodePat = new Regex(@"^\d{6}$");

                try
                {
                    foreach (var kvp in saleGroups)
                    {
                        string posRefNo = kvp.Key;   // original PDF Ref# — used only for idempotency
                        var lines = kvp.Value;

                        // Filter to only items with a valid 6-digit numeric code
                        var validLines = lines.Where(l => validCodePat.IsMatch(l.code)).ToList();
                        if (validLines.Count == 0) { skipped += lines.Count; continue; }

                        // Idempotency — skip if this PDF Ref# was already imported (stored in userid field)
                        int existCount = 0;
                        using (var chk = new NpgsqlCommand(
                            "SELECT COUNT(1) FROM orders WHERE userid = @posref", con, tran))
                        {
                            chk.Parameters.AddWithValue("posref", $"pos:{posRefNo}");
                            existCount = Convert.ToInt32(await chk.ExecuteScalarAsync());
                        }
                        if (existCount > 0) { skipped += lines.Count; continue; }

                        // Generate brand-new IDs — never use the PDF Ref# as PK
                        string newOrderId = Guid.NewGuid().ToString("N");
                        string cartId = Guid.NewGuid().ToString("N");
                        string transId = Guid.NewGuid().ToString("N");

                        double total = validLines.Sum(l => l.amount);
                        string customer = validLines[0].customer;
                        string cashier = validLines[0].cashier;
                        long createdAt = validLines[0].createdAt;

                        using (var cmd = new NpgsqlCommand(
                            @"INSERT INTO orders (orderid,cartid,total,paidthru,paidcash,createdby,createdat,updateat,status,userid,type)
                              VALUES (@orderid,@cartid,@total,@paidthru,@paidcash,@createdby,@createdat,@updateat,@status,@userid,@type)", con, tran))
                        {
                            cmd.Parameters.AddWithValue("orderid", newOrderId);
                            cmd.Parameters.AddWithValue("cartid", cartId);
                            cmd.Parameters.AddWithValue("total", (long)total);
                            cmd.Parameters.AddWithValue("paidthru", "Cash");
                            cmd.Parameters.AddWithValue("paidcash", (long)total);
                            cmd.Parameters.AddWithValue("createdby", cashier);
                            cmd.Parameters.AddWithValue("createdat", createdAt);
                            cmd.Parameters.AddWithValue("updateat", 0L);
                            cmd.Parameters.AddWithValue("status", "completed");
                            cmd.Parameters.AddWithValue("userid", $"pos:{posRefNo}"); // store original Ref# for idempotency
                            cmd.Parameters.AddWithValue("type", "deliver");
                            await cmd.ExecuteNonQueryAsync();
                        }

                        using (var cmd = new NpgsqlCommand(
                            @"INSERT INTO transaction (transid,orderid,customer,cashier,status,createdat)
                              VALUES (@transid,@orderid,@customer,@cashier,@status,@createdat)", con, tran))
                        {
                            cmd.Parameters.AddWithValue("transid", transId);
                            cmd.Parameters.AddWithValue("orderid", newOrderId);
                            cmd.Parameters.AddWithValue("customer", customer);
                            cmd.Parameters.AddWithValue("cashier", cashier);
                            cmd.Parameters.AddWithValue("status", "completed");
                            cmd.Parameters.AddWithValue("createdat", createdAt);
                            await cmd.ExecuteNonQueryAsync();
                        }

                        ordersInserted++;

                        foreach (var ln in validLines)
                        {
                            using (var cmd = new NpgsqlCommand(
                                @"INSERT INTO cart (cartid,code,item,qty,price,total,createdat,status)
                                  VALUES (@cartid,@code,@item,@qty,@price,@total,@createdat,@status)", con, tran))
                            {
                                cmd.Parameters.AddWithValue("cartid", cartId);
                                cmd.Parameters.AddWithValue("code", ln.code);
                                cmd.Parameters.AddWithValue("item", ln.item);
                                cmd.Parameters.AddWithValue("qty", ln.qty);
                                cmd.Parameters.AddWithValue("price", (long)ln.price);
                                cmd.Parameters.AddWithValue("total", (long)ln.amount);
                                cmd.Parameters.AddWithValue("createdat", ln.createdAt);
                                cmd.Parameters.AddWithValue("status", "completed");
                                await cmd.ExecuteNonQueryAsync();
                            }
                            itemsProcessed++;

                            // Deduct from inventory
                            using var upd = new NpgsqlCommand(
                                @"UPDATE inventory SET qty = GREATEST(0, qty - @sold), updatedat = @now
                                  WHERE TRIM(code) = TRIM(@code)", con, tran);
                            upd.Parameters.AddWithValue("sold", ln.qty);
                            upd.Parameters.AddWithValue("now", now);
                            upd.Parameters.AddWithValue("code", ln.code);
                            if (await upd.ExecuteNonQueryAsync() > 0) inventoryUpdated++;
                        }
                    }

                    await tran.CommitAsync();
                    return new POSImportResult
                    {
                        success = true,
                        message = $"Import complete. {ordersInserted} orders, {itemsProcessed} items, {inventoryUpdated} inventory lines updated, {skipped} rows skipped.",
                        ordersInserted = ordersInserted,
                        itemsProcessed = itemsProcessed,
                        inventoryUpdated = inventoryUpdated,
                        skipped = skipped,
                        errors = errors
                    };
                }
                catch (Exception ex)
                {
                    await tran.RollbackAsync();
                    return new POSImportResult { success = false, message = ex.Message, errors = errors };
                }
            }
            catch (Exception ex)
            {
                return new POSImportResult { success = false, message = ex.Message, errors = errors };
            }
        }

        // SSE-friendly variant: reads from a temp file path, reports per-row progress
        public async Task BulkUpsertInventoryStream(string tempFilePath, System.Threading.Channels.ChannelWriter<BulkProgressEvent> writer)
        {
            int inserted = 0;
            int updated = 0;
            int skipped = 0;
            var errors = new List<string>();
            long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            try
            {
                using var stream = new MemoryStream(await File.ReadAllBytesAsync(tempFilePath));
                using var package = new ExcelPackage(stream);

                ExcelWorksheet? worksheet = package.Workbook.Worksheets.FirstOrDefault();
                if (worksheet == null)
                {
                    await writer.WriteAsync(new BulkProgressEvent
                    {
                        type = "error",
                        success = false,
                        message = "No worksheet found in the Excel file.",
                        errors = errors
                    });
                    return;
                }

                ExcelWorksheet ws = worksheet;
                int rowCount = ws.Dimension?.Rows ?? 0;
                // total processable rows = data rows (exclude header row 1)
                int totalDataRows = Math.Max(0, rowCount - 1);
                int processed = 0;

                using var con = new NpgsqlConnection(_connectionString);
                await con.OpenAsync();
                using var tran = await con.BeginTransactionAsync();

                try
                {
                    for (int row = 2; row <= rowCount; row++)
                    {
                        string code = ((ws.Cells[row, 1].Value ?? string.Empty).ToString() ?? string.Empty).Trim();
                        if (string.IsNullOrWhiteSpace(code)) { skipped++; processed++; goto Report; }

                        string? item = ws.Cells[row, 2].Value?.ToString()?.Trim();
                        string? category = ws.Cells[row, 3].Value?.ToString()?.Trim();
                        string? brand = ws.Cells[row, 4].Value?.ToString()?.Trim();

                        var qtyRaw = ws.Cells[row, 6].Value;
                        if (qtyRaw == null) { skipped++; processed++; goto Report; }
                        if (!double.TryParse(qtyRaw.ToString(), out double qtyDouble) || qtyDouble == 0)
                        { skipped++; processed++; goto Report; }
                        long qty = (long)qtyDouble;

                        double cost = 0;
                        var costRaw = ws.Cells[row, 7].Value;
                        if (costRaw != null) double.TryParse(costRaw.ToString(), out cost);

                        double price = 0;
                        var priceRaw = ws.Cells[row, 8].Value;
                        if (priceRaw != null) double.TryParse(priceRaw.ToString(), out price);

                        int count = 0;
                        using (var checkCmd = new NpgsqlCommand(
                            "SELECT COUNT(1) FROM inventory WHERE TRIM(code) = TRIM(@code)", con, tran))
                        {
                            checkCmd.Parameters.AddWithValue("code", code);
                            count = Convert.ToInt32(await checkCmd.ExecuteScalarAsync());
                        }

                        if (count > 0)
                        {
                            using var cmd = new NpgsqlCommand(
                                @"UPDATE inventory SET
                                    item = COALESCE(@item, item),
                                    category = COALESCE(@category, category),
                                    brand = COALESCE(@brand, brand),
                                    qty = @qty, cost = @cost, price = @price, updatedat = @updatedat
                                  WHERE TRIM(code) = TRIM(@code)", con, tran);
                            cmd.Parameters.AddWithValue("item", (object?)item ?? DBNull.Value);
                            cmd.Parameters.AddWithValue("category", (object?)category ?? DBNull.Value);
                            cmd.Parameters.AddWithValue("brand", (object?)brand ?? DBNull.Value);
                            cmd.Parameters.AddWithValue("qty", qty);
                            cmd.Parameters.AddWithValue("cost", cost);
                            cmd.Parameters.AddWithValue("price", price);
                            cmd.Parameters.AddWithValue("updatedat", now);
                            cmd.Parameters.AddWithValue("code", code);
                            await cmd.ExecuteNonQueryAsync();
                            updated++;
                        }
                        else
                        {
                            using var cmd = new NpgsqlCommand(
                                @"INSERT INTO inventory (code, item, qty, category, brand, cost, price, createdat, status, image, updatedat, reorderqty)
                                  VALUES (@code, @item, @qty, @category, @brand, @cost, @price, @createdat, @status, @image, @updatedat, @reorderqty)", con, tran);
                            cmd.Parameters.AddWithValue("code", code);
                            cmd.Parameters.AddWithValue("item", (object?)item ?? DBNull.Value);
                            cmd.Parameters.AddWithValue("qty", qty);
                            cmd.Parameters.AddWithValue("category", (object?)category ?? DBNull.Value);
                            cmd.Parameters.AddWithValue("brand", (object?)brand ?? DBNull.Value);
                            cmd.Parameters.AddWithValue("cost", cost);
                            cmd.Parameters.AddWithValue("price", price);
                            cmd.Parameters.AddWithValue("createdat", now);
                            cmd.Parameters.AddWithValue("status", "active");
                            cmd.Parameters.AddWithValue("image", "");
                            cmd.Parameters.AddWithValue("updatedat", now);
                            cmd.Parameters.AddWithValue("reorderqty", 0);
                            await cmd.ExecuteNonQueryAsync();
                            inserted++;
                        }
                        processed++;

                    Report:
                        int pct = totalDataRows > 0 ? (int)Math.Round((double)processed / totalDataRows * 100) : 0;
                        await writer.WriteAsync(new BulkProgressEvent
                        {
                            type = "progress",
                            processed = processed,
                            total = totalDataRows,
                            inserted = inserted,
                            updated = updated,
                            skipped = skipped,
                            pct = pct
                        });
                    }

                    await tran.CommitAsync();
                    await writer.WriteAsync(new BulkProgressEvent
                    {
                        type = "done",
                        processed = processed,
                        total = totalDataRows,
                        inserted = inserted,
                        updated = updated,
                        skipped = skipped,
                        pct = 100,
                        success = true,
                        message = $"Done. {inserted} inserted, {updated} updated, {skipped} skipped.",
                        errors = errors
                    });
                }
                catch (Exception ex)
                {
                    await tran.RollbackAsync();
                    await writer.WriteAsync(new BulkProgressEvent
                    {
                        type = "error",
                        success = false,
                        message = ex.Message,
                        errors = errors
                    });
                }
            }
            catch (Exception ex)
            {
                await writer.WriteAsync(new BulkProgressEvent
                {
                    type = "error",
                    success = false,
                    message = ex.Message,
                    errors = errors
                });
            }
            finally
            {
                writer.Complete();
                try { File.Delete(tempFilePath); } catch { /* ignore */ }
            }
        }

        public BulkUpsertInventoryResponse BulkUpsertInventoryFromExcel(IFormFile file)
        {
            int inserted = 0;
            int updated = 0;
            int skipped = 0;
            var errors = new List<string>();
            long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

            using (var stream = new MemoryStream())
            {
                file.CopyTo(stream);
                using (ExcelPackage package = new ExcelPackage(stream))
                {
                    ExcelWorksheet? worksheet = package.Workbook.Worksheets.FirstOrDefault();
                    if (worksheet == null)
                        return new BulkUpsertInventoryResponse { success = false, statusCode = 400, message = "No worksheet found in the Excel file." };

                    ExcelWorksheet ws = worksheet;
                    int rowCount = ws.Dimension?.Rows ?? 0;

                    using (var con = new NpgsqlConnection(_connectionString))
                    {
                        con.Open();
                        using (var tran = con.BeginTransaction())
                        {
                            try
                            {
                                for (int row = 2; row <= rowCount; row++)
                                {
                                    // --- Read cells null-safely ---
                                    string code = ((ws.Cells[row, 1].Value ?? string.Empty).ToString() ?? string.Empty).Trim();
                                    if (string.IsNullOrWhiteSpace(code)) { skipped++; continue; }

                                    string? item = ws.Cells[row, 2].Value?.ToString()?.Trim();
                                    string? category = ws.Cells[row, 3].Value?.ToString()?.Trim();
                                    string? brand = ws.Cells[row, 4].Value?.ToString()?.Trim();
                                    // column 5 = U/M — not stored in inventory table

                                    // On Hand qty — skip row if 0 or null
                                    var qtyRaw = ws.Cells[row, 6].Value;
                                    if (qtyRaw == null) { skipped++; continue; }
                                    if (!double.TryParse(qtyRaw.ToString(), out double qtyDouble) || qtyDouble == 0)
                                    { skipped++; continue; }
                                    long qty = (long)qtyDouble;

                                    double cost = 0;
                                    var costRaw = ws.Cells[row, 7].Value;
                                    if (costRaw != null) double.TryParse(costRaw.ToString(), out cost);

                                    double price = 0;
                                    var priceRaw = ws.Cells[row, 8].Value;
                                    if (priceRaw != null) double.TryParse(priceRaw.ToString(), out price);

                                    // --- Check if code exists ---
                                    int count = 0;
                                    using (var checkCmd = new NpgsqlCommand(
                                        "SELECT COUNT(1) FROM inventory WHERE TRIM(code) = TRIM(@code)", con, tran))
                                    {
                                        checkCmd.Parameters.AddWithValue("code", code);
                                        count = Convert.ToInt32(checkCmd.ExecuteScalar());
                                    }

                                    if (count > 0)
                                    {
                                        // UPDATE
                                        using (var cmd = new NpgsqlCommand(
                                            @"UPDATE inventory SET
                                                item = COALESCE(@item, item),
                                                category = COALESCE(@category, category),
                                                brand = COALESCE(@brand, brand),
                                                qty = @qty,
                                                cost = @cost,
                                                price = @price,
                                                updatedat = @updatedat
                                              WHERE TRIM(code) = TRIM(@code)", con, tran))
                                        {
                                            cmd.Parameters.AddWithValue("item", (object?)item ?? DBNull.Value);
                                            cmd.Parameters.AddWithValue("category", (object?)category ?? DBNull.Value);
                                            cmd.Parameters.AddWithValue("brand", (object?)brand ?? DBNull.Value);
                                            cmd.Parameters.AddWithValue("qty", qty);
                                            cmd.Parameters.AddWithValue("cost", cost);
                                            cmd.Parameters.AddWithValue("price", price);
                                            cmd.Parameters.AddWithValue("updatedat", now);
                                            cmd.Parameters.AddWithValue("code", code);
                                            cmd.ExecuteNonQuery();
                                        }
                                        updated++;
                                    }
                                    else
                                    {
                                        // INSERT
                                        using (var cmd = new NpgsqlCommand(
                                            @"INSERT INTO inventory (code, item, qty, category, brand, cost, price, createdat, status, image, updatedat, reorderqty)
                                              VALUES (@code, @item, @qty, @category, @brand, @cost, @price, @createdat, @status, @image, @updatedat, @reorderqty)", con, tran))
                                        {
                                            cmd.Parameters.AddWithValue("code", code);
                                            cmd.Parameters.AddWithValue("item", (object?)item ?? DBNull.Value);
                                            cmd.Parameters.AddWithValue("qty", qty);
                                            cmd.Parameters.AddWithValue("category", (object?)category ?? DBNull.Value);
                                            cmd.Parameters.AddWithValue("brand", (object?)brand ?? DBNull.Value);
                                            cmd.Parameters.AddWithValue("cost", cost);
                                            cmd.Parameters.AddWithValue("price", price);
                                            cmd.Parameters.AddWithValue("createdat", now);
                                            cmd.Parameters.AddWithValue("status", "active");
                                            cmd.Parameters.AddWithValue("image", "");
                                            cmd.Parameters.AddWithValue("updatedat", now);
                                            cmd.Parameters.AddWithValue("reorderqty", 0);
                                            cmd.ExecuteNonQuery();
                                        }
                                        inserted++;
                                    }
                                }

                                tran.Commit();
                                return new BulkUpsertInventoryResponse
                                {
                                    inserted = inserted,
                                    updated = updated,
                                    skipped = skipped,
                                    success = true,
                                    statusCode = 200,
                                    message = $"Done. {inserted} inserted, {updated} updated, {skipped} skipped.",
                                    errors = errors
                                };
                            }
                            catch (Exception ex)
                            {
                                tran.Rollback();
                                return new BulkUpsertInventoryResponse
                                {
                                    inserted = 0,
                                    updated = 0,
                                    skipped = 0,
                                    success = false,
                                    statusCode = 500,
                                    message = ex.Message,
                                    errors = errors
                                };
                            }
                        }
                    }
                }
            }
        }

    }
}
