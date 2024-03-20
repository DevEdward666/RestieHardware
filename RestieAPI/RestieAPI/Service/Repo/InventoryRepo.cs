using Microsoft.AspNetCore.Mvc;
using RestieAPI.Configs;
using RestieAPI.Models.Request;
using RestieAPI.Models.Response;
using System.Collections.Generic;

namespace RestieAPI.Service.Repo
{
    public class InventoryRepo
    {
        public IConfiguration configuration;
        private readonly DatabaseService _databaseService;

        public InventoryRepo(IConfiguration configuration)
        {
            this.configuration = configuration;
            _databaseService = new DatabaseService(configuration);
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
            using (var reader = _databaseService.ExecuteQuery(sql, parameters))
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
            using (var reader = _databaseService.ExecuteQuery(sql, parameters))
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

            return new InventoryItemModel
            {
                result = results
            };
        }



        public PostInventoryResponse PostInventory(InventoryRequestModel.PostInventory postInventory)
        {
            try
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
                var res = _databaseService.ExecuteNonQuery(sql, parameters);
                var updateRes = 0;
                if (res > 0)
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
                    updateRes = _databaseService.ExecuteNonQuery(updatesql, updateparameters);
                }
                return new PostInventoryResponse
                {
                    status = updateRes
                };
            }
            catch (Exception ex)
            {
                return new PostInventoryResponse
                {
                    status = 500,
                    ErrorMessage = ex.Message
                };
            }

        }
    }
}
