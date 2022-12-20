using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace arrearsApi5_0.Models{
    public class FullDepartment{
        public int Id { get; set; }
        public string Login { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public string ShortName { get; set; }
        public Faculty Faculty { get; set; }
        public int FacultyId { get; set; }
        public Department toDefault() => new Department { Id = Id, Login = Login, Password = Password, Name = Name, ShortName = ShortName, Faculty = Faculty, FacultyId = FacultyId };
    }
}