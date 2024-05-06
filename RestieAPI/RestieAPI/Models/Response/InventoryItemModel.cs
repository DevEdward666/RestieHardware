using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.Numerics;

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
    public class OrderInfoResponseModel
    {
        public List<ItemOrders> order_item { get; set; }
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
    public class VoucherResponseModel
    {
        public VoucherResponse result { get; set; }
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
    public class InventoryItems
    {
        public string code { get; set; }
        public string item { get; set; }
        public string category { get; set; }
        public string? brand { get; set; }
        public long qty { get; set; }
        public long reorderqty { get; set; }
        public float cost { get; set; }
        public float price { get; set; }
        public string status { get; set; }
        public string image { get; set; }
        public long createdat { get; set; }
        public long updatedat { get; set; }
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
    public class BrandResponse
    {
        public string brand { get; set; }
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
        public float total { get; set; }
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
        public string name { get; set; }
        public string description { get; set; }
        public decimal discount { get; set; }
        public int maxredemption { get; set; }
    }
    public class SalesResponse
    {   
        public string code { get; set; }
        public string item { get; set; }
        public int qty { get; set; }
        public string total_sales { get; set; }
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
}
    