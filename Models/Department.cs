using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace arrearsApi5_0.Models{
    public class Department{
        public int Id { get; set; }
        [JsonIgnore]
        public string Login { get; set; }
        [JsonIgnore]
        public string Password { get; set; }
        public string Name { get; set; }
        public string ShortName { get; set; }
        public Faculty Faculty { get; set; }
        public int FacultyId { get; set; }
    }
}