using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace arrearsApi5_0.Models{
    public class Student{
        public int Id { get; set; }
        [JsonIgnore]
        public string Login { get; set; }
        [JsonIgnore]
        public string Password { get; set; }
        public string Surname { get; set; }
        public string Name { get; set; }
        public string PatronymicName { get; set; }
        public Group Group { get; set; }
        public int GroupId { get; set; }

    }
}
