using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using RestieAPI.Configs;
using RestieAPI.Models.Request;
using RestieAPI.Models.Response;
using RestieAPI.Service.Repo;

namespace RestieAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]/")]
    public class Inventory : ControllerBase
    {
        public IConfiguration configuration;
        InventoryRepo _inventoryRepo;
        public Inventory(IConfiguration configuration)
        {
            this.configuration = configuration;
            _inventoryRepo = new InventoryRepo(configuration);
        }
        [HttpPost]
        public ActionResult<InventoryItemModel> GetInventory(InventoryRequestModel.GetAllInventory getAllInventory)
        {
            return Ok(_inventoryRepo.GetInventory(getAllInventory));
        }

        [HttpPost("AddInventory")]
        public ActionResult<PostInventoryResponse> PostInventory(InventoryRequestModel.PostInventory postInventory)
        {
            return Ok(_inventoryRepo.PostInventory(postInventory));
        }

    }
}
