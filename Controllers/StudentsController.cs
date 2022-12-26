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
    public class StudentsController : ControllerBase {
        private ApplicationContext db;
        private IConfiguration config;

        const string AUTH_ERROR            = "Авторизационные данные некорректны.";
        const string ID_NOT_FOUND          = "Студент с заданным идентификатором не найден.";
        const string GROUP_NOT_FOUND       = "Заданная для студента группа не найдена";
        const string AUTH_NOT_FOUND        = "Студент с заданным авторизационными данными отсутствует.";
        const string GROUP_HAS_NO_STUDENTS = "У данной группы нет студентов";
        const string LOGIN_OCCUPIED        = "Логин занят.";
        const string TOKEN_TYPE = "student";
        const string AUTH_TYPE  = "student";

        public StudentsController(ApplicationContext context, IConfiguration config) {
            this.db = context;
            this.config = config;
        }

        [HttpPost("token")]
        public IActionResult Login([FromBody] AuthData data){
            var login    = data.Login;
            var password = PasswordHasher.Hash(data.Password);
            var entry = db.Students.Include(x => x.Group).ThenInclude(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Login == login && x.Password == password);
            if (entry == null) return NotFound(AUTH_NOT_FOUND);
            var token = TokenHandler.BuildToken(new string[] { TOKEN_TYPE }, config);
            return Ok(new { token = token, authData = data, type=AUTH_TYPE, student=entry });
        }
        
        //[HttpGet("by_group")]
        //public IActionResult GetFirstByGroup([FromQuery] int groupId){
        //    var student = db.Students.Include(x => x.Group).ThenInclude(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.GroupId == groupId);
        //    if (student == null) return NotFound(GROUP_HAS_NO_STUDENTS);
        //    return Ok(student);
        //}

        [HttpGet("list")]
        public IActionResult GetList([FromQuery] int facultyId, [FromQuery] int departmentId, [FromQuery] int groupId,
                                     [FromQuery] string searchSurname, [FromQuery] string searchName, [FromQuery] string searchPatronymicName,
                                     [FromQuery] int pageNum = 1, [FromQuery] int pageSize = 20) {
            var students = db.Students.Include(x => x.Group).ThenInclude(x => x.Department).ThenInclude(x => x.Faculty).ToArray();
            if      (groupId      != 0) students = students.Where(x => x.GroupId                    == groupId     ).ToArray();
            else if (departmentId != 0) students = students.Where(x => x.Group.DepartmentId         == departmentId).ToArray();
            else if (facultyId    != 0) students = students.Where(x => x.Group.Department.FacultyId == facultyId   ).ToArray();
            if (searchSurname        != null) students = students.Where(x => x.Name.Contains(searchSurname       )).ToArray();
            if (searchName           != null) students = students.Where(x => x.Name.Contains(searchName          )).ToArray();
            if (searchPatronymicName != null) students = students.Where(x => x.Name.Contains(searchPatronymicName)).ToArray();
            var fullSize = students.Count();
            var pagesAmount = fullSize / pageSize + (fullSize % pageSize != 0 ? 1 : 0);
            if(pageNum != 0) students = students.Skip((pageNum - 1) * pageSize).Take(pageSize).ToArray();
            return Ok(new { students = students, pagesAmount = pagesAmount });
        }
        
        [HttpPost("{id}")]
        public IActionResult GetConcrete([FromRoute] int id, [FromBody] AuthData authData, [FromQuery] string authType){
            var student = db.Students.Include(x => x.Group).ThenInclude(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            if (!AuthValidation.isAuthValid(student, authData, authType, false))
                return BadRequest(AUTH_ERROR);
            return Ok(FullStudent.fromDefault(student));
        }

        [HttpPost("add")]
        public IActionResult AddEntry([FromBody] StudentRedactionRequest request, [FromQuery] string authType){
            var group = db.Groups.Include(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == request.studentData.GroupId);
            if (group == null) return NotFound(GROUP_NOT_FOUND);
            if (!AuthValidation.isAuthValid(group, request.authData, authType, true))
                return BadRequest(AUTH_ERROR);
            var LoginGen = new LoginGen();
            while(db.Students.Any(x => x.Login == request.studentData.Login)){
                request.studentData.Login = LoginGen.Next();
            }
            Student result = db.Students.Add(request.studentData.toDefault()).Entity;
            db.SaveChanges();
            result = db.Students.Include(x => x.Group).ThenInclude(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == result.Id);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public IActionResult RedactEntry([FromRoute] int id, [FromBody] StudentRedactionRequest request, [FromQuery] string authType){
            var previous = db.Students.Include(x => x.Group).ThenInclude(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            if (previous == null) return NotFound(ID_NOT_FOUND);
            if(!AuthValidation.isAuthValid(previous, request.authData, authType)) return BadRequest(AUTH_ERROR);
            var intersection = db.Students.FirstOrDefault(x => x.Id != previous.Id && x.Login == request.studentData.Login);
            if (intersection != null) return BadRequest(LOGIN_OCCUPIED);
            previous.Login     = request.studentData.Login;
            previous.Password  = PasswordHasher.Hash(request.studentData.Password);
            switch(authType){
                case "department":
                case "faculty":
                    var isGroupIdValid = db.Groups.Any(x => x.Id == request.studentData.GroupId);
                    if (!isGroupIdValid) return NotFound(GROUP_NOT_FOUND);
                    previous.Surname        = request.studentData.Surname;
                    previous.Name           = request.studentData.Name;
                    previous.PatronymicName = request.studentData.PatronymicName;
                    previous.GroupId        = request.studentData.GroupId;
                    break;
                case "group":
                    previous.Surname = request.studentData.Surname;
                    previous.Name = request.studentData.Name;
                    previous.PatronymicName = request.studentData.PatronymicName;
                    break;
            }
            db.Students.Update(previous);
            db.SaveChanges();
            return Ok(previous);
        }
        
        [HttpDelete("{id}")]
        public IActionResult RemoveEntry([FromRoute] int id, [FromBody] AuthData authData, [FromQuery] string authType){
            var student = db.Students.Include(x => x.Group).ThenInclude(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            if (student == null) return NotFound(ID_NOT_FOUND);
            if (!AuthValidation.isAuthValid(student, authData, authType, false))
                return BadRequest(AUTH_ERROR);
            db.Students.Remove(student);
            db.SaveChanges();
            return Ok(student);
        }

        [HttpGet("admin/{id}")]
        public IActionResult GetConcreteAsAdministrator([FromRoute] int id){
            var student = db.Students.Include(x => x.Group).ThenInclude(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            return Ok(FullStudent.fromDefault(student));
        }

        [HttpPut("admin/{id}")]
        public IActionResult RedactAsAdministrator([FromRoute] int id, [FromBody] FullStudent request){
            var previous = db.Students.FirstOrDefault(x => x.Id == id);
            if (previous == null) return NotFound(ID_NOT_FOUND);
            var isGroupIdValid = db.Groups.Any(x => x.Id == request.GroupId);
            if (!isGroupIdValid) return NotFound(GROUP_NOT_FOUND);
            previous.Login          = request.Login;
            previous.Password       = PasswordHasher.Hash(request.Password);
            previous.Surname        = request.Surname;
            previous.Name           = request.Name;
            previous.PatronymicName = request.PatronymicName;
            previous.GroupId        = request.GroupId;
            db.Students.Update(previous);
            db.SaveChanges();
            return Ok(previous);
        }

        [HttpPost("admin/add")]
        public IActionResult AddAsAdministrator([FromBody] FullStudent student){
            var isGroupIdValid = db.Groups.Any(x => x.Id == student.GroupId);
            if (!isGroupIdValid) return NotFound(GROUP_NOT_FOUND);
            var LoginGen = new LoginGen();
            while(db.Students.Any(x => x.Login == student.Login)){
                student.Login = LoginGen.Next();
            }
            Student result = db.Students.Add(student.toDefault()).Entity;
            db.SaveChanges();
            result = db.Students.Include(x => x.Group).ThenInclude(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == result.Id);
            return Ok(result);
        }

        [HttpDelete("admin/{id}")]
        public IActionResult RemoveAsAdministrator([FromRoute] int id){
            var department = db.Students.FirstOrDefault(x => x.Id == id);
            if (department == null) return NotFound(ID_NOT_FOUND);
            db.Students.Remove(department);
            db.SaveChanges();
            return Ok(department);
        }


        public class StudentRedactionRequest {
            public AuthData authData { get; set; }
            public FullStudent studentData { get; set; }
        }
    }
}
