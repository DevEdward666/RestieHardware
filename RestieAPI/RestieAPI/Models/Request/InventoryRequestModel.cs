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
    }
}
