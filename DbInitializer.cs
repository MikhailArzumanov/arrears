using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using arrearsApi5_0.Models;

namespace arrearsApi5_0.Data{
    public class DbInitializer{
        private static Faculty AddFaculty(ApplicationContext context, string facultyName, string shortName, string facultyLogin, string facultyPassword){
            Faculty faculty = new Faculty();
            faculty.Name      = facultyName;
            faculty.ShortName = shortName;
            faculty.Login     = facultyLogin;
            faculty.Password  = Utils.PasswordHasher.Hash(facultyPassword);
            context.Faculties.Add(faculty);
            context.SaveChanges();
            return faculty;
        }

        private static Department AddDepartment(ApplicationContext context, Faculty faculty, string departmentName, string shortName, string departmentLogin, string departmentPassword){
            Department department = new Department();
            department.Name      = departmentName;
            department.ShortName = shortName;
            department.Login     = departmentLogin;
            department.Password  = Utils.PasswordHasher.Hash(departmentPassword);
            department.Faculty   = faculty;
            department.FacultyId = faculty.Id;
            context.Departments.Add(department);
            context.SaveChanges();
            return department;
        }

        private static Group AddGroup(ApplicationContext context, Department department, string groupName, string groupLogin, string groupPassword){
            Group group = new Group();
            group.Login      = groupLogin;
            group.Password   = Utils.PasswordHasher.Hash(groupPassword);
            group.Name       = groupName;
            group.Department = department;
            context.Groups.Add(group);
            context.SaveChanges();
            return group;
        }

        private static Magister AddMagister(ApplicationContext context, Department department, string surname, string name, string patronymicName, string login, string password){
            Magister magister = new Magister();
            magister.Login = login;
            magister.Password = Utils.PasswordHasher.Hash(password);
            magister.Surname        = surname;
            magister.Name           = name;
            magister.PatronymicName = patronymicName;
            magister.Department = department;
            context.Magisters.Add(magister);
            return magister;
        }

