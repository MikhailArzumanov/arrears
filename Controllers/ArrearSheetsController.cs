using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using arrearsApi5_0.Models;
using arrearsApi5_0.Data;
using arrearsApi5_0.Utils;
using Microsoft.EntityFrameworkCore;

namespace arrearsApi5_0.Controllers{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("CorsAllowAny")]
    public class ArrearSheetsController : ControllerBase {
        private ApplicationContext db;
        private IConfiguration config;

        const string AUTH_ERROR            = "Авторизационные данные некорректны.";
        const string ID_NOT_FOUND          = "Лист с заданным идентификатором не найден.";
        const string STUDENT_NOT_FOUND     = "Заданный для листа студент не найден.";
        const string DISCIPLINE_NOT_FOUND  = "Заданная для листа дисциплина не найдена.";
        const string MAGISTER_NOT_FOUND    = "Заданный для листа преподаватель не найден.";
        const string GROUP_HAS_NO_STUDENTS = "У данной группы нет студентов.";
        const string WAS_NOT_MARKED        = "Оценка требуется перед закрытием.";
        const string WAS_NOT_CONFIRMED     = "Перед оценкой требуется подтверждение в директорате.";
        const string ALREADY_CONFIRMED     = "Долговой лист уже подтвержден.";
        const string MARK_INCORRECT        = "Некорректная оценка.";

        const string MAGISTER_WAS_NOT_ASSIGNED_TO_DISCIPLINE = "Преподаватель не назначен на дисциплину.";

        const string REDACTING_IS_NOT_PERMITTED = "Редактирование не доступно.";
        const string ARREAR_SHEET_WAS_CONFIRMED = "Долговой лист уже был подтвержден.";

        const string STATUS_OPENED    = "ожидание выдачи";
        const string STATUS_CONFIRMED = "ожидание оценки";
        const string STATUS_MARKED    = "оценка выставлена";
        const string STATUS_CLOSED    = "закрыт";

        string[] STATUSES = new string[] { "null", STATUS_OPENED, STATUS_CONFIRMED, STATUS_MARKED, STATUS_CLOSED };

        public ArrearSheetsController(ApplicationContext context, IConfiguration config) {
            this.db = context;
            this.config = config;
        }

        [Authorize]
        [HttpGet("list")]
        public IActionResult GetList([FromQuery] int facultyId, [FromQuery] int departmentId, [FromQuery] int groupId,
                                     [FromQuery] string studentSurname, [FromQuery] string disciplineName, [FromQuery] string magisterSurname,
                                     [FromQuery] string year, [FromQuery] string semestr, [FromQuery] string passType, [FromQuery] int status,
                                     [FromQuery] int pageNum = 1, [FromQuery] int pageSize = 20) {
            var arrearSheets = db.ArrearSheets.Include(x => x.Student).ThenInclude(x => x.Group)
                                              .ThenInclude(x => x.Department).ThenInclude(x => x.Faculty)
                                              .Include(x => x.Discipline).Include(x => x.Magister).ToArray();
            if      (groupId      != 0) arrearSheets = arrearSheets.Where(x => x.Student.GroupId                    == groupId     ).ToArray();
            else if (departmentId != 0) arrearSheets = arrearSheets.Where(x => x.Student.Group.DepartmentId         == departmentId).ToArray();
            else if (facultyId    != 0) arrearSheets = arrearSheets.Where(x => x.Student.Group.Department.FacultyId == facultyId   ).ToArray();
            if (studentSurname      != null) arrearSheets = arrearSheets.Where(x =>      x.Student.Surname.Contains(studentSurname)).ToArray();
            if (disciplineName != null) arrearSheets = arrearSheets.Where(x => x.Discipline.ShortName.Contains(disciplineName)
                                                                                  ||x.Discipline.Name.Contains(disciplineName)      ).ToArray();
            if (magisterSurname     != null) arrearSheets = arrearSheets.Where(x =>     x.Magister.Surname.Contains(magisterSurname)).ToArray();
            if (year     != "0") arrearSheets = arrearSheets.Where(x => x.Discipline.Year     == year    ).ToArray();
            if (semestr  != "0") arrearSheets = arrearSheets.Where(x => x.Discipline.Semestr  == semestr ).ToArray();
            if (passType != "0") arrearSheets = arrearSheets.Where(x => x.Discipline.PassType == passType).ToArray();
            if (status   != 0) arrearSheets = arrearSheets.Where(x =>        x.Status == STATUSES[status]).ToArray();
            var fullSize = arrearSheets.Count();
            var pagesAmount = fullSize / pageSize + (fullSize % pageSize != 0 ? 1 : 0);
            if(pageNum != 0) arrearSheets = arrearSheets.Skip((pageNum - 1) * pageSize).Take(pageSize).ToArray();
            return Ok(new { arrears = arrearSheets, pagesAmount = pagesAmount });
        }

        [Authorize]
        [HttpPost("{id}")]
        public IActionResult GetConcrete([FromRoute] int id, [FromBody] AuthData authData, [FromQuery] string authType){
            var arrearSheet = db.ArrearSheets.Include(x => x.Student).ThenInclude(x => x.Group)
                                              .ThenInclude(x => x.Department).ThenInclude(x => x.Faculty)
                                              .Include(x => x.Discipline).Include(x => x.Magister).FirstOrDefault(x => x.Id == id);
            if (!AuthValidation.isAuthValid(arrearSheet, authData, authType))
                return BadRequest(AUTH_ERROR);
            return Ok(arrearSheet);
        }

        [Authorize]
        [HttpPost("add")]
        public IActionResult AddEntry([FromBody] ArrearSheetRedactionRequest request, [FromQuery] string authType){
            var student = db.Students.Include(x => x.Group).ThenInclude(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == request.arrearSheetData.StudentId);
            if (student == null) return NotFound(STUDENT_NOT_FOUND);
            if (!AuthValidation.isAuthValid(student, request.authData, authType, true))
                return BadRequest(AUTH_ERROR);
            var discipline = db.Disciplines.Include(x => x.Magisters).FirstOrDefault(x => x.Id == request.arrearSheetData.DisciplineId);
            if (discipline == null) return NotFound(DISCIPLINE_NOT_FOUND);
            if (!db.Magisters.Any(x => x.Id == request.arrearSheetData.MagisterId))
                return NotFound(MAGISTER_NOT_FOUND);
            if (!discipline.Magisters.Any(x => x.Id == request.arrearSheetData.MagisterId))
                return BadRequest(MAGISTER_WAS_NOT_ASSIGNED_TO_DISCIPLINE);
            request.arrearSheetData.Status        = STATUS_OPENED;
            request.arrearSheetData.Mark          = "";
            request.arrearSheetData.FromationDate = DateTime.Now;
            ArrearSheet result = db.ArrearSheets.Add(request.arrearSheetData).Entity;
            db.SaveChanges();
            result = db.ArrearSheets.Include(x => x.Student).ThenInclude(x => x.Group).ThenInclude(x => x.Department).ThenInclude(x => x.Faculty)
                                    .Include(x => x.Discipline).Include(x => x.Magister).FirstOrDefault(x => x.Id == result.Id);
            return Ok(result);
        }

        [Authorize]
        [HttpPut("{id}")]
        public IActionResult RedactEntry([FromRoute] int id, [FromBody] ArrearSheetRedactionRequest request, [FromQuery] string authType){
            var previous = db.ArrearSheets.Include(x => x.Student).ThenInclude(x => x.Group).ThenInclude(x => x.Department).ThenInclude(x => x.Faculty)
                                          .Include(x => x.Discipline).FirstOrDefault(x => x.Id == id);
            if (previous == null) return NotFound(ID_NOT_FOUND);
            if(!AuthValidation.isAuthValid(previous, request.authData, authType)) return BadRequest(AUTH_ERROR);
            var isStudentIdValid = db.Students.Any(x => x.Id == request.arrearSheetData.StudentId);
            if (!isStudentIdValid) return NotFound(STUDENT_NOT_FOUND);
            switch (authType){
                case "faculty":
                    var discipline = db.Disciplines.Include(x => x.Magisters).FirstOrDefault(x => x.Id == request.arrearSheetData.DisciplineId);
                    if (discipline == null) return NotFound(DISCIPLINE_NOT_FOUND);
                    if (!db.Magisters.Any(x => x.Id == request.arrearSheetData.MagisterId))
                        return NotFound(MAGISTER_NOT_FOUND);
                    if (!discipline.Magisters.Any(x => x.Id == request.arrearSheetData.MagisterId))
                        return BadRequest(MAGISTER_WAS_NOT_ASSIGNED_TO_DISCIPLINE);
                    previous.DisciplineId = request.arrearSheetData.DisciplineId;
                    previous.StudentId    = request.arrearSheetData.StudentId;
                    previous.Status       = request.arrearSheetData.Status;
                    previous.Mark         = request.arrearSheetData.Mark;
                    break;
                case "group":
                    previous.StudentId = request.arrearSheetData.StudentId;
                    break;
            }
            db.ArrearSheets.Update(previous);
            db.SaveChanges();
            return Ok(previous);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public IActionResult RemoveEntry([FromRoute] int id, [FromBody] AuthData authData, [FromQuery] string authType){
            var arrearSheet = db.ArrearSheets.Include(x => x.Student).ThenInclude(x => x.Group).ThenInclude(x => x.Department).ThenInclude(x => x.Faculty)
                                             .Include(x => x.Discipline).FirstOrDefault(x => x.Id == id);
            if (arrearSheet == null) return NotFound(ID_NOT_FOUND);
            if (!AuthValidation.isAuthValid(arrearSheet, authData, authType))
                return BadRequest(AUTH_ERROR);
            if (authType != "faculty" && arrearSheet.Status != STATUS_OPENED)
                return BadRequest(ARREAR_SHEET_WAS_CONFIRMED);
            db.ArrearSheets.Remove(arrearSheet);
            db.SaveChanges();
            return Ok(arrearSheet);
        }

        [Authorize]
        [HttpPut("confirm/{id}")]
        public IActionResult ConfirmArrearSheet([FromRoute] int id, [FromBody] AuthData authData, [FromQuery] string authType){
            var arrearSheet = db.ArrearSheets.Include(x => x.Student).ThenInclude(x => x.Group)
                                             .ThenInclude(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            if (authType != "faculty")
                return BadRequest(REDACTING_IS_NOT_PERMITTED);
            if (!AuthValidation.isAuthValid(arrearSheet, authData, authType))
                return BadRequest(AUTH_ERROR);
            if (arrearSheet.Status != STATUS_OPENED)
                return BadRequest(ALREADY_CONFIRMED);
            arrearSheet.Status = STATUS_CONFIRMED;
            db.ArrearSheets.Update(arrearSheet);
            db.SaveChanges();
            var result = db.ArrearSheets.Include(x => x.Student).ThenInclude(x => x.Group).Include(x => x.Discipline).Include(x => x.Magister).FirstOrDefault(x => x.Id == arrearSheet.Id);
            return Ok(result);
        }

        [Authorize]
        [HttpPut("mark/{id}")]
        public IActionResult MarkArrear([FromRoute] int id, [FromBody] AuthData authData, [FromQuery] string authType, [FromQuery] string mark){
            var arrearSheet = db.ArrearSheets.Include(x => x.Magister).ThenInclude(x => x.Department)
                                             .ThenInclude(x => x.Faculty).Include(x => x.Discipline).FirstOrDefault(x => x.Id == id);
            if (!AuthValidation.isAuthValidMagister(arrearSheet, authData, authType))
                return BadRequest(AUTH_ERROR);
            if (arrearSheet.Status != STATUS_CONFIRMED) 
                return BadRequest(WAS_NOT_CONFIRMED);
            string[] availableMarks;
            if (arrearSheet.Discipline.PassType == "зачет"){
                availableMarks = new string[] { "зачет", "незачет" };
            }
            else{
                availableMarks = new string[] { "2", "3", "4", "5" };
            }
            if (!availableMarks.Contains(mark))
                return BadRequest(MARK_INCORRECT);
            arrearSheet.Mark = mark;
            arrearSheet.Status = STATUS_MARKED;
            db.ArrearSheets.Update(arrearSheet);
            db.SaveChanges();
            var result = db.ArrearSheets.Include(x => x.Student).ThenInclude(x => x.Group).Include(x => x.Discipline).Include(x => x.Magister).FirstOrDefault(x => x.Id == arrearSheet.Id);
            return Ok(result);
        }

        [Authorize]
        [HttpPut("close/{id}")]
        public IActionResult CloseArrear([FromRoute] int id, [FromBody] AuthData authData, [FromQuery] string authType){
            var arrearSheet = db.ArrearSheets.Include(x => x.Student).ThenInclude(x => x.Group).ThenInclude(x => x.Department)
                                             .ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            if (authType != "faculty") BadRequest(REDACTING_IS_NOT_PERMITTED);
            if (!AuthValidation.isAuthValid(arrearSheet, authData, authType))
                return BadRequest(AUTH_ERROR);
            if (arrearSheet.Status != STATUS_MARKED)
                return BadRequest(WAS_NOT_MARKED);
            arrearSheet.Status = STATUS_CLOSED;
            db.ArrearSheets.Update(arrearSheet);
            db.SaveChanges();
            var result = db.ArrearSheets.Include(x => x.Student).ThenInclude(x => x.Group).Include(x => x.Discipline).Include(x => x.Magister).FirstOrDefault(x => x.Id == arrearSheet.Id);
            return Ok(result);
        }




        [Authorize(Roles = "admin")]
        [HttpPut("admin/confirm/{id}")]
        public IActionResult ConfirmArrearSheetAsAdministrator([FromRoute] int id){
            var arrearSheet = db.ArrearSheets.Include(x => x.Student).ThenInclude(x => x.Group)
                                             .ThenInclude(x => x.Department).ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            if (arrearSheet.Status != STATUS_OPENED)
                return BadRequest(ALREADY_CONFIRMED);
            arrearSheet.Status = STATUS_CONFIRMED;
            db.ArrearSheets.Update(arrearSheet);
            db.SaveChanges();
            var result = db.ArrearSheets.Include(x => x.Student).ThenInclude(x => x.Group).Include(x => x.Discipline).Include(x => x.Magister).FirstOrDefault(x => x.Id == arrearSheet.Id);
            return Ok(result);
        }

        [Authorize(Roles = "admin")]
        [HttpPut("admin/mark/{id}")]
        public IActionResult MarkArrearAsAdministrator([FromRoute] int id, [FromQuery] string mark){
            var arrearSheet = db.ArrearSheets.Include(x => x.Magister).ThenInclude(x => x.Department)
                                             .ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            if (arrearSheet.Status != STATUS_CONFIRMED) 
                return BadRequest(WAS_NOT_CONFIRMED);
            string[] availableMarks;
            if (arrearSheet.Discipline.PassType == "зачет"){
                availableMarks = new string[] { "зачет", "незачет" };
            }
            else{
                availableMarks = new string[] { "2", "3", "4", "5" };
            }
            if (!availableMarks.Contains(mark))
                return BadRequest(MARK_INCORRECT);
            arrearSheet.Mark = mark;
            arrearSheet.Status = STATUS_MARKED;
            db.ArrearSheets.Update(arrearSheet);
            db.SaveChanges();
            var result = db.ArrearSheets.Include(x => x.Student).ThenInclude(x => x.Group).Include(x => x.Discipline).Include(x => x.Magister).FirstOrDefault(x => x.Id == arrearSheet.Id);
            return Ok(result);
        }

        [Authorize(Roles = "admin")]
        [HttpPut("admin/close/{id}")]
        public IActionResult CloseArrearAsAdministrator([FromRoute] int id){
            var arrearSheet = db.ArrearSheets.Include(x => x.Student).ThenInclude(x => x.Group).ThenInclude(x => x.Department)
                                             .ThenInclude(x => x.Faculty).FirstOrDefault(x => x.Id == id);
            if (arrearSheet.Status != STATUS_MARKED)
                return BadRequest(WAS_NOT_MARKED);
            arrearSheet.Status = STATUS_CLOSED;
            db.ArrearSheets.Update(arrearSheet);
            db.SaveChanges();
            var result = db.ArrearSheets.Include(x => x.Student).ThenInclude(x => x.Group).Include(x => x.Discipline).Include(x => x.Magister).FirstOrDefault(x => x.Id == arrearSheet.Id);
            return Ok(result);
        }

        [Authorize(Roles = "admin")]
        [HttpGet("admin/{id}")]
        public IActionResult GetConcreteAsAdministrator([FromRoute] int id){
            var arrearSheet = db.ArrearSheets.Include(x => x.Student).ThenInclude(x => x.Group).ThenInclude(x => x.Department).ThenInclude(x => x.Faculty)
                                             .Include(x => x.Discipline).Include(x => x.Magister).FirstOrDefault(x => x.Id == id);
            return Ok(arrearSheet);
        }

        [Authorize(Roles = "admin")]
        [HttpPut("admin/{id}")]
        public IActionResult RedactAsAdministrator([FromRoute] int id, [FromBody] ArrearSheet request){
            var previous = db.ArrearSheets.FirstOrDefault(x => x.Id == id);
            if (previous == null) return NotFound(ID_NOT_FOUND);
            var isStudentIdValid = db.Students.Any(x => x.Id == request.StudentId);
            if (!isStudentIdValid) return NotFound(STUDENT_NOT_FOUND);
            var discipline = db.Disciplines.Include(x => x.Magisters).FirstOrDefault(x => x.Id == request.DisciplineId);
            if (discipline == null) return NotFound(DISCIPLINE_NOT_FOUND);
            if (!db.Magisters.Any(x => x.Id == request.MagisterId))
                return NotFound(MAGISTER_NOT_FOUND);
            if (!discipline.Magisters.Any(x => x.Id == request.MagisterId))
                return BadRequest(MAGISTER_WAS_NOT_ASSIGNED_TO_DISCIPLINE);
            previous.StudentId    = request.StudentId;
            previous.DisciplineId = request.DisciplineId;
            previous.MagisterId   = request.MagisterId;
            previous.Mark         = request.Mark;
            previous.Status       = request.Status;
            db.ArrearSheets.Update(previous);
            db.SaveChanges();
            return Ok(previous);
        }

        [Authorize(Roles = "admin")]
        [HttpPost("admin/add")]
        public IActionResult AddAsAdministrator([FromBody] ArrearSheet arrearSheet){
            var isStudentIdValid = db.Students.Any(x => x.Id == arrearSheet.StudentId);
            if (!isStudentIdValid) return NotFound(STUDENT_NOT_FOUND);
            var discipline = db.Disciplines.Include(x => x.Magisters).FirstOrDefault(x => x.Id == arrearSheet.DisciplineId);
            if (discipline == null) return NotFound(DISCIPLINE_NOT_FOUND);
            if (!db.Magisters.Any(x => x.Id == arrearSheet.MagisterId))
                return NotFound(MAGISTER_NOT_FOUND);
            if (!discipline.Magisters.Any(x => x.Id == arrearSheet.MagisterId))
                return BadRequest(MAGISTER_WAS_NOT_ASSIGNED_TO_DISCIPLINE);
            arrearSheet.Status = STATUS_OPENED;
            arrearSheet.Mark = "";
            arrearSheet.FromationDate = DateTime.Now;
            ArrearSheet result = db.ArrearSheets.Add(arrearSheet).Entity;
            db.SaveChanges();
            result = db.ArrearSheets.Include(x => x.Student).ThenInclude(x => x.Group).ThenInclude(x => x.Department).ThenInclude(x => x.Faculty)
                                    .Include(x => x.Discipline).Include(x => x.Magister).FirstOrDefault(x => x.Id == result.Id);
            return Ok(result);
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("admin/{id}")]
        public IActionResult RemoveAsAdministrator([FromRoute] int id){
            var arrearSheet = db.ArrearSheets.FirstOrDefault(x => x.Id == id);
            if (arrearSheet == null) return NotFound(ID_NOT_FOUND);
            db.ArrearSheets.Remove(arrearSheet);
            db.SaveChanges();
            return Ok(arrearSheet);
        }


        public class ArrearSheetRedactionRequest {
            public AuthData authData { get; set; }
            public ArrearSheet arrearSheetData { get; set; }
        }
    }
}
