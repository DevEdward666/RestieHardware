namespace RestieAPI.Models.Request
{
    public class UserRequestModel
    {
        public class GetAuthuser
        {
            public string username { get; set; }
            public int totalUser { get; set; }
        }
        public class Authuser
        {
            public string username { get; set; }
            public string password { get; set; }
        }
    }
}
