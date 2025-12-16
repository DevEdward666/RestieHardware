namespace RestieAPI.Models.Request
{
    public class UserRequestModel
    {
        public class GetAuthuser
        {
            public string username { get; set; }
            public string name { get; set; }
            public string role { get; set; }
            public string id { get; set; }
            public int totalUser { get; set; }
        }
        public class Adduser
        {
            public string username { get; set; }
            public string name { get; set; }
            public string password { get; set; }
            public string role { get; set; }
            public string id { get; set; }
            public int totalUser { get; set; }
        }

        public class Authuser
        {
            public string username { get; set; }
            public string password { get; set; }
        }
    }
}
