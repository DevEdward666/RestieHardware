using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestieAPI.Models.Response;
using RestieAPI.Service.Repo;
using System.Text.Json;
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
        public ActionResult<PostResponse> PostInventory(PostInventoryItems postInventory)
        {
            return Ok(_adminRepo.PostInventory(postInventory));
        }
        [Authorize]
        [HttpPost("PostMultipleInventory")]
        public ActionResult<PostResponse> PostMultipleInventory(PostInventory postInventory)
        {
            return Ok(_adminRepo.PostMultipleInventory(postInventory));
        }
        [Authorize]
        [HttpPost("NewItemInventory")]
        public ActionResult<PostResponse> PostNewItemInventory(PostNewItemInventory postNewItem)
        {
            return Ok(_adminRepo.PostNewItemInventory(postNewItem));
        }
        [Authorize(Roles = "Admin, Super Admin")]
        [HttpPost("AddNewSupplier")]
        public ActionResult<PostResponse> PostNewSupplier(PostNewSupplier postNewSupplier)
        {
            return Ok(_adminRepo.PostNewSupplier(postNewSupplier));
        }
        [Authorize(Roles = "Admin, Super Admin")]
        [HttpPost("UpdateSupplier")]
        public ActionResult<PostResponse> PutSupplier(PutSupplier putSupplier)
        {
            return Ok(_adminRepo.PutSupplier(putSupplier));
        }
        //[Authorize]
        [HttpPost("ImportDataFromExcel")]
        public ActionResult<PostInventoryAddResponse> ImportDataFromExcel(FileForExcel forExcel)
        {
            if (forExcel.SalesFile == null || forExcel.SalesFile.Length == 0)
            {
                return BadRequest("File is empty or not provided.");
            }

            var response = _adminRepo.ImportDataFromExcel(forExcel.SalesFile);
            return Ok(response);
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
        [Authorize]
        [HttpPost("searchVouchers/{pageNumber}")]
        public ActionResult<SupplierResponseModel> searchVouchers(int pageNumber, [FromBody] GetAllVoucher getAllVoucher)
        {
            int itemsPerPage = getAllVoucher.limit; // Or any desired number of items per page
            int offset = (pageNumber - 1) * itemsPerPage;

            getAllVoucher.offset = offset;
            getAllVoucher.limit = itemsPerPage;
            return Ok(_adminRepo.searchVoucher(getAllVoucher));
        }
        [Authorize]
        [HttpPost("searchUser/{pageNumber}")]
        public ActionResult<AdminUsersResponseModel> searchUser(int pageNumber, [FromBody] GetAllUser getAllUser)
        {
            int itemsPerPage = getAllUser.limit; // Or any desired number of items per page
            int offset = (pageNumber - 1) * itemsPerPage;

            getAllUser.offset = offset;
            getAllUser.limit = itemsPerPage;
            return Ok(_adminRepo.searchUser(getAllUser));
        }
        [Authorize(Roles = "Admin, Super Admin")]
        [HttpPost("AddNewVoucher")]
        public ActionResult<PostResponse> AddNewVoucher(PostVouchers postVouchers)
        {
            return Ok(_adminRepo.AddNewVoucher(postVouchers));
        }
        [Authorize(Roles = "Admin, Super Admin")]
        [HttpPost("PutVoucher")]
        public ActionResult<PostResponse> PutVoucher(PostVouchers postVouchers)
        {
            return Ok(_adminRepo.PutVoucher(postVouchers));
        }

        [Authorize(Roles = "Admin, Super Admin")]
        [HttpPost("ImportPOSLog")]
        public async Task<ActionResult<POSImportResult>> ImportPOSLog([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty or not provided.");
            return Ok(await _adminRepo.ImportPOSLog(file));
        }

        [Authorize(Roles = "Admin, Super Admin")]
        [HttpPost("BulkUpsertInventoryFromExcel")]
        public ActionResult<BulkUpsertInventoryResponse> BulkUpsertInventoryFromExcel([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty or not provided.");
            return Ok(_adminRepo.BulkUpsertInventoryFromExcel(file));
        }

        // Step 1: upload the file, get back a jobId
        [Authorize(Roles = "Admin, Super Admin")]
        [HttpPost("BulkUpsertUploadFile")]
        public async Task<ActionResult<object>> BulkUpsertUploadFile([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty or not provided.");

            var jobId = Guid.NewGuid().ToString("N");
            var tempPath = Path.Combine(Path.GetTempPath(), $"bulkupsert_{jobId}.xlsx");

            using (var fs = System.IO.File.Create(tempPath))
                await file.CopyToAsync(fs);

            return Ok(new { jobId });
        }

        // Step 2: stream real-time progress as SSE
        [Authorize(Roles = "Admin, Super Admin")]
        [HttpGet("BulkUpsertInventoryStream/{jobId}")]
        public async Task BulkUpsertInventoryStream(string jobId, [FromQuery] string? token)
        {
            var tempPath = Path.Combine(Path.GetTempPath(), $"bulkupsert_{jobId}.xlsx");

            Response.ContentType = "text/event-stream";
            Response.Headers["Cache-Control"] = "no-cache";
            Response.Headers["X-Accel-Buffering"] = "no";
            Response.Headers["Connection"] = "keep-alive";

            if (!System.IO.File.Exists(tempPath))
            {
                var errJson = JsonSerializer.Serialize(new BulkProgressEvent
                {
                    type = "error",
                    success = false,
                    message = "Job not found or already completed."
                });
                await Response.WriteAsync($"data: {errJson}\n\n");
                await Response.Body.FlushAsync();
                return;
            }

            // Unbounded channel: repo writes, controller reads and flushes — same async chain, no fire-and-forget
            var channel = System.Threading.Channels.Channel.CreateUnbounded<BulkProgressEvent>(
                new System.Threading.Channels.UnboundedChannelOptions { SingleReader = true, SingleWriter = true });

            // Kick off the repo work on a background task; it writes into the channel
            var repoTask = _adminRepo.BulkUpsertInventoryStream(tempPath, channel.Writer);

            // Read every event the repo pushes and flush it to the SSE stream immediately
            await foreach (var evt in channel.Reader.ReadAllAsync(HttpContext.RequestAborted))
            {
                var json = JsonSerializer.Serialize(evt);
                await Response.WriteAsync($"data: {json}\n\n");
                await Response.Body.FlushAsync();
            }

            // Ensure repo task exceptions propagate (channel already completed by now)
            await repoTask;
        }
    }
}
