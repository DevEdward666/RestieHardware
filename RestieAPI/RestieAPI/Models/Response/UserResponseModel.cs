namespace RestieAPI.Models.Response
{
    public class UserResponseModel
    {
        public class userAuth
        {
            public string AccessToken { get; set; }
            public string RefreshToken { get; set; }
        }
    }
}
