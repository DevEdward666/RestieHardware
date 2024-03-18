using RestieAPI.Providers;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Threading.Tasks;
using RestieAPI.Service.Repo;
using static RestieAPI.Models.Request.UserRequestModel;
using static RestieAPI.Models.Response.UserResponseModel;

namespace RestieAPI.Controllers
{
    [ApiController]
    public class UserController : ControllerBase
    {
        public IConfiguration configuration;
        UserRepo _userRepo;

        private readonly IJwtAuthManager _jwtAuthManager;

        public UserController(IJwtAuthManager jwtAuthManager, IConfiguration configuration)
        {
            this.configuration = configuration;
            _userRepo = new UserRepo(configuration);
            _jwtAuthManager = jwtAuthManager;
        }


        [HttpPost]
        [Route("api/user/login")]
        public ActionResult login(Authuser cred)
        {

            GetAuthuser user = _userRepo.authenticateUser(cred);

            int userLength = user.totalUser;

            if (userLength > 0)
            {

                var claims = new Claim[user.totalUser + 1];



                for (int i = 0; i < user.totalUser; i++)
                {
                    claims[i] = new Claim(ClaimTypes.Role, user.username);
                }

                claims[user.totalUser] = new Claim(ClaimTypes.Name, user.username);

                var jwtResult = _jwtAuthManager.GenerateTokens(user.username, claims, DateTime.Now);
                //var jwtResult = _jwtAuthManager.GenerateTokens(user[userLength - 1].username, claims, DateTime.Now);

                return Ok(new userAuth
                {
                    
                        AccessToken = jwtResult.AccessToken,
                        RefreshToken = jwtResult.RefreshToken.TokenString
                    
                });

            }
            else
            {
                return Ok(new { success = false, message = "The username and/or password you entered is not correct. Please try again," });
            }
        }
     

        [HttpGet]
        [Route("api/user/logout")]
        public ActionResult logout()
        {
            var userName = User.Identity.Name;
            _jwtAuthManager.RemoveRefreshTokenByUserName(userName);

            return Ok();
        }




    }
}
