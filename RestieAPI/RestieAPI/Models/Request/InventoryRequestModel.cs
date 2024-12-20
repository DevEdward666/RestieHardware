﻿using Microsoft.AspNetCore.Mvc;
using RestieAPI.Models.Response;

namespace RestieAPI.Models.Request
{
    public class InventoryRequestModel
    {
        public class GetAllInventory {

            public Int32 offset { get; set; }

            public Int32 page { get; set; }
            public Int32 limit { get; set; }
            public string searchTerm {  get; set; }
            public string? category {  get; set; }
            public string? brand {  get; set; }
            public string? filter {  get; set; }

        }
        public class RequestRefundRequest
        {
            public string transid { get; set; }
        }
        public class PostInventory
        {
            public PostInventoryItems[] items { get; set; }
            public string supplierId { get; set; }

        }      
        public class PostInventoryItems
        {
            public string item { get; set; }
            public string category { get; set; }
            public string brand { get; set; }
            public string code { get; set; }
            public long onhandqty  { get; set; }
            public long addedqty { get; set; }
            public string supplierid { get; set; }
            public float cost { get; set; }
            public float price { get; set; }
            public long createdat { get; set; }
            public long updatedat { get; set; }

        }
        public class PostNewItemInventory
        {
            public string code { get; set; }
            public string item { get; set; }
            public string category { get; set; }
            public string brand { get; set; }
            public long onhandqty { get; set; }
            public long addedqty { get; set; }
            public string supplierid { get; set; }
            public float cost { get; set; }
            public float price { get; set; }
            public string status { get; set; }
            public string image { get; set; }
            public long createdat { get; set; }
            public long updatedat { get; set; }


        }
        public class PostNewSupplier
        {
            public string company { get; set; }
            public long contactno { get; set; }
            public string address { get; set; }
            public long createdat { get; set; }

        }
        public class PutSupplier
        {
            public string supplierid { get; set; }
            public string company { get; set; }
            public long contactno { get; set; }
            public string address { get; set; }

        }
        public class PostCustomerInfo
        {
            public string customerid { get; set; }
            public string name { get; set; }
            public string contactno { get; set; }
            public string address { get; set; }
            public string customer_email { get; set; }
            public long createdat { get; set; }


        }
        public class PutCustomerEmail
        {
            public string customerid { get; set; }
            public string customer_email { get; set; }


        }
        public class PutInventoryImage
        {
            public string code { get; set; }
            public string image { get; set; }
        }
        public class GetUserOrder
        {
            public string userid { get; set; }
            public string status { get; set; }
            public string? paidThru { get; set; }

            public string? orderid { get; set; }
            public string? searchdate { get; set; }
            public Int32 limit { get; set; }
            public Int32 offset { get; set; }

        }
        public class GetBrand
        {
            public string category { get; set; }

        }
        public class GetQty
        {
            public string code { get; set; }

        }
        public class GetCustomer
        {
            public string customerid { get; set; }

        }     
        public class GetDelivery
        {
            public string orderid { get; set; }

        }
        public class GetVoucher
        {
            public string? vouchercode { get; set; }
            public string? vouchertype { get; set; }
        }
        public class GetVoucherType
        {
            public string? voucher_for { get; set; }
        }
        public class GetDeliveryImage
        {
            public string imagePath { get; set; }

        }
        public class GetMultipleImages
        {
            public string folderPath { get; set; }

        }
        public class PostEmail
        {
            public string from { get; set; }
            public string to { get; set; }
            public string subject { get; set; }
            public string text { get; set; }
            public IFormFile Attachment { get; set; }

        }
        public class GetSelectedOrder 
        {
            public string orderid { get; set; }

        }
        public class AddToCart
        {
            public string orderid { get; set; }
            public string cartid { get; set; }
            public string code { get; set; }
            public string item { get; set; }
            public long onhandqty { get; set; }
            public long qty { get; set; }
            public float price { get; set; }
            public float total { get; set; }
            public string? paidthru { get; set; }
            public float? paidcash { get; set; }
            public string? createdby { get; set; }
            public long createdat { get; set; }
            public long? updateat { get; set; }
            public string? userid { get; set; }
            public string status { get; set; }
            public int? voucher_id { get; set; }
            public float? discount { get; set; }
            public float? total_discount{ get; set; }
            public string? order_voucher{ get; set; }
            public string? voucher { get; set; }
            public string? type { get; set; }
            public string? transid { get; set; }
            public string? cashier { get; set; }
            public string? customer { get; set; }

        }
        public class FileModel
        {

            public string FolderName { get; set; }
            public string FileName { get; set; }
            public IFormFile FormFile { get; set; }
        }
        public class MultipleFileModel
        {

            public string FolderName { get; set; }
            public string FileName { get; set; }
            public IEnumerable<IFormFile> FormFiles { get; set; }
        }
        public class DeliveryInfo
        {

            public string deliveredby { get; set; }
            public long deliverydate { get; set; }
            public string path { get; set; }
            public long createdat { get; set; }
            public string createdby { get; set; }
            public string orderid { get; set; }
        }
        public class UpdateDelivery
        {
            public string orderid { get; set; }
            public string transid { get; set; }
            public string cartid { get; set; }
            public long updateat { get; set; }
            public string status { get; set; }

        }
        public class ReturnItemsModel
        {
            public List<ReturnItems> returnItems { get; set; }


        }
        public class ReturnItems
        {
            public string orderid { get; set; }
            public string transid { get; set; }
            public string cartid { get; set; }
            public string code { get; set; }
            public string item { get; set; }
            public long qty { get; set; }
            public float total { get; set; }
            public float price { get; set; }
            public float totaldiscount { get; set; }
            public float discount_price { get; set; }
            public long createdat { get; set; }
            public string? remarks {  get; set; }

        }
        public class UpdateCartItemsStatus
        {
            public string cartid { get; set; }
            public Int64 code { get; set; }

        }
        public class GetSales
        {
            public string fromDate { get; set; }
            public string toDate { get; set; }
            public int filter{ get; set; }
            public int report_type{ get; set; }


        }
        public class GetInventoryLogs
        {
            public string fromDate { get; set; }
            public string supplier { get; set; }
            public string toDate { get; set; }

        }
    }
}
