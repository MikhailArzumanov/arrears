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
    public class FacultiesController : ControllerBase {
        private ApplicationContext db;
        private IConfiguration config;

        const string AUTH_ERROR     = "Авторизационные данные некорректны.";
        const string ID_NOT_FOUND   = "Институт с заданным идентификатором не найден.";
        const string AUTH_NOT_FOUND = "Институт с заданным авторизационными данными отсутствует.";
        const string LOGIN_OCCUPIED = "Логин занят.";
        const string TOKEN_TYPE = "faculty";
        const string AUTH_TYPE  = "faculty";

        public FacultiesController(ApplicationContext context, IConfiguration config) {
            this.db = context;
            this.config = config;
        }

        [HttpPost("token")]
        public IActionResult Login([FromBody] AuthData data){
            var login    = data.Login;
            var password = PasswordHasher.Hash(data.Password);
            var entry = db.Faculties.FirstOrDefault(x => x.Login == login && x.Password == password);
            if (entry == null) return NotFound(AUTH_NOT_FOUND);
            var token = TokenHandler.BuildToken(new string[] { TOKEN_TYPE}, config);
            return Ok(new { token = token, authData = data, type=AUTH_TYPE, faculty=entry });
        }

        [Authorize]
        [HttpGet("all")]
        public IActionResult GetAll() {
            var faculties = db.Faculties;
            return Ok(faculties);
        }

        [Authorize]
        [HttpPut("{id}")]
        public IActionResult RedactEntry([FromRoute] int id, [FromBody] FacultyRedactionRequest request){
            var previous = db.Faculties.FirstOrDefault(x => x.Id == id);
            if (previous == null) return NotFound(ID_NOT_FOUND);
            if (!AuthValidation.isAuthValid(previous,request.authData))
                return BadRequest(AUTH_ERROR);
            var intersection = db.Faculties.FirstOrDefault(x => x.Id != previous.Id && x.Login == request.facultyData.Login);
            if (intersection != null) return BadRequest(LOGIN_OCCUPIED);
            previous.Login     = request.facultyData.Login;
            previous.Password  = PasswordHasher.Hash(request.facultyData.Password);
            //previous.Name      = request.facultyData.Name;
            //previous.ShortName = request.facultyData.ShortName;
            db.Faculties.Update(previous);
            db.SaveChanges();
            return Ok(previous);
        }

        [Authorize(Roles = "admin")]
        [HttpGet("admin/{id}")]
        public IActionResult GetConcrete([FromRoute] int id){
            var faculty = db.Faculties.FirstOrDefault(x => x.Id == id);
            return Ok(FullFaculty.fromDefault(faculty));
        }

        [Authorize(Roles = "admin")]
        [HttpPut("admin/{id}")]
        public IActionResult RedactAsAdministrator([FromRoute] int id, [FromBody] FullFaculty request){
            var previous = db.Faculties.FirstOrDefault(x => x.Id == id);
            if (previous == null) return NotFound(ID_NOT_FOUND);
            previous.Login     = request.Login;
            previous.Password  = PasswordHasher.Hash(request.Password);
            previous.Name      = request.Name;
            previous.ShortName = request.ShortName;
            db.Faculties.Update(previous);
            db.SaveChanges();
            return Ok(previous);
        }

        [Authorize(Roles = "admin")]
        [HttpPost("admin/add")]
        public IActionResult AddEntry([FromBody] FullFaculty faculty){
            var LoginGen = new LoginGen();
            while(db.Faculties.Any(x => x.Login == faculty.Login)){
                faculty.Login = LoginGen.Next();
            }
            var facultyEntry = faculty.toDefault();
            db.Faculties.Add(facultyEntry);
            db.SaveChanges();
            faculty.Id = facultyEntry.Id;
            return Ok(faculty);
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("admin/{id}")]
        public IActionResult RemoveEntry([FromRoute] int id){
            var faculty = db.Faculties.FirstOrDefault(x => x.Id == id);
            if (faculty == null) return NotFound(ID_NOT_FOUND);
            db.Faculties.Remove(faculty);
            db.SaveChanges();
            return Ok(faculty);
        }


        public class FacultyRedactionRequest{
            public AuthData authData { get; set; }
            public FullFaculty facultyData { get; set; }
        }
    }
}
