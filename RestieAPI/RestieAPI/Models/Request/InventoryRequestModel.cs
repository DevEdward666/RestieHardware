namespace RestieAPI.Models.Request
{
    public class InventoryRequestModel
    {
        public class GetAllInventory {

            public Int32 offset { get; set; }

            public Int32 page { get; set; }
            public Int32 limit { get; set; }
            public string searchTerm {  get; set; }

        }
        public class PostInventory
        {
            public Guid logid { get; set; }
            public string code { get; set; }
            public long onhandqty  { get; set; }
            public long addedqty { get; set; }
            public Guid supplierid { get; set; }
            public float cost { get; set; }
            public float price { get; set; }
            public long createdat { get; set; }
          

        }
        public class PostCustomerInfo
        {
            public string customerid { get; set; }
            public string name { get; set; }
            public string contactno { get; set; }
            public string address { get; set; }
            public long createdat { get; set; }


        }
        public class GetUserOrder
        {
            public string userid { get; set; }
            public Int32 limit { get; set; }
            public Int32 offset { get; set; }

        }
        public class GetCustomer
        {
            public string customerid { get; set; }

        }
        public class GetSelectedOrder 
        {
            public string userid { get; set; }
            public string? cartid { get; set; }
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
            public string? type { get; set; }

        }
    }
}
