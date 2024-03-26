namespace RestieAPI.Models.Response
{
    public class PostResponse
    {
        public SaveOrderResponse result { get; set; }
        public int status { get; set; }
        public string Message { get; set; }
    }

    public class SaveOrderResponse {
        public string orderid { get; set; }
        public string cartid { get; set; }

    }
}
