using Npgsql;
using System.Numerics;

namespace RestieAPI.Models.Response
{
    public class InventoryItemModel
    {
        public List<InventoryItems> result { get; set; }
        public Boolean success {  get; set; }
        public int statusCode { get; set; }
    }
    public class OrderResponseModel
    {
        public List<OrderResponse> result { get; set; }
        public Boolean success { get; set; }
        public int statusCode { get; set; }
    }
    public class InventoryItems
    {
        public string code { get; set; }
        public string item { get; set; }
        public string category { get; set; }
        public long qty { get; set; }
        public long reorderqty { get; set; }
        public float cost { get; set; }
        public float price { get; set; }
        public string status { get; set; }
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
        public BigInteger createdat { get; set; }
        public string status { get; set; }
        public string userid { get; set; }
    }


}
