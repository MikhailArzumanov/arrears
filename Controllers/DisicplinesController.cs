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
    public class DisciplinesController : ControllerBase {
        private ApplicationContext db;
        private IConfiguration config;
        
        const string ID_NOT_FOUND          = "Группа с заданным идентификатором не найдена.";
        const string REMOVE_ARREARS_SHEETS = "Удалите долговые листы, связанные с дисциплиной.";
        public DisciplinesController(ApplicationContext context, IConfiguration config) {
            this.db = context;
            this.config = config;
        }

        //[HttpGet("by_group")]
        //public IActionResult GetFirstByGroup([FromQuery] int groupId){
        //    var discipline = db.Disciplines.Include(x => x.Groups).FirstOrDefault(x => x.Groups.Any(x => x.Id == groupId));
        //    if (discipline == null) return NotFound(GROUP_HAS_NO_DISCIPLINES);
        //    return Ok(discipline);
        //}

        [Authorize]
        [HttpGet("list")]
        public IActionResult GetList([FromQuery] int groupId, [FromQuery] string searchVal,
                                     [FromQuery] string year, [FromQuery] string semestr, [FromQuery] string type,
                                     [FromQuery] int pageNum = 1, [FromQuery] int pageSize = 20) {
            var disciplines = db.Disciplines.Include(x => x.Groups).ToArray();
            if (groupId   != 0   ) disciplines = disciplines.Where(x => x.Groups.Any(x => x.Id == groupId)                         ).ToArray();
            if (searchVal != null) disciplines = disciplines.Where(x => x.Name.Contains(searchVal)||x.ShortName.Contains(searchVal)).ToArray();
            if (year      != "0")  disciplines = disciplines.Where(x => x.Year           == year    ).ToArray();
            if (semestr   != "0")  disciplines = disciplines.Where(x => x.Semestr        == semestr ).ToArray();
            if (type      != "0")  disciplines = disciplines.Where(x => x.PassType == type    ).ToArray();
            var fullSize = disciplines.Count();
            var pagesAmount = fullSize / pageSize + (fullSize % pageSize != 0 ? 1 : 0);
            if(pageNum != 0) disciplines = disciplines.Skip((pageNum - 1) * pageSize).Take(pageSize).ToArray();
            return Ok(new { disciplines = disciplines, pagesAmount = pagesAmount });
        }

        [Authorize]
        [HttpGet("{id}")]
        public IActionResult GetConcrete([FromRoute] int id){
            var discipline = db.Disciplines.Include(x => x.Groups).Include(x => x.Magisters).FirstOrDefault(x => x.Id == id);
            return Ok(discipline);
        }

        [Authorize]
        [HttpPost("add")]
        public IActionResult AddEntry([FromBody] DisciplineRedactionRequest request){
            var groups    = db.Groups.Where(   x => request.groupsIds.Contains(   x.Id)).ToList();
            var magisters = db.Magisters.Where(x => request.magistersIds.Contains(x.Id)).ToList();
            request.discipline.Groups    = groups;
            request.discipline.Magisters = magisters;
            db.Disciplines.Add(request.discipline);
            db.SaveChanges();
            return Ok(request.discipline);
        }

        [Authorize]
        [HttpPut("{id}")]
        public IActionResult RedactEntry([FromRoute] int id, [FromBody] DisciplineRedactionRequest request){
            var previous = db.Disciplines.Include(x => x.Groups).Include(x => x.Magisters).FirstOrDefault(x => x.Id == id);
            if (previous == null) return NotFound(ID_NOT_FOUND);
            var groups    = db.Groups.Where(   x => request.groupsIds.Contains(   x.Id)).ToList();
            var magisters = db.Magisters.Where(x => request.magistersIds.Contains(x.Id)).ToList();
            previous.Name           = request.discipline.Name;
            previous.ShortName      = request.discipline.ShortName;
            previous.Semestr        = request.discipline.Semestr;
            previous.Year           = request.discipline.Year;
            previous.PassType       = request.discipline.PassType;
            previous.Groups    = groups;
            previous.Magisters = magisters;
            db.Disciplines.Update(previous);
            db.SaveChanges();
            return Ok(previous);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public IActionResult RemoveEntry([FromRoute] int id){
            if (db.ArrearSheets.Any(x => x.DisciplineId == id))
                return BadRequest(REMOVE_ARREARS_SHEETS);
            var discipline = db.Disciplines.Include(x => x.Groups).Include(x => x.Magisters).FirstOrDefault(x => x.Id == id);
            if (discipline == null) return NotFound(ID_NOT_FOUND);
            db.Disciplines.Remove(discipline);
            db.SaveChanges();
            return Ok(discipline);
        }

        [Authorize(Roles = "admin")]
        [HttpGet("admin/{id}")]
        public IActionResult GetConcreteAsAdministrator([FromRoute] int id){
            var discipline = db.Disciplines.Include(x => x.Groups).Include(x => x.Magisters).FirstOrDefault(x => x.Id == id);
            return Ok(discipline);
        }

        [Authorize(Roles = "admin")]
        [HttpPut("admin/{id}")]
        public IActionResult RedactAsAdministrator([FromRoute] int id, [FromBody] DisciplineRedactionRequest request){
            var previous = db.Disciplines.Include(x => x.Groups).Include(x => x.Magisters).FirstOrDefault(x => x.Id == id);
            if (previous == null) return NotFound(ID_NOT_FOUND);
            var groups = db.Groups.Where(x => request.groupsIds.Contains(x.Id)).ToList();
            var magisters = db.Magisters.Where(x => request.magistersIds.Contains(x.Id)).ToList();
            previous.Name = request.discipline.Name;
            previous.ShortName = request.discipline.ShortName;
            previous.Semestr = request.discipline.Semestr;
            previous.Year = request.discipline.Year;
            previous.PassType = request.discipline.PassType;
            previous.Groups    = groups;
            previous.Magisters = magisters;
            db.Disciplines.Update(previous);
            db.SaveChanges();
            return Ok(previous);
        }

        [Authorize(Roles = "admin")]
        [HttpPost("admin/add")]
        public IActionResult AddAsAdministrator([FromBody] DisciplineRedactionRequest request){
            var groups = db.Groups.Where(x => request.groupsIds.Contains(x.Id)).ToList();
            var magisters = db.Magisters.Where(x => request.magistersIds.Contains(x.Id)).ToList();
            request.discipline.Groups = groups;
            request.discipline.Magisters = magisters;
            db.Disciplines.Add(request.discipline);
            db.SaveChanges();
            return Ok(request.discipline);
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("admin/{id}")]
        public IActionResult RemoveAsAdministrator([FromRoute] int id){
            if (db.ArrearSheets.Any(x => x.DisciplineId == id))
                return BadRequest(REMOVE_ARREARS_SHEETS);
            var discipline = db.Disciplines.Include(x => x.Groups).Include(x => x.Magisters).FirstOrDefault(x => x.Id == id);
            if (discipline == null) return NotFound(ID_NOT_FOUND);
            db.Disciplines.Remove(discipline);
            db.SaveChanges();
            return Ok(discipline);
        }

        public class DisciplineRedactionRequest{
            public Discipline discipline { get; set; }
            public ICollection<int> groupsIds { get; set; }
            public ICollection<int> magistersIds { get; set; }
        }
    }
}
