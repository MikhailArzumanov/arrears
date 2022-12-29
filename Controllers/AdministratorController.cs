using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Cors;
using arrearsApi5_0.Models;
using arrearsApi5_0.Data;
using arrearsApi5_0.Utils;
using Microsoft.EntityFrameworkCore;

namespace arrearsApi5_0.Controllers{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("CorsAllowAny")]
    public class AdministratorController : ControllerBase {
        private ApplicationContext db;
        private IConfiguration config;

        const string AUTH_NOT_FOUND = "Администратор с заданным авторизационными данными отсутствует.";
        const string TOKEN_TYPE = "admin";
        const string AUTH_TYPE  = "admin";
        public AdministratorController(ApplicationContext context, IConfiguration config) {
            this.db = context;
            this.config = config;
        }
        [HttpPost("token")]
        public IActionResult Login([FromBody] AuthData data){
            var login    = data.Login;
            var password = PasswordHasher.Hash(data.Password);
            var entry = db.Administrators.FirstOrDefault(x => x.Login == login && x.Password == password);
            if (entry == null) return NotFound(AUTH_NOT_FOUND);
            var token = TokenHandler.BuildToken(new string[] { TOKEN_TYPE}, config);
            return Ok(new { token = token, authData = data, type=AUTH_TYPE, admin=entry });
        }
    }
}
