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

    }
}
