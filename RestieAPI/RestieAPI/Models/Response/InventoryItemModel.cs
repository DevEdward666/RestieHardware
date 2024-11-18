using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.Numerics;
using static RestieAPI.Models.Request.InventoryRequestModel;

namespace RestieAPI.Models.Response
{
    public class InventoryItemModel
    {
        public List<InventoryItems> result { get; set; }
        public Boolean success {  get; set; }
        public int statusCode { get; set; }
        public string? message {  get; set; }
    }
    public class OrderResponseModel
    {
        public List<OrderResponse> result { get; set; }
        public Boolean success { get; set; }
        public int statusCode { get; set; }
        public string? message { get; set; }
    }   
    public class BrandResponseModel
    {
        public List<BrandResponse> result { get; set; }
        public Boolean success { get; set; }
        public int statusCode { get; set; }
        public string? message { get; set; }
    }
    public class CategoryResponseModel
    {
        public List<CategoryResponse> result { get; set; }
        public Boolean success { get; set; }
        public int statusCode { get; set; }
        public string? message { get; set; }
    }
    public class OrderInfoResponseModel
    {
        public List<ItemOrders> order_item { get; set; }
        public List<ReturnItems> return_items { get; set; }
        public OrderInfoResponse order_info { get; set; }
        public Boolean success { get; set; }
        public int statusCode { get; set; }
        public string? message { get; set; }
    }
    public class CustomerInfoResponseModel
    {
        public List<CustomerResponse> result { get; set; }
        public Boolean success { get; set; }
        public int statusCode { get; set; }
        public string? message { get; set; }
    }   
    public class GetCustomerInfoResponseModel
    {
        public CustomerResponse result { get; set; }
        public Boolean success { get; set; }
        public int statusCode { get; set; }
        public string? message { get; set; }
    }
    public class SelectedOrderResponseModel
    {
        public List<SelectedOrderResponse> result { get; set; }
        public Boolean success { get; set; }
        public int statusCode { get; set; }
    }   
    public class DeliveryResponseModel
    {
        public DeliveryResponse result { get; set; }
        public Boolean success { get; set; }
        public int statusCode { get; set; }
        public string message { get; set; }
    }
    public class SingleVoucherResponseModel
    {
        public VoucherResponse result { get; set; }
        public Boolean success { get; set; }
        public int statusCode { get; set; }
        public string message { get; set; }
    }
    public class VoucherResponseModel
    {
        public List<VoucherResponse> result { get; set; }
        public Boolean success { get; set; }
        public int statusCode { get; set; }
        public string message { get; set; }
    }
    public class QuotationResponseModel
    {
        public FileContentResult result { get; set; }
        public Boolean success { get; set; }
        public int statusCode { get; set; }
        public string message { get; set; }
    }
    public class SalesResponseModel
    {
        public FileContentResult result { get; set; }
        public Boolean success { get; set; }
        public int statusCode { get; set; }
        public string message { get; set; }
    }   
    public class InventoryResponseModel
    {
        public FileContentResult result { get; set; }
        public Boolean success { get; set; }
        public int statusCode { get; set; }
        public string message { get; set; }
    }
    public class AgedReceivableResponseModel
    {
        public List<AgedReceivableResponse> result { get; set; }
        public Boolean success { get; set; }
        public int statusCode { get; set; }
        public string message { get; set; }

    }
    public class InventoryItems
    {
        public string code { get; set; }
        public string item { get; set; }
        public string category { get; set; }
        public string? brand { get; set; }
        public string? image { get; set; }
        public long qty { get; set; }
        public long reorderqty { get; set; }
        public float cost { get; set; }
        public float price { get; set; }
        public string status { get; set; }
        public long createdat { get; set; }
        public long updatedat { get; set; }
        public string? image_type { get; set; }

    }

    public class OrderResponse
    {
        public string orderid { get; set; }
        public string cartid { get; set; }
        public float total { get; set; }
        public string paidthru { get; set; }
        public float paidcash { get; set; }
        public string createdby { get; set; }
        public long createdat { get; set; }
        public string status { get; set; }
        public string userid { get; set; }
    }

    public class RequestRefundResponseModel
    {

