using RestieAPI.Configs;
using RestieAPI.Models.Request;
using RestieAPI.Models.Response;
using static RestieAPI.Models.Request.UserRequestModel;

namespace RestieAPI.Service.Repo
{
    public class UserRepo
    {
        public IConfiguration configuration;
        private readonly DatabaseService _databaseService;

        public UserRepo(IConfiguration configuration)
        {
            this.configuration = configuration;
            _databaseService = new DatabaseService(configuration);
        }
        public GetAuthuser authenticateUser(Authuser authuser)
        {
          
            var sql = @"SELECT * FROM useraccount WHERE username = @username AND password = crypt(@password, password);";

            var parameters = new Dictionary<string, object>
            {
                { "@username", authuser.username },
                { "@password", authuser.password },
            };
            var results = new List<GetAuthuser>();
            using (var reader = _databaseService.ExecuteQuery(sql, parameters))
            {

                while (reader.Read())
                {
                    var inventoryItem = new GetAuthuser
                    {
                        username = reader.GetString(reader.GetOrdinal("username")),
                    };

                    results.Add(inventoryItem);
                }
            }
         
            return new GetAuthuser
            {
                username = results[0].username,
             totalUser = results.Count()
        };
        }
    }
}
