using Microsoft.AspNetCore.Mvc;

namespace RestieAPI.Models.Response
{
    public class PostResponse
    {
        public SaveOrderResponse result { get; set; }
        public int status { get; set; }
        public string Message { get; set; }
    }
    public class PostImageResponse
    {
        public SaveImageResponse result { get; set; }
        public int status { get; set; }
        public string message { get; set; }
    }
    public class PostMultipleImageResponse
    {
        public SaveMultipleImageResponse result { get; set; }
        public int status { get; set; }
        public string message { get; set; }
    }    
    public class GetMultipleImageResponse
    {
        public GetMultipleImagesResponse result { get; set; }
        public int status { get; set; }
        public string message { get; set; }
    }
    public class PostSendEmail
    {
        public int status { get; set; }
        public string message { get; set; }
    }
    public class PostDeliveryImageResponse
    {
        public DeliveryImageResponse result { get; set; }
        public int status { get; set; }
        public string message { get; set; }
    }
    public class SaveOrderResponse {
        public string orderid { get; set; }
        public string cartid { get; set; }

    }
    public class PostSalesResponse
    {
        public FileContentResult result { get; set; }
        public int status { get; set; }
        public string Message { get; set; }
    }
    public class SaveImageResponse
    {
        public string imagePath { get; set; }

    }
    public class SaveMultipleImageResponse
    {
        public List<string> imagePaths { get; set; }

    }
    public class DeliveryImageResponse
    {
        public FileContentResult image { get; set; }

    }
    public class GetMultipleImagesResponse
    {
        public List<FileContentResult> images { get; set; }

    }
    public class PostInventoryAddResponse
    {
        public int status { get; set; }
        public string message { get; set; }
    }
}
