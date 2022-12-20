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

    }
}
