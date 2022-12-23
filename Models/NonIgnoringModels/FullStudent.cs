using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace arrearsApi5_0.Models{
    public class FullStudent{
        public int Id { get; set; }
        public string Login { get; set; }
        public string Password { get; set; }
        public string Surname { get; set; }
        public string Name { get; set; }
        public string PatronymicName { get; set; }
        public Group Group { get; set; }
        public int GroupId { get; set; }
        public Student toDefault() => new Student { Id = Id, Login = Login, Password = Password, Surname = Surname, Name = Name, PatronymicName = PatronymicName, Group = Group, GroupId = GroupId };
        public static FullStudent fromDefault(Student d) => new FullStudent { Id = d.Id, Login = d.Login, Password = d.Password, Surname = d.Surname, Name = d.Name, PatronymicName = d.PatronymicName, Group = d.Group, GroupId = d.GroupId };

    }
}
