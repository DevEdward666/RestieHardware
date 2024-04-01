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
    }
}
