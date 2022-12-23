using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace arrearsApi5_0.Models{
    public class FullMagister{
        public int Id { get; set; }
        public string Login { get; set; }
        public string Password { get; set; }
        public string Surname { get; set; }
        public string Name { get; set; }
        public string PatronymicName { get; set; }
        public Department Department { get; set; }
        public int DepartmentId { get; set; }
        public ICollection<Discipline> Disciplines { get; set; } = new List<Discipline>();
        public Magister toDefault() => new Magister { Id = Id, Login = Login, Password = Password, Surname = Surname, Name = Name, PatronymicName = PatronymicName, Department = Department, DepartmentId = DepartmentId };
        public static FullMagister fromDefault(Magister d) => new FullMagister { Id = d.Id, Login = d.Login, Password = d.Password, Surname = d.Surname, Name = d.Name, PatronymicName = d.PatronymicName, Department = d.Department, DepartmentId = d.DepartmentId };

    }
}
