using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestieAPI.Models.Response;
using RestieAPI.Service.Repo;
using static RestieAPI.Models.Request.AdminRequestModel;
using static RestieAPI.Models.Request.InventoryRequestModel;
using static RestieAPI.Models.Response.AdminResponseModel;

namespace RestieAPI.Controllers.Admin
{
    [ApiController]
    [Route("api/[controller]/")]
    public class AdminController : ControllerBase
    {
        public IConfiguration configuration;
        AdminRepo _adminRepo;
        public AdminController(IConfiguration configuration)
        {
            this.configuration = configuration;
            _adminRepo = new AdminRepo(configuration);
        }
        [Authorize]
        [HttpPost("searchInventory/{pageNumber}")]
        public ActionResult<InventoryItemModel> SearchInventory(int pageNumber, [FromBody] GetAllInventory getAllInventory)
        {
            int itemsPerPage = getAllInventory.limit; // Or any desired number of items per page
            int offset = (pageNumber - 1) * itemsPerPage;

            getAllInventory.offset = offset;
            getAllInventory.limit = itemsPerPage;
            return Ok(_adminRepo.searchInventory(getAllInventory));
        }
        [Authorize]
        [HttpPost("AddInventory")]
        public ActionResult<PostResponse> PostInventory(PostInventory postInventory)
        {
            return Ok(_adminRepo.PostInventory(postInventory));
        }       
        [Authorize]
        [HttpPost("NewItemInventory")]
        public ActionResult<PostResponse> PostNewItemInventory(PostNewItemInventory postNewItem)
        {
            return Ok(_adminRepo.PostNewItemInventory(postNewItem));
        }  
        [Authorize]
        [HttpPost("searchSupplier/{pageNumber}")]
        public ActionResult<SupplierResponseModel> SearchSupplier(int pageNumber, [FromBody] GetAllSupplier getAllSupplier)
        {
            int itemsPerPage = getAllSupplier.limit; // Or any desired number of items per page
            int offset = (pageNumber - 1) * itemsPerPage;

            getAllSupplier.offset = offset;
            getAllSupplier.limit = itemsPerPage;
            return Ok(_adminRepo.searchSupplier(getAllSupplier));
        }
    }
}
