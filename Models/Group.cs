using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace arrearsApi5_0.Models{
    public class Group{
        public int Id { get; set; }
        [JsonIgnore]
        public string Login { get; set; }
        [JsonIgnore]
        public string Password { get; set; }
        public string Name { get; set; }
        public Department Department { get; set; }
        public int DepartmentId { get; set; }
        public ICollection<Discipline> Disciplines { get; set; } = new List<Discipline>();


    }
}
