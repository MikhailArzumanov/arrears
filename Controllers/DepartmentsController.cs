using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
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
    public class DepartmentsController : ControllerBase {
        private ApplicationContext db;
        private IConfiguration config;

        const string AUTH_ERROR = "Авторизационные данные некорректны.";

        public DepartmentsController(ApplicationContext context, IConfiguration config) {
            this.db = context;
            this.config = config;
        }

        [HttpPost("token")]
        public IActionResult Login([FromBody] AuthData data) {
            var login = data.Login;
            var password = PasswordHasher.Hash(data.Password);
            var entry = db.Departments.Include(x => x.Faculty).FirstOrDefault(x => x.Login == login && x.Password == password);
            if (entry == null) return NotFound("Кафедра с заданным авторизационными данными отсутствует.");
            var token = TokenHandler.BuildToken(new string[] { "department" }, config);
            return Ok(new { token = token, authData = data, type = "department", department = entry });
        }

        [HttpGet("list")]
        public IActionResult GetList([FromQuery] int facultyId) {
            var departments = db.Departments.Include(x => x.Faculty).ToArray();
            if (facultyId != 0) departments = departments.Where(x => x.FacultyId == facultyId).ToArray();
            return Ok(departments);
        }


        [HttpPost("get/{id}")]
        public IActionResult GetConcrete([FromRoute] int id, [FromBody] AuthData authData){
            var department = db.Departments.Include(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            if (department == null) return NotFound("кафедра с заданным идентификатором не найдена.");
            var login = authData.Login;
            var password = PasswordHasher.Hash(authData.Password);
            if (department.Faculty.Login != login || department.Faculty.Password != password)
                return BadRequest(AUTH_ERROR);
            return Ok(FullDepartment.fromDefault(department));
        }

        [HttpGet("by_faculty")]
        public IActionResult GetFirstByFaculty([FromQuery] int facultyId){
            var department = db.Departments.Include(x => x.Faculty).FirstOrDefault(x => x.FacultyId == facultyId);
            if (department == null) return NotFound("У данного института нет кафедр");
            return Ok(department);
        }
        [HttpPost("add")]
        public IActionResult AddEntry([FromBody] DepartmentRedactionRequest request){
            var faculty = db.Faculties.FirstOrDefault(x => x.Id == request.departmentData.FacultyId);
            if (faculty == null) return NotFound("Институт заданной кафедры не найден.");

            if (!AuthValidation.isAuthValid(faculty, request.authData))
                return BadRequest(AUTH_ERROR);
            var LoginGen = new LoginGen();
            while(db.Departments.Any(x => x.Login == request.departmentData.Login)){
                request.departmentData.Login = LoginGen.Next();
            }
            Department result = db.Departments.Add(request.departmentData.toDefault()).Entity;
            db.SaveChanges();
            result = db.Departments.Include(x => x.Faculty).FirstOrDefault(x => x.Id == result.Id);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public IActionResult RedactEntry([FromRoute] int id, [FromBody] DepartmentRedactionRequest request, [FromQuery] string authType){
            var previous = db.Departments.Include(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            if (previous == null) return NotFound("Кафедра с заданным идентификатором не найдена.");
            if (!AuthValidation.isAuthValid(previous, request.authData, authType, true))
                return BadRequest(AUTH_ERROR);
            var intersection = db.Departments.FirstOrDefault(x => x.Id != previous.Id && x.Login == request.departmentData.Login);
            if (intersection != null) return BadRequest("Логин занят.");
            previous.Login     = request.departmentData.Login;
            previous.Password  = Utils.PasswordHasher.Hash(request.departmentData.Password);
            if (authType != "department"){
                previous.Name = request.departmentData.Name;
                previous.ShortName = request.departmentData.ShortName;
                //previous.FacultyId = request.departmentData.FacultyId;
            }
            db.Departments.Update(previous);
            db.SaveChanges();
            return Ok(previous);
        }
        
        [HttpDelete("{id}")]
        public IActionResult RemoveEntry([FromRoute] int id, [FromBody] AuthData authData){
            var department = db.Departments.Include(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            if (department == null) return NotFound("Кафдера с заданным идентификатором не найдена.");
            var login = authData.Login; var password = PasswordHasher.Hash(authData.Password);
            if (department.Faculty.Login != login || department.Faculty.Password != password)
                return BadRequest(AUTH_ERROR);
            db.Departments.Remove(department);
            db.SaveChanges();
            return Ok(department);
        }

        
        [HttpGet("{id}")]
        public IActionResult GetConcreteAsAdministartor([FromRoute] int id, [FromQuery] string authType){
            var department = db.Departments.Include(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            return Ok(FullDepartment.fromDefault(department));
        }

        [HttpPut("admin/{id}")]
        public IActionResult RedactAsAdministrator([FromRoute] int id, [FromBody] FullDepartment request){
            var previous = db.Departments.FirstOrDefault(x => x.Id == id);
            if (previous == null) return NotFound("Кафедра с заданным идентификатором не найдена.");
            previous.Login     = request.Login;
            previous.Password  = PasswordHasher.Hash(request.Password);
            previous.Name      = request.Name;
            previous.ShortName = request.ShortName;
            previous.FacultyId = request.FacultyId;
            db.Departments.Update(previous);
            db.SaveChanges();
            return Ok(previous);
        }

        [HttpPost("admin/add")]
        public IActionResult AddAsAdministrator([FromBody] FullDepartment department){
            var LoginGen = new LoginGen();
            while(db.Departments.Any(x => x.Login == department.Login)){
                department.Login = LoginGen.Next();
            }
            Department result = db.Departments.Add(department.toDefault()).Entity;
            db.SaveChanges();
            result = db.Departments.Include(x => x.Faculty).FirstOrDefault(x => x.Id == result.Id);
            return Ok(result);
        }

        [HttpDelete("admin/{id}")]
        public IActionResult RemoveAsAdministrator([FromRoute] int id){
            var department = db.Departments.FirstOrDefault(x => x.Id == id);
            if (department == null) return NotFound("Кафдера с заданным идентификатором не найдена.");
            db.Departments.Remove(department);
            return Ok(department);
        }


        public class DepartmentRedactionRequest {
            public AuthData authData { get; set; }
            public FullDepartment departmentData { get; set; }
        }
    }
}
