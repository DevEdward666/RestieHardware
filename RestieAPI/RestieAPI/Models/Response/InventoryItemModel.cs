using Npgsql;

namespace RestieAPI.Models.Response
{
    public class InventoryItemModel
    {
        public List<InventoryItems> result { get; set; }
        public Boolean success {  get; set; }
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

}
