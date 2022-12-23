using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace arrearsApi5_0.Models{
    public class FullGroup{
        public int Id { get; set; }
        public string Login { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public Department Department { get; set; }
        public int DepartmentId { get; set; }
        public ICollection<Discipline> Disciplines { get; set; } = new List<Discipline>();
        public Group toDefault() => new Group { Id = Id, Login = Login, Password = Password, Name = Name, Department = Department, DepartmentId = DepartmentId };
        public static FullGroup fromDefault(Group d) => new FullGroup { Id = d.Id, Login = d.Login, Password = d.Password, Name = d.Name, Department = d.Department, DepartmentId = d.DepartmentId };
    }
}
