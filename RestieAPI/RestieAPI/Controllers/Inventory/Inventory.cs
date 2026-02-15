using iTextSharp.text.pdf.codec.wmf;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.OpenApi.Models;
using Org.BouncyCastle.Asn1.Crmf;
using RestieAPI.Configs;
using RestieAPI.Models.Request;
using RestieAPI.Models.Response;
using RestieAPI.Providers;
using RestieAPI.Service.Repo;
using RestSharp;
using RestSharp.Authenticators;
using System.IO;
using static RestieAPI.Models.Request.InventoryRequestModel;
using static System.Net.Mime.MediaTypeNames;

namespace RestieAPI.Controllers.Inventory
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
        public ActionResult<InventoryItemModel> FetchInventory(int pageNumber, [FromBody] GetAllInventory getAllInventory)
        {
            int itemsPerPage = getAllInventory.limit; // Or any desired number of items per page
            int offset = (pageNumber - 1) * itemsPerPage;

            getAllInventory.offset = offset;
            getAllInventory.limit = itemsPerPage;
            return Ok(_inventoryRepo.fetchInventory(getAllInventory));
        }
        
        [HttpGet("getAllInventory")]
        public ActionResult<InventoryItemModel> GetAllInventory(
            [FromQuery] int limit = 1000,
            [FromQuery] int offset = 0,
            [FromQuery] string searchTerm = "",
            [FromQuery] string category = "",
            [FromQuery] string brand = "",
            [FromQuery] string filter = "")
        {
            var getAllInventory = new GetAllInventory
            {
                searchTerm = searchTerm ?? "",
                category = category ?? "",
                brand = brand ?? "",
                filter = filter ?? "",
                offset = offset,
                limit = limit
            };
            
            return Ok(_inventoryRepo.fetchInventory(getAllInventory));
        }
        
        [HttpPost("selectedItem/{itemCode}")]
        public ActionResult<InventoryItemModel> SelectedItem(string itemCode)
        {
            return Ok(_inventoryRepo.selectedItem(itemCode));
        }
        [HttpPost("fetchBrands")]
        public ActionResult<BrandResponseModel> FetchBrand( [FromBody] GetBrand getBrand)
        {
     
            return Ok(_inventoryRepo.getBrands(getBrand));
        }
        [HttpPost("fetchCategory")]
        public ActionResult<CategoryResponseModel> FetchCategory( [FromBody] GetBrand getBrand)
        {
     
            return Ok(_inventoryRepo.getCategory(getBrand));
        }
        [HttpPost("searchInventory/{pageNumber}")]
        public ActionResult<InventoryItemModel> SearchInventory(int pageNumber, [FromBody] GetAllInventory getAllInventory)
        {
            int itemsPerPage = getAllInventory.limit; // Or any desired number of items per page
            int offset = (pageNumber - 1) * itemsPerPage;

            getAllInventory.offset = offset;
            getAllInventory.limit = itemsPerPage;
            return Ok(_inventoryRepo.searchInventory(getAllInventory));
        }
     
        [Authorize]
        [HttpPost("AddToCart")]
        public ActionResult<PostResponse> AddtoCart(AddToCart[] addToCart)
        {
            return Ok(_inventoryRepo.AddToCart(addToCart));
        }
        [Authorize]
        [HttpPost("UpdateCart")]
        public ActionResult<PostResponse> UpdateCart(AddToCart[] addToCart)
        {
            return Ok(_inventoryRepo.updateCart(addToCart));
        }
        [Authorize]
        [HttpPost("SaveOrder")]
        public ActionResult<PostResponse> SaveCartUpdateInventory(AddToCart[] addToCart)
        {
            return Ok(_inventoryRepo.SavetoCartandUpdateInventory(addToCart));
        }
        // THIS IS FOR N8N INTEGRATION, DO NOT DELETE
        [HttpPost("AddOrdern8n")]
        public ActionResult<PostResponse> AddOrdern8n(AddToCart[] addToCart)
        {
            return Ok(_inventoryRepo.SavetoCartandUpdateInventoryn8n(addToCart));
        }
        [Authorize]
        [HttpPost("UpdatedOrderAndCart")]
        public ActionResult<PostResponse> updatedOrderAndCart(AddToCart[] addToCart)
        {
            return Ok(_inventoryRepo.updatedOrderAndCart(addToCart));
        }
        [Authorize]
        [HttpPost("ApprovedOrderAndPay")]
        public ActionResult<PostResponse> ApprovedOrderAndpay(AddToCart[] addToCart)
        {
            return Ok(_inventoryRepo.ApprovedOrderAndpay(addToCart));
        }   
        [Authorize]
        [HttpPost("CancelOrder")]
        public ActionResult<PostResponse> CancelOrder(AddToCart[] addToCart)
        {
            return Ok(_inventoryRepo.CancelOrder(addToCart));
        }
        [Authorize]
        [HttpPost("deleteCart")]
        public ActionResult<PostResponse> deleteCart(AddToCart[] addToCart)
        {
            return Ok(_inventoryRepo.deleteCart(addToCart));
        }
        [Authorize]
        [HttpPost("userOrders")]
        public ActionResult<PostResponse> GetOrder(GetUserOrder getUserOrder)
        {
            return Ok(_inventoryRepo.getOrder(getUserOrder));
        }
        [Authorize]
        [HttpPost("userOrderInfo")]
        public ActionResult<PostResponse> GetOrderInfo(GetSelectedOrder getUserOrder)
        {
            return Ok(_inventoryRepo.GetOrderInfo(getUserOrder));
        }
        [Authorize]
        [HttpPost("getSelectedOrder")]
        public ActionResult<PostResponse> GetselectOrder(GetSelectedOrder getSelectedOrder)
        {
            return Ok(_inventoryRepo.selectOrder(getSelectedOrder));
        }
        [Authorize]
        [HttpPost("PostCustomerInfo")]
        public ActionResult<PostResponse> PostCustoemrInfo(PostCustomerInfo postCustomerInfo)
        {
            return Ok(_inventoryRepo.AddCustomerInfo(postCustomerInfo));
        }
        [Authorize]
        [HttpPost("UpdateCustomerEmail")]
        public ActionResult<PostResponse> UpdateCustomerEmail(PutCustomerEmail putCustomerEmail)
        {
            return Ok(_inventoryRepo.UpdateCustomerEmail(putCustomerEmail));
        }
        [Authorize]
        [HttpGet("GetCustomers")]
        public ActionResult<PostResponse> getCustomers()
        {
            return Ok(_inventoryRepo.getCustomers());
        }
        [Authorize]
        [HttpPost("GetCustomerInfo")]
        public ActionResult<PostResponse> getCustomerInfo(GetCustomer getCustomer)
        {
            return Ok(_inventoryRepo.getCustomerInfo(getCustomer));
        }
        [Authorize]
        [HttpPost("PostDeliveryInfo")]
        public ActionResult<PostResponse> PostDeliveryInfo(DeliveryInfo deliveryInfo)
        {
            return Ok(_inventoryRepo.PostDeliveryInfo(deliveryInfo));
        }
        [Authorize]
        [HttpPost("UpdateDelivered")]
        public ActionResult<PostResponse> UpdateDelivered(UpdateDelivery updateDelivery)
        {
            return Ok(_inventoryRepo.UpdateDelivered(updateDelivery));
        }
        [Authorize]
        [HttpPost("getDelivery")]
        public ActionResult<PostResponse> getDelivery(GetDelivery getDelivery)
        {
            return Ok(_inventoryRepo.getDelivery(getDelivery));
        }    
        [Authorize]
        [HttpPost("GetVoucher")]
        public ActionResult<PostResponse> GetVouchers(GetVoucher getVoucher)
        {
            return Ok(_inventoryRepo.getVouchers(getVoucher));
        } 
        [Authorize]
        [HttpPost("ListOfVouchers")]
        public ActionResult<PostResponse> ListOfVouchers(GetVoucherType getVoucher)
        {
            return Ok(_inventoryRepo.ListOfVouchers(getVoucher));
        }
        [Authorize]
        [HttpPost("GetByDaySales")]
        public ActionResult<PostSalesResponse> GetByDaySales(GetSales getSales)
        {

            return Ok(_inventoryRepo.getByDaySales(getSales));
           
        }   
        [Authorize]
        [HttpPost("GenerateSalesReturn")]
        public ActionResult<PostSalesResponse> GenerateSalesReturn(GetSales getSales)
        {

            return Ok(_inventoryRepo.GenerateSalesReturn(getSales));
           
        }
        [Authorize]
        [HttpPost("GenerateInventoryLogs")]
        public ActionResult<PostSalesResponse> GenerateInventoryLogs(GetInventoryLogs getInventoryLogs)
        {
            return Ok(_inventoryRepo.GenerateInventoryLogs(getInventoryLogs));
        }
        
        [Authorize]
        [HttpPost("GetQuotationOrderInfo")]
        public ActionResult<PostSalesResponse> GetQuotationOrderInfo(GetSelectedOrder getSelectedOrder)
        {
            return Ok(_inventoryRepo.GetQuotationOrderInfo(getSelectedOrder));
        }
        [Authorize]
        [HttpPost("GetInventory")]
        public ActionResult<PostSalesResponse> GetByDaySales()
        {
            return Ok(_inventoryRepo.getInventoryQty());
        }   
        [Authorize]
        [HttpPost("GetItemsToRefund")]
        public ActionResult<RequestRefundResponseModel> getItemtoRefund(RequestRefundRequest requestRefundRequest)
        {
            return Ok(_inventoryRepo.getItemtoRefund(requestRefundRequest));
        }   
        [Authorize]
        [HttpPost("PostReturnItems")]
        public ActionResult<PostResponse> PostReturnItems(ReturnItems[] returnItems)
        {
            return Ok(_inventoryRepo.PostReturnItems(returnItems));
        }
        [Authorize]
        [HttpPost("GetAllAgedReceivable")]
        public ActionResult<AgedReceivableResponseModel> GetAllAgedReceivable()
        {
            return Ok(_inventoryRepo.GetAllAgedReceivable());
        }     
        [Authorize]
        [HttpPost("UpdateInventoryImage")]
        public ActionResult<PostResponse> UpdateInventoryImage(PutInventoryImage putInventoryImage)
        {
            return Ok(_inventoryRepo.UpdateInventoryImage(putInventoryImage));
        }
        [Authorize]
        [HttpPost("UploadFile")]
        public async Task<ActionResult<PostImageResponse>> Post([FromForm] FileModel file)
        {
            try
            {
                string path = Path.Combine("/mnt/images", file.FolderName);

                Console.WriteLine($"Trying to access path: {path}");
                if (!Directory.Exists(path))
                {
                    Directory.CreateDirectory(path);
                }

                string filepath = Path.Combine(path, file.FileName);
                using (Stream stream = new FileStream(filepath, FileMode.Create))
                {
                    await file.FormFile.CopyToAsync(stream);
                }

                return new PostImageResponse
                {
                    result = new SaveImageResponse
                    {
                        imagePath = Path.Combine("/mnt/images", file.FolderName, file.FileName)
                    },
                    status = StatusCodes.Status201Created,
                    message = "Image Uploaded Successfully"
                };
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error: {e.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, new PostImageResponse
                {
                    result = null,
                    status = StatusCodes.Status500InternalServerError,
                    message = e.Message
                });
            }
        }
        [Authorize]
        [HttpPost("UploadFileMultiple")]
        public async Task<ActionResult<PostMultipleImageResponse>> UploadFileMultiple([FromForm] MultipleFileModel file)
        {
            try
            {
                if (file.FormFiles == null || !file.FormFiles.Any())
                {
                    return BadRequest("No files uploaded.");
                }

                var imagePaths = new List<string>();
                string path = Path.Combine(Directory.GetCurrentDirectory(), "Resources", "Images", file.FolderName);
                if (!Directory.Exists(path))
                {
                    Directory.CreateDirectory(path);
                }

                foreach (var formFile in file.FormFiles)
                {
                    string fileName = Path.GetFileName(formFile.FileName);

                    string filePath = Path.Combine(path, fileName);

                    using (Stream stream = new FileStream(filePath, FileMode.Create))
                    {
                        await formFile.CopyToAsync(stream);
                    }

                    imagePaths.Add(Path.Combine("Resources", "Images", file.FolderName, fileName));
                }

                return new PostMultipleImageResponse
                {
                    result = new SaveMultipleImageResponse
                    {
                        imagePaths = imagePaths
                    },
                    status = StatusCodes.Status201Created,
                    message = "Images Uploaded Successfully"
                };
            }
            catch (Exception e)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new PostImageResponse
                {
                    result = null,
                    status = StatusCodes.Status500InternalServerError,
                    message = e.Message
                });
            }
        }
        [HttpPost("Getimage")]
        public ActionResult<PostDeliveryImageResponse> GetImageDelivery(GetDeliveryImage getDeliveryImage)
        {
            string originalPath = getDeliveryImage.imagePath;
            string formattedPath = originalPath.Replace("\\", "\\\\");
            string path = Path.Combine(Directory.GetCurrentDirectory(), formattedPath);

            if (!System.IO.File.Exists(path))
            {
                return NotFound(); // Return 404 Not Found if the image file does not exist
            }

            byte[] imageData = System.IO.File.ReadAllBytes(path);

            // Determine the content type based on the file extension
            string contentType = "image/jpeg"; // Default content type for JPEG images
            if (Path.GetExtension(path).Equals(".png", StringComparison.OrdinalIgnoreCase))
            {
                contentType = "image/png";
            }

            return new PostDeliveryImageResponse
            {
                result = new DeliveryImageResponse
                {
                    image = File(imageData, contentType), // Use FileContentResult with byte array
                },
                status = StatusCodes.Status200OK,
            };

        }
        [HttpPost("GetMultipleimage")]
        public ActionResult<GetMultipleImageResponse> GetMultipleimage([FromBody] GetMultipleImages getMultipleImages)
        {
            var images = new List<FileContentResult>();

            // Assuming the folder path is provided in the request
            string folderPath = getMultipleImages.folderPath;  // Folder path where images are stored

            // Format the path to avoid issues with backslashes
            string formattedPath = folderPath.Replace("\\", "////");
            string directoryPath = Path.Combine(Directory.GetCurrentDirectory(), getMultipleImages.folderPath);
            Console.WriteLine($"Directory path: {directoryPath}");
            // Check if the directory exists
            if (!Directory.Exists(directoryPath))
            {
                return NotFound(new { Message = $"Directory not found: {directoryPath}" });
            }

            // Get all image files (you can adjust the pattern to support other image types)
            var imageFiles = Directory.GetFiles(directoryPath, "*.*")
                                      .Where(file => new[] { ".jpg", ".jpeg", ".png", ".gif" }
                                      .Contains(Path.GetExtension(file).ToLower()))
                                      .ToList();

            if (imageFiles.Count == 0)
            {
                return NotFound(new { Message = "No images found in the directory." });
            }

            // Loop through each image file and return its content
            foreach (var imagePath in imageFiles)
            {
                byte[] imageData = System.IO.File.ReadAllBytes(imagePath);

                // Determine the content type based on the file extension
                string contentType = "image/jpeg";  // Default content type for JPEG images
                if (Path.GetExtension(imagePath).Equals(".png", StringComparison.OrdinalIgnoreCase))
                {
                    contentType = "image/png";
                }
                else if (Path.GetExtension(imagePath).Equals(".gif", StringComparison.OrdinalIgnoreCase))
                {
                    contentType = "image/gif";
                }

                // Add the image file content to the response list
                images.Add(File(imageData, contentType));
            }

            // Return the images
            return new GetMultipleImageResponse
            {
                result = new GetMultipleImagesResponse
                {
                    images = images,  // Return the list of image FileContentResult objects
                },
                status = StatusCodes.Status200OK,
                message = "Images retrieved successfully"
            };
        }


        [Authorize]
        [HttpPost("SendEmail")]
        public async Task<ActionResult<PostSendEmail>> SendMailgunEmail([FromForm] PostEmail postEmail)
        {
            MailgunEmailSender emailSender = new MailgunEmailSender();

            try
            {
                await emailSender.SendEmail(postEmail);

                return new PostSendEmail
                {
                    status = StatusCodes.Status200OK,
                    message = "Email sent successfully!"
                };
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new PostSendEmail
                {
                    status = StatusCodes.Status500InternalServerError,
                    message = ex.Message
                });
            }
        }

        [HttpPost("chatQuery")]
        public ActionResult<InventoryChatQueryResponse> ChatQuery([FromBody] InventoryChatQueryRequest request)
        {
            var intent = (request.Intent ?? "").Trim().ToLowerInvariant();
            var q = (request.Q ?? "").Trim();
            var code = (request.Code ?? "").Trim();
            var category = (request.Category ?? "").Trim();
            var brand = (request.Brand ?? "").Trim();

            var limit = Math.Clamp(request.Limit <= 0 ? 10 : request.Limit, 1, 25);
            var offset = Math.Max(0, request.Offset);
            var sort = (request.Sort ?? "").Trim();

            try
            {
                if (string.IsNullOrWhiteSpace(intent)) intent = "search";

                if (intent == "details")
                {
                    if (string.IsNullOrWhiteSpace(code))
                    {
                        return BadRequest(new InventoryChatQueryResponse
                        {
                            success = false,
                            statusCode = StatusCodes.Status400BadRequest,
                            message = "code is required for intent=details",
                            intent = intent,
                            query = request
                        });
                    }

                    // Keep compatibility: details uses the existing full endpoint (may include base64 image).
                    var result = _inventoryRepo.selectedItem(code);
                    return Ok(new InventoryChatQueryResponse
                    {
                        success = true,
                        statusCode = StatusCodes.Status200OK,
                        intent = intent,
                        query = request,
                        data = new { item = result.result?.FirstOrDefault() }
                    });
                }

                if (intent == "list_brands")
                {
                    var brands = _inventoryRepo.getBrands(new InventoryRequestModel.GetBrand { category = category ?? "" });
                    return Ok(new InventoryChatQueryResponse
                    {
                        success = true,
                        statusCode = StatusCodes.Status200OK,
                        intent = intent,
                        query = request,
                        data = new { category, brands = brands.result.Select(b => b.brand).ToList() }
                    });
                }

                if (intent == "cheapest")
                {
                    var cheapest = _inventoryRepo.GetCheapestLite(q, category, brand);
                    return Ok(new InventoryChatQueryResponse
                    {
                        success = true,
                        statusCode = StatusCodes.Status200OK,
                        intent = intent,
                        query = request,
                        data = new { currency = "PHP", item = cheapest }
                    });
                }

                if (intent == "price")
                {
                    var key = !string.IsNullOrWhiteSpace(code) ? code : q;
                    if (string.IsNullOrWhiteSpace(key))
                    {
                        return BadRequest(new InventoryChatQueryResponse
                        {
                            success = false,
                            statusCode = StatusCodes.Status400BadRequest,
                            message = "q or code is required for intent=price",
                            intent = intent,
                            query = request
                        });
                    }

                    var matches = _inventoryRepo.SearchInventoryLite(key, category, brand, sort: "asc", limit: 5, offset: 0);
                    var best = matches.OrderBy(m => m.price).FirstOrDefault();

                    return Ok(new InventoryChatQueryResponse
                    {
                        success = true,
                        statusCode = StatusCodes.Status200OK,
                        intent = intent,
                        query = request,
                        data = new { currency = "PHP", found = best != null, item = best, matches }
                    });
                }

                if (intent == "exists")
                {
                    var key = !string.IsNullOrWhiteSpace(code) ? code : q;
                    if (string.IsNullOrWhiteSpace(key))
                    {
                        return BadRequest(new InventoryChatQueryResponse
                        {
                            success = false,
                            statusCode = StatusCodes.Status400BadRequest,
                            message = "q or code is required for intent=exists",
                            intent = intent,
                            query = request
                        });
                    }

                    var (exists, topMatches) = _inventoryRepo.ExistsLite(key, category, brand, top: 5);

                    return Ok(new InventoryChatQueryResponse
                    {
                        success = true,
                        statusCode = StatusCodes.Status200OK,
                        intent = intent,
                        query = request,
                        data = new { exists, matches = topMatches }
                    });
                }

                // Default: search
                var items = _inventoryRepo.SearchInventoryLite(q, category, brand,
                    sort: string.Equals(sort, "desc", StringComparison.OrdinalIgnoreCase) ? "desc" : "asc",
                    limit: limit,
                    offset: offset);

                return Ok(new InventoryChatQueryResponse
                {
                    success = true,
                    statusCode = StatusCodes.Status200OK,
                    intent = "search",
                    query = request,
                    data = new { items }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new InventoryChatQueryResponse
                {
                    success = false,
                    statusCode = StatusCodes.Status500InternalServerError,
                    message = ex.Message,
                    intent = intent,
                    query = request
                });
            }
        }

    }
}