        public List<RequestRefundResponse> result { get; set; }
        public int statusCode { get; set; }
        public string message { get; set; }
    }
    public class RequestRefundResponse
    {

        public string transid { get; set; }
        public string orderid { get; set; }
        public string cartid { get; set; }
        public string code { get; set; }
        public string item { get; set; }
        public float total { get; set; }
        public string status { get; set; }
        public string image {  get; set; }
        public string image_type {  get; set; }
        public float price { get; set; }
        public long qty { get; set; }
        public long onhandqty { get; set; }
        public long createdat { get; set; }
    }
    public class BrandResponse
    {
        public string brand { get; set; }
    }    
    public class CategoryResponse
    {
        public string category { get; set; }
    }
    public class QTYResponse
    {
        public Int32 qty { get; set; }
        public bool success { get; set; } 
    }
    public class OrderInfoResponse
    {
        public string? transid { get; set; }
        public string orderid { get; set; }
        public string cartid { get; set; }
        public string? paidthru { get; set; }
        public float? paidcash { get; set; }
        public string createdby { get; set; }
        public long createdat { get; set; }
        public long? updatedat { get; set; }
        public string status { get; set; }
        public string userid { get; set; }
        public string name { get; set; }
        public string address { get; set; }
        public string contactno { get; set; }
        public string type { get; set; }
        public string? customer_email { get; set; }
        public string? customerid { get; set; }
        public string? voucher {  get; set; }
        public float total { get; set; }
        public float? totaldiscount { get; set; }
    }

    public class ItemOrders
    {
        public string code { get; set; }
        public string item { get; set; }
        public string category { get; set; }
        public string? brand { get; set; }
        public long qty { get; set; }
        public long onhandqty { get; set; }
        public float cost { get; set; }
        public float price { get; set; }
        public float discount_price { get; set; }
    }
    public class SelectedOrderResponse
    {
        public string orderid { get; set; }
        public string cartid { get; set; }
        public string code { get; set; }
        public string item { get; set; }
        public long qty { get; set; }
        public float price { get; set; }
        public float total { get; set; }
        public string createdby { get; set; }
        public long createdat { get; set; }
        public string status { get; set; }
    }
    public class CustomerResponse
    {
        public string customerid { get; set; }
        public string name { get; set; }
        public string address { get; set; }
        public string contactno { get; set; }
        public long createdat { get; set; }
    }
    public class DeliveryResponse
    {
        public string deliveryid { get; set; }
        public string path { get; set; }
        public string deliveredby { get; set; }
        public long deliverydate { get; set; }
    }
    public class VoucherResponse
    {
        public int id { get; set; }

        public string vouchercode { get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public double discount { get; set; }
        public int maxredemption { get; set; }
        public string type { get; set; }
        public string voucher_for { get; set; }


    }
    public class SalesResponse
    {   
        public string code { get; set; }
        public string item { get; set; }
        public int qty { get; set; }
        public int cost { get; set; }
        public int price { get; set; }
        public string total_cost { get; set; }
        public string total_sales { get; set; }
        public string total_discount { get; set; }
        public string profit { get; set; }
    }
    public class ReturnSalesResponse
    {
        public string code { get; set; }
        public string item { get; set; }
        public int qty { get; set; }
        public float price { get; set; }

        public string total_sales { get; set; }
    }
    public class InventoryLogsResponse
    {
        public string code { get; set; }
        public string item { get; set; }
        public string brand { get; set; }
        public int addedqty { get; set; }
        public int onhandqty { get; set; }
        public string company { get; set; }
        public string received_date { get; set; }
    }
    public class InventoryResponse
    {
        public string code { get; set; }
        public string item { get; set; }
        public int onhandqty { get; set; }
        public int soldqty { get; set; }
        public decimal cost { get; set; }
        public decimal price { get; set; }

    }
    public class AgedReceivableResponse
    {
        public string orderid { get; set; }
        public string transid { get; set; }
        public int total { get; set; }
        public long createdat { get; set; }
        public string contactno { get; set; }
        public string customer_email { get; set; }
        public string customer { get; set; }
        public string paidthru { get; set; }
        public int total_days { get; set; }

    }
}
    