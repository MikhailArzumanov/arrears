using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace arrearsApi5_0.Models{
    public class FullFaculty{
        public int Id { get; set; }
        public string Login { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public string ShortName { get; set; }
        public Faculty toDefault() => new Faculty { Id = Id, Login = Login, Password = Password, Name = Name, ShortName = ShortName };
    }
}
