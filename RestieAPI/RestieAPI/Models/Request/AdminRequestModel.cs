namespace RestieAPI.Models.Request
{
    public class AdminRequestModel
    {
        public class GetAllSupplier
        {

            public Int32 offset { get; set; }

            public Int32 page { get; set; }
            public Int32 limit { get; set; }
            public string searchTerm { get; set; }

        }
        public class ImportOrderFromExcel
        {
            public string orderid { get; set; }
            public string cartid { get; set; }
            public Int64 total { get; set; }
            public string paidthru { get; set; }
            public float paidcash { get; set; }
            public string createdby { get; set; }
            public long createdat { get; set; }
            public long updateat { get; set; }
            public string userid { get; set; }
            public string status { get; set; }
            public string type { get; set; }
        }    
        public class ImportCartFromExcel
        {
            public string cartid { get; set; }
            public string code { get; set; }
            public string item { get; set; }
            public Int64 qty { get; set; }
            public float price { get; set; }
            public float total { get; set; }
            public long createdat { get; set; }
            public long updateat { get; set; }
            public string status { get; set; }
        }
        public class FileForExcel
        {
            public IFormFile File { get; set; }
        }
    }
}
