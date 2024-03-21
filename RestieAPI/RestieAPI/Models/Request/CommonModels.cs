using Npgsql;

namespace RestieAPI.Models.Request
{
    public class CommonModels
    {
        public class ResponseModelNonQuery{

            public int reader { get; set; }
            public Boolean success { get; set; }
            public int statusCode { get; set; }
        }
        public class ResponseModelReader
        {

            public NpgsqlDataReader reader { get; set; }
            public Boolean success { get; set; }
            public int statusCode { get; set; }
        }
        
    }
}
