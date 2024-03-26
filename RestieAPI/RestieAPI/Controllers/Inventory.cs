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
            return Ok(_inventoryRepo.AddToCart(addToCart));
        }       
        [HttpPost("UpdateCart")]
        public ActionResult<PostResponse> UpdateCart(InventoryRequestModel.AddToCart[] addToCart)
        {
            return Ok(_inventoryRepo.updateCart(addToCart));
        }
        [HttpPost("SaveOrder")]
        public ActionResult<PostResponse> SaveCartUpdateInventory(InventoryRequestModel.AddToCart[] addToCart)
        {
            return Ok(_inventoryRepo.SavetoCartandUpdateInventory(addToCart));
        }     
        [HttpPost("UpdatedOrderAndCart")]
        public ActionResult<PostResponse> updatedOrderAndCart(InventoryRequestModel.AddToCart[] addToCart)
        {
            return Ok(_inventoryRepo.updatedOrderAndCart(addToCart));
        }      
        [HttpPost("ApprovedOrderAndPay")]
        public ActionResult<PostResponse> ApprovedOrderAndpay(InventoryRequestModel.AddToCart[] addToCart)
        {
            return Ok(_inventoryRepo.ApprovedOrderAndpay(addToCart));
        }     
        [HttpPost("deleteCart")]
        public ActionResult<PostResponse> deleteCart(InventoryRequestModel.AddToCart[] addToCart)
        {
            return Ok(_inventoryRepo.deleteCart(addToCart));
        }
        [HttpPost("userOrders")]
        public ActionResult<PostResponse> GetOrder(InventoryRequestModel.GetUserOrder getUserOrder)
        {
            return Ok(_inventoryRepo.getOrder(getUserOrder));
        }     
        [HttpPost("userOrderInfo")]
        public ActionResult<PostResponse> GetOrderInfo(InventoryRequestModel.GetSelectedOrder getUserOrder)
        {
            return Ok(_inventoryRepo.getOrderInfo(getUserOrder));
        }   
        [HttpPost("getSelectedOrder")]
        public ActionResult<PostResponse> GetselectOrder(InventoryRequestModel.GetSelectedOrder getSelectedOrder)
        {
            return Ok(_inventoryRepo.selectOrder(getSelectedOrder));
        }   
        [HttpPost("PostCustoemrInfo")]
        public ActionResult<PostResponse> PostCustoemrInfo(InventoryRequestModel.PostCustomerInfo postCustomerInfo)
        {
            return Ok(_inventoryRepo.AddCustomerInfo(postCustomerInfo));
        }

        [HttpGet("GetCustomers")]
        public ActionResult<PostResponse> getCustomers()
        {
            return Ok(_inventoryRepo.getCustomers());
        }

        [HttpPost("GetCustomerInfo")]
        public ActionResult<PostResponse> getCustomerInfo(InventoryRequestModel.GetCustomer getCustomer)
        {
            return Ok(_inventoryRepo.getCustomerInfo(getCustomer));
        }

    }
}
