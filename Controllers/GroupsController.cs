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
    public class GroupsController : ControllerBase {
        private ApplicationContext db;
        private IConfiguration config;

        const string AUTH_ERROR = "Авторизационные данные некорректны.";

        public GroupsController(ApplicationContext context, IConfiguration config) {
            this.db = context;
            this.config = config;
        }

        [HttpPost("token")]
        public IActionResult Login([FromBody] AuthData data){
            var login    = data.Login;
            var password = Utils.PasswordHasher.Hash(data.Password);
            var entry = db.Groups.Include(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Login == login && x.Password == password);
            if (entry == null) return NotFound("Кафедра с заданным авторизационными данными отсутствует.");
            var token = TokenHandler.BuildToken(new string[] { "group" }, config);
            return Ok(new { token = token, authData = data, type="group", group=entry });
        }
        [HttpGet("by_department")]
        public IActionResult GetFirstByDepartment([FromQuery] int departmentId){
            var group = db.Groups.Include(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.DepartmentId == departmentId);
            if (group == null) return NotFound("У данной кафедры нет групп");
            return Ok(group);
        }

        [HttpGet("list")]
        public IActionResult GetList([FromQuery] int facultyId, [FromQuery] int departmentId, [FromQuery] string searchVal, 
                                     [FromQuery] int pageNum = 1, [FromQuery] int pageSize = 20) {
            var groups = db.Groups.Include(x => x.Department).ThenInclude(x => x.Faculty).ToArray();
            if (facultyId    != 0) groups = groups.Where(x => x.Department.FacultyId == facultyId   ).ToArray();
            if (departmentId != 0) groups = groups.Where(x => x.DepartmentId         == departmentId).ToArray();
            if (searchVal != null) groups = groups.Where(x => x.Name.Contains(searchVal)            ).ToArray();
            var fullSize = groups.Count();
            var pagesAmount = fullSize / pageSize + (fullSize % pageSize != 0 ? 1 : 0);
            if(pageNum != 0) groups = groups.Skip((pageNum - 1) * pageSize).Take(pageSize).ToArray();
            return Ok(new { groups = groups, pagesAmount = pagesAmount });
        }
        
        [HttpPost("{id}")]
        public IActionResult GetConcrete([FromRoute] int id, [FromBody] AuthData authData, [FromQuery] string authType){
            var group = db.Groups.Include(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            if (!AuthValidation.isAuthValid(group, authData, authType, false))
                return BadRequest(AUTH_ERROR);
            return Ok(FullGroup.fromDefault(group));
        }

        [HttpPost("add")]
        public IActionResult AddEntry([FromBody] GroupRedactionRequest request, [FromQuery] string authType){
            var department = db.Departments.Include(x => x.Faculty).FirstOrDefault(x => x.Id == request.groupData.DepartmentId);
            if (department == null) return NotFound("Кафедра заданной группы не найдена.");
            if (!AuthValidation.isAuthValid(department, request.authData, authType, true)) 
                return BadRequest(AUTH_ERROR);
            var LoginGen = new LoginGen();
            while(db.Groups.Any(x => x.Login == request.groupData.Login)){
                request.groupData.Login = LoginGen.Next();
            }
            Group result = db.Groups.Add(request.groupData.toDefault()).Entity;
            db.SaveChanges();
            result = db.Groups.Include(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == result.Id);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public IActionResult RedactEntry([FromRoute] int id, [FromBody] GroupRedactionRequest request, [FromQuery] string authType){
            var previous = db.Groups.Include(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            if (previous == null) return NotFound("Кафедра с заданным идентификатором не найдена.");
            if(!AuthValidation.isAuthValid(previous, request.authData, authType)) return BadRequest(AUTH_ERROR);
            var intersection = db.Groups.FirstOrDefault(x => x.Id != previous.Id && x.Login == request.groupData.Login);
            if (intersection != null) return BadRequest("Логин занят.");
            previous.Login     = request.groupData.Login;
            previous.Password  = Utils.PasswordHasher.Hash(request.groupData.Password);
            switch(authType){
                case "faculty":
                    previous.Name = request.groupData.Name;
                    previous.DepartmentId = request.groupData.DepartmentId;
                    break;
                case "department":
                    previous.Name = request.groupData.Name;
                    break;
            }
            db.Groups.Update(previous);
            db.SaveChanges();
            return Ok(previous);
        }
        
        [HttpDelete("{id}")]
        public IActionResult RemoveEntry([FromRoute] int id, [FromBody] AuthData authData, [FromQuery] string authType){
            var group = db.Groups.Include(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            if (group == null) return NotFound("Кафдера с заданным идентификатором не найдена.");
            if (!AuthValidation.isAuthValid(group, authData, authType, false))
                return BadRequest(AUTH_ERROR);
            db.Groups.Remove(group);
            db.SaveChanges();
            return Ok(group);
        }

        [HttpGet("admin/{id}")]
        public IActionResult GetConcreteAsAdministrator([FromRoute] int id){
            var group = db.Groups.Include(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            return Ok(FullGroup.fromDefault(group));
        }

        [HttpPut("admin/{id}")]
        public IActionResult RedactAsAdministrator([FromRoute] int id, [FromBody] FullGroup request){
            var previous = db.Groups.FirstOrDefault(x => x.Id == id);
            if (previous == null) return NotFound("Кафедра с заданным идентификатором не найдена.");
            previous.Login        = request.Login;
            previous.Password     = PasswordHasher.Hash(request.Password);
            previous.Name         = request.Name;
            previous.DepartmentId = request.DepartmentId;
            db.Groups.Update(previous);
            db.SaveChanges();
            return Ok(previous);
        }

        [HttpPost("admin/add")]
        public IActionResult AddAsAdministrator([FromBody] FullGroup group){
            var LoginGen = new LoginGen();
            while(db.Groups.Any(x => x.Login == group.Login)){
                group.Login = LoginGen.Next();
            }
            Group result = db.Groups.Add(group.toDefault()).Entity;
            db.SaveChanges();
            result = db.Groups.Include(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == result.Id);
            return Ok(result);
        }

        [HttpDelete("admin/{id}")]
        public IActionResult RemoveAsAdministrator([FromRoute] int id){
            var group = db.Groups.FirstOrDefault(x => x.Id == id);
            if (group == null) return NotFound("Кафдера с заданным идентификатором не найдена.");
            db.Groups.Remove(group);
            db.SaveChanges();
            return Ok(group);
        }


        public class GroupRedactionRequest {
            public AuthData authData { get; set; }
            public FullGroup groupData { get; set; }
        }
    }
}
