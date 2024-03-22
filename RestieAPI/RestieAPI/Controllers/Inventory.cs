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
        [HttpPost("fetchInventory/{pageNumber}")]
        public ActionResult<InventoryItemModel> FetchInventory( int pageNumber, [FromBody]InventoryRequestModel.GetAllInventory getAllInventory)
        {
            int itemsPerPage = getAllInventory.limit; // Or any desired number of items per page
            int offset = (pageNumber - 1) * itemsPerPage;

            getAllInventory.offset = offset;
            getAllInventory.limit = itemsPerPage;
            return Ok(_inventoryRepo.fetchInventory(getAllInventory));
        }
        [HttpPost("searchInventory/{pageNumber}")]
        public ActionResult<InventoryItemModel> SearchInventory(int pageNumber, [FromBody] InventoryRequestModel.GetAllInventory getAllInventory)
        {
            int itemsPerPage = getAllInventory.limit; // Or any desired number of items per page
            int offset = (pageNumber - 1) * itemsPerPage;

            getAllInventory.offset = offset;
            getAllInventory.limit = itemsPerPage;
            return Ok(_inventoryRepo.searchInventory(getAllInventory));
        }
        [HttpPost("AddInventory")]
        public ActionResult<PostResponse> PostInventory(InventoryRequestModel.PostInventory postInventory)
        {
            return Ok(_inventoryRepo.PostInventory(postInventory));
        }
        [HttpPost("AddToCart")]
        public ActionResult<PostResponse> AddtoCart(InventoryRequestModel.AddToCart[] addToCart)
        {
            return Ok(_inventoryRepo.AddtoCart(addToCart));
        }     
        [HttpPost("userOrders")]
        public ActionResult<PostResponse> GetOrder(InventoryRequestModel.GetUserOrder getUserOrder)
        {
            return Ok(_inventoryRepo.getOrder(getUserOrder));
        }

    }
}
