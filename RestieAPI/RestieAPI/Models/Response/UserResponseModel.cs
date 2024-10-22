namespace RestieAPI.Models.Response
{
    public class UserResponseModel
    {
        public class userAuth
        {
            public LoginInfo loginInfo { get; set; }
            public string AccessToken { get; set; }
            public string RefreshToken { get; set; }
        }
        public class LoginInfo
        {
            public string id { get; set; }
            public string username { get; set; }
            public string name { get; set; }
            public string role { get; set; }
        }
        public class PostAddUserResponse
        {
            public int status { get; set; }
            public string message { get; set; }
        }
    }
}
