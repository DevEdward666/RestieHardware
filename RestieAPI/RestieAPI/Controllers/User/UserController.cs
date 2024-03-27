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

        [HttpGet("api/user/userinfo")]
        [Authorize]
        public ActionResult<LoginInfo> GetUserInfo()
        {
            try
            {
                // Retrieve claims from the current user's identity
                var user = HttpContext.User;
                if (user == null)
                {
                    return Unauthorized();
                }

                // Extract specific claims (name, role, username)
                var nameClaim = user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;
                var roleClaim = user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;
                var usernameClaim = user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.UserData)?.Value;

                // Return the claims as UserInfo object
                var userInfo = new LoginInfo
                {
                    name = nameClaim,
                    role = roleClaim,
                    username = usernameClaim
                };

                return Ok(userInfo);
            }
            catch (Exception ex)
            {
                // Handle exceptions if any
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    

        [HttpPost]
        [Route("api/user/login")]
        public ActionResult login(Authuser cred)
        {

            List<GetAuthuser> user = _userRepo.authenticateUser(cred);

            int userLength = user.Count;

            if (userLength > 0)
            {

                var claims = new Claim[user.Count +1];



                for (int i = 0; i < user.Count; i++)
                {
                    claims[i] = new Claim(ClaimTypes.Email, user[i].username);
                    claims[i] = new Claim(ClaimTypes.Role, user[i].role);
                    claims[i] = new Claim(ClaimTypes.Name, user[i].name);
                }

                claims[user.Count] = new Claim(ClaimTypes.Email, user[userLength - 1].username);
                claims[user.Count] = new Claim(ClaimTypes.Name, user[userLength - 1].name);
                claims[user.Count] = new Claim(ClaimTypes.Role, user[userLength - 1].role);

                var jwtResult = _jwtAuthManager.GenerateTokens(user[userLength - 1].username, claims, DateTime.Now);
                //var jwtResult = _jwtAuthManager.GenerateTokens(user[userLength - 1].username, claims, DateTime.Now);
                var loginUserInfo = new LoginInfo
                {
                    username = jwtResult.loginInfo.user_name,
                    name = jwtResult.loginInfo.name,
                    role = jwtResult.loginInfo.role,
                };
                return Ok(new userAuth
                {
                        loginInfo = loginUserInfo,
                        AccessToken = jwtResult.AccessToken,
                        RefreshToken = jwtResult.RefreshToken.TokenString
                    
                });

            }
            else
            {
                return Ok(new { success = false, message = "The username and/or password you entered is not correct. Please try again," });
            }
        }
     

        [HttpGet("api/user/logout")]
        [Authorize]
        public ActionResult logout()
        {
            var userName = User.Identity.Name;
            _jwtAuthManager.RemoveRefreshTokenByUserName(userName);

            return Ok();
        }




    }
}
