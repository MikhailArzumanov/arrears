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
    public class MagistersController : ControllerBase {
        private ApplicationContext db;
        private IConfiguration config;
        
        const string AUTH_ERROR                  = "Авторизационные данные некорректны.";
        const string DEPARTMENT_NOT_FOUND        = "Заданная для преподавателя кафедра не найдена.";
        const string AUTH_NOT_FOUND              = "Запись с заданными авторизационными данными отсутствует.";
        const string ID_NOT_FOUND                = "Запись с заданным идентификатором не найдена.";
        const string DEPARTMENT_HAS_NO_MAGISTERS = "У данной кафедры нет преподавателей.";
        const string LOGIN_OCCUPIED              = "Логин занят.";
        const string TOKEN_TYPE = "group";
        const string AUTH_TYPE  = "group";

        public MagistersController(ApplicationContext context, IConfiguration config) {
            this.db = context;
            this.config = config;
        }

        [HttpPost("token")]
        public IActionResult Login([FromBody] AuthData data){
            var login    = data.Login;
            var password = PasswordHasher.Hash(data.Password);
            var entry = db.Magisters.Include(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Login == login && x.Password == password);
            if (entry == null) return NotFound(AUTH_NOT_FOUND);
            var token = TokenHandler.BuildToken(new string[] { TOKEN_TYPE }, config);
            return Ok(new { token = token, authData = data, type=AUTH_TYPE, magister=entry });
        }
        [HttpGet("by_department")]
        public IActionResult GetFirstByDepartment([FromQuery] int departmentId){
            var magister = db.Magisters.Include(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.DepartmentId == departmentId);
            if (magister == null) return NotFound(DEPARTMENT_HAS_NO_MAGISTERS);
            return Ok(magister);
        }

        [HttpGet("list")]
        public IActionResult GetList([FromQuery] int facultyId, [FromQuery] int departmentId,
                                     [FromQuery] string searchSurname, [FromQuery] string searchName, [FromQuery] string searchPatronymicName,
                                     [FromQuery] int pageNum = 1, [FromQuery] int pageSize = 20) {
            var magisters = db.Magisters.Include(x => x.Department).ThenInclude(x => x.Faculty).ToArray();
            if (facultyId    != 0) magisters = magisters.Where(x => x.Department.FacultyId == facultyId).ToArray();
            if (departmentId != 0) magisters = magisters.Where(x => x.DepartmentId == departmentId).ToArray();
            if (searchSurname        != null) magisters = magisters.Where(x => x.Name.Contains(searchSurname       )).ToArray();
            if (searchName           != null) magisters = magisters.Where(x => x.Name.Contains(searchName          )).ToArray();
            if (searchPatronymicName != null) magisters = magisters.Where(x => x.Name.Contains(searchPatronymicName)).ToArray();
            var fullSize = magisters.Count();
            var pagesAmount = fullSize / pageSize + (fullSize % pageSize != 0 ? 1 : 0);
            if(pageNum != 0) magisters = magisters.Skip((pageNum - 1) * pageSize).Take(pageSize).ToArray();
            return Ok(new { magisters = magisters, pagesAmount = pagesAmount });
        }
        
        [HttpPost("{id}")]
        public IActionResult GetConcrete([FromRoute] int id, [FromBody] AuthData authData, [FromQuery] string authType){
            var magister = db.Magisters.Include(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            if (!AuthValidation.isAuthValid(magister, authData, authType, false))
                return BadRequest(AUTH_ERROR);
            return Ok(FullMagister.fromDefault(magister));
        }

        [HttpPost("add")]
        public IActionResult AddEntry([FromBody] MagisterRedactionRequest request, [FromQuery] string authType){
            var department = db.Departments.Include(x => x.Faculty).FirstOrDefault(x => x.Id == request.magisterData.DepartmentId);
            if (department == null) return NotFound(DEPARTMENT_NOT_FOUND);
            if (!AuthValidation.isAuthValid(department, request.authData, authType, true)) 
                return BadRequest(AUTH_ERROR);
            var LoginGen = new LoginGen();
            while(db.Magisters.Any(x => x.Login == request.magisterData.Login)){
                request.magisterData.Login = LoginGen.Next();
            }
            Magister result = db.Magisters.Add(request.magisterData.toDefault()).Entity;
            db.SaveChanges();
            result = db.Magisters.Include(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == result.Id);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public IActionResult RedactEntry([FromRoute] int id, [FromBody] MagisterRedactionRequest request, [FromQuery] string authType){
            var previous = db.Magisters.Include(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            if (previous == null) return NotFound(ID_NOT_FOUND);
            if(!AuthValidation.isAuthValid(previous, request.authData, authType)) return BadRequest(AUTH_ERROR);
            var intersection = db.Magisters.FirstOrDefault(x => x.Id != previous.Id && x.Login == request.magisterData.Login);
            if (intersection != null) return BadRequest(LOGIN_OCCUPIED);
            previous.Login     = request.magisterData.Login;
            previous.Password  = PasswordHasher.Hash(request.magisterData.Password);
            switch(authType){
                case "faculty":
                    var isDepartmentIdValid = db.Departments.Any(x => x.Id == request.magisterData.DepartmentId);
                    if (!isDepartmentIdValid) return NotFound(DEPARTMENT_NOT_FOUND);
                    previous.Surname        = request.magisterData.Surname;
                    previous.Name           = request.magisterData.Name;
                    previous.PatronymicName = request.magisterData.PatronymicName;
                    previous.DepartmentId = request.magisterData.DepartmentId;
                    break;
                case "department":
                    previous.Surname = request.magisterData.Surname;
                    previous.Name = request.magisterData.Name;
                    previous.PatronymicName = request.magisterData.PatronymicName;
                    break;
            }
            db.Magisters.Update(previous);
            db.SaveChanges();
            return Ok(previous);
        }
        
        [HttpDelete("{id}")]
        public IActionResult RemoveEntry([FromRoute] int id, [FromBody] AuthData authData, [FromQuery] string authType){
            var magister = db.Magisters.Include(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            if (magister == null) return NotFound(ID_NOT_FOUND);
            if (!AuthValidation.isAuthValid(magister, authData, authType, false))
                return BadRequest(AUTH_ERROR);
            db.Magisters.Remove(magister);
            db.SaveChanges();
            return Ok(magister);
        }

        [HttpGet("admin/{id}")]
        public IActionResult GetConcreteAsAdministrator([FromRoute] int id){
            var magister = db.Magisters.Include(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            return Ok(FullMagister.fromDefault(magister));
        }

        [HttpPut("admin/{id}")]
        public IActionResult RedactAsAdministrator([FromRoute] int id, [FromBody] FullMagister request){
            var previous = db.Magisters.FirstOrDefault(x => x.Id == id);
            if (previous == null) return NotFound(ID_NOT_FOUND);
            var isDepartmentIdValid = db.Departments.Any(x => x.Id == request.DepartmentId);
            if (!isDepartmentIdValid) return NotFound(DEPARTMENT_NOT_FOUND);
            previous.Login          = request.Login;
            previous.Password       = PasswordHasher.Hash(request.Password);
            previous.Surname        = request.Surname;
            previous.Name           = request.Name;
            previous.PatronymicName = request.PatronymicName;
            previous.DepartmentId   = request.DepartmentId;
            db.Magisters.Update(previous);
            db.SaveChanges();
            return Ok(previous);
        }

        [HttpPost("admin/add")]
        public IActionResult AddAsAdministrator([FromBody] FullMagister magister){
            var isDepartmentIdValid = db.Departments.Any(x => x.Id == magister.DepartmentId);
            if (!isDepartmentIdValid) return NotFound(DEPARTMENT_NOT_FOUND);
            var LoginGen = new LoginGen();
            while(db.Magisters.Any(x => x.Login == magister.Login)){
                magister.Login = LoginGen.Next();
            }
            Magister result = db.Magisters.Add(magister.toDefault()).Entity;
            db.SaveChanges();
            result = db.Magisters.Include(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == result.Id);
            return Ok(result);
        }

        [HttpDelete("admin/{id}")]
        public IActionResult RemoveAsAdministrator([FromRoute] int id){
            var department = db.Magisters.FirstOrDefault(x => x.Id == id);
            if (department == null) return NotFound(ID_NOT_FOUND);
            db.Magisters.Remove(department);
            db.SaveChanges();
            return Ok(department);
        }


        public class MagisterRedactionRequest {
            public AuthData authData { get; set; }
            public FullMagister magisterData { get; set; }
        }
    }
}
