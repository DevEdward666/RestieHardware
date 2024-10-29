﻿using iTextSharp.text.pdf.codec.wmf;
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
                string path = Path.Combine(Directory.GetCurrentDirectory(), "Resources", "Images", file.FolderName);
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
                        imagePath = Path.Combine("Resources", "Images", file.FolderName, file.FileName)
                    },
                    status = StatusCodes.Status201Created,
                    message = "Image Uploaded Successfully"
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

    }
}