        private static void AddData(ApplicationContext context) {
            Faculty arc = AddFaculty(context, "Архитектурный институт",                                               "АИ",       "AI", "");
            AddDepartment(context, arc, "Кафедра архитектуры и градостроительства",           "Архитектуры", "ARCH", "");
            AddDepartment(context, arc, "Кафедра городского кадастра и инженерных изысканий", "ГКИИ",        "GKII", "");
            AddDepartment(context, arc, "Кафедра дизайна архитектурной среды",                "ДАС",         "DAS",  "");
            Faculty enc = AddFaculty(context, "Инженерно-строительный институт",                                      "ИСИ",      "ISI", "");
            Faculty eit = AddFaculty(context, "Институт энергетики, информационных технологий и управляющих систем",  "ИЭИТУС",   "IEITUS", "");
            Department povtas   = AddDepartment(context, eit, "Кафедра программного обеспечения вычислительной техники и автоматизированных систем",    "ПОВТАС",   "POVTAS", "");
            AddGroup(context, povtas, "КБ-51",  "KB-51", "");
            AddGroup(context, povtas, "ПВ-191", "PV-191", "");
            AddGroup(context, povtas, "ПВ-192", "PV-191", "");
            AddGroup(context, povtas, "ВТ-191", "VT-191", "");
            AddGroup(context, povtas, "КБ-191", "KB-191", "");
            AddGroup(context, povtas, "ПВ-201", "PV-201", "");
            AddGroup(context, povtas, "ПВ-202", "PV-202", "");
            AddGroup(context, povtas, "ВТ-201", "VT-201", "");
            AddGroup(context, povtas, "ВТ-202", "VT-202", "");
            AddGroup(context, povtas, "КБ-201", "KB-201", "");
            AddGroup(context, povtas, "КБ-202", "KB-202", "");
            AddGroup(context, povtas, "ПВ-211", "PV-211", "");
            AddGroup(context, povtas, "ПВ-212", "PV-212", "");
            AddGroup(context, povtas, "ВТ-211", "VT-211", "");
            AddGroup(context, povtas, "ВТ-212", "VT-212", "");
            AddGroup(context, povtas, "ПВ-221", "PV-221", "");
            AddGroup(context, povtas, "КБ-211", "KB-211", "");
            AddGroup(context, povtas, "КБ-212", "KB-212", "");
            AddGroup(context, povtas, "ПВ-222", "PV-222", "");
            AddGroup(context, povtas, "ПВ-223", "PV-223", "");
            AddGroup(context, povtas, "ВТ-221", "VT-221", "");
            AddGroup(context, povtas, "ВТ-222", "VT-222", "");
            AddGroup(context, povtas, "КБ-221", "KB-221", "");
            AddGroup(context, povtas, "КБ-222", "KB-222", "");
            Department it       = AddDepartment(context, eit, "Кафедра информационных технологий",                                                      "ИТ",       "IT", "");
            AddGroup(context, it, "ИТ-191", "IT-191", "");
            AddGroup(context, it, "ИТ-192", "IT-192", "");
            AddGroup(context, it, "ПИ-191", "PI-191", "");
            AddGroup(context, it, "ИТ-201", "IT-201", "");
            AddGroup(context, it, "ИТ-202", "IT-202", "");
            AddGroup(context, it, "ИТ-203", "IT-203", "");
            AddGroup(context, it, "ПИ-201", "PI-201", "");
            AddGroup(context, it, "ПИ-202", "PI-202", "");
            AddGroup(context, it, "ИТ-211", "IT-211", "");
            AddGroup(context, it, "ИТ-212", "IT-212", "");
            AddGroup(context, it, "ИТ-213", "IT-213", "");
            AddGroup(context, it, "ПИ-211", "PI-211", "");
            AddGroup(context, it, "ИТ-221", "IT-221", "");
            AddGroup(context, it, "ИТ-222", "IT-222", "");
            AddGroup(context, it, "ПИ-221", "PI-221", "");
            AddGroup(context, it, "ПИ-222", "PI-222", "");
            Department e        = AddDepartment(context, eit, "Кафедра электроэнергетики и автоматики", "ЭиА", "E", "");
            Department et       = AddDepartment(context, eit, "Кафедра энергетики теплотехнологии", "ЭТ", "ET", "");
            Department f        = AddDepartment(context, eit, "Кафедра физики", "Физики", "F", "");
            Department tk       = AddDepartment(context, eit, "Кафедра технической кибернетики", "ТК", "TK", "");
            Department siuk     = AddDepartment(context, eit, "Кафедра стандартизации и управления качеством", "СиУК", "SIUK", "");
            Faculty mch = AddFaculty(context, "Институт технологического оборудования и машиностроения",              "ИТОМ",     "ITOM", "");
            Faculty ecn = AddFaculty(context, "Институт экономики и менеджмента",                                     "ИЭМ",      "IEM", "");
            Faculty trs = AddFaculty(context, "Транспортно-технологический институт",                                 "ТТИ",      "TTI", "");
            Faculty chm = AddFaculty(context, "Химико-технологический институт",                                      "ХТИ",      "HTI", "");
            Faculty mgt = AddFaculty(context, "Институт магистратуры",                                                "ИМ",       "IM", "");
            Faculty dst = AddFaculty(context, "Институт заочного образования",                                        "ИЗО",      "IZO", "");
            Faculty add = AddFaculty(context, "Институт дополнительного образования",                                 "ИДО",      "IDO", "");
            Faculty frg = AddFaculty(context, "Подготовительный факультет для иностранных граждан",                   "ПФИ",      "PFI", "");
            Faculty col = AddFaculty(context, "Колледж высоких технологий",                                           "Колледж",  "CLG", "");
            Faculty vuc = AddFaculty(context, "Военный учебный центр",                                                "ВУЦ",      "VUC", "");
            context.SaveChanges();
        }
        public static void AddAdministrator(ApplicationContext context, string login, string password){
            Administrator administrator = new Administrator();
            administrator.Login    = login;
            administrator.Password = Utils.PasswordHasher.Hash(password);
            context.Administrators.Add(administrator);
            context.SaveChanges();
        }
        public static void Initialize(ApplicationContext context){
            if(!context.Faculties.Any()) AddData(context);
            if (!context.Administrators.Any()) 
                AddAdministrator(context, "admin", "");
        }
    }
}
