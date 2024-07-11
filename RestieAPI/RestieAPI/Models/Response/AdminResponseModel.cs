namespace RestieAPI.Models.Response
{
    public class AdminResponseModel
    {
        public class SupplierResponseModel
        {
            public List<Suppliers> result { get; set; }
            public Boolean success { get; set; }
            public int statusCode { get; set; }
        }
        public class Suppliers
        {
            public string supplierid { get; set; }
            public string company { get; set; }
            public long contactno { get; set; }
            public string address { get; set; }
            public long createdat { get; set; }
        }
    }
}
