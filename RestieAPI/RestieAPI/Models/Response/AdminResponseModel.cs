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
        public class AdminVoucherResponseModel
        {
            public List<Vouchers> result { get; set; }
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

        public class Vouchers
        {
            public int voucher_seq { get; set; }
            public string vouchercode { get; set; }
            public string name { get; set; }
            public string description { get; set; }
            public string voucher_for { get; set; }
            public string type  { get; set; }
            public float discount{ get; set; }
            public string createdby { get; set; }
            public long createdat { get; set; }
            public long maxredemption { get; set; }
        }
    }
}
