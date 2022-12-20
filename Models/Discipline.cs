using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace arrearsApi5_0.Models{
    public class Discipline{
        public int Id { get; set; }
        public string Name { get; set; }
        public string ShortName { get; set; }
        public ICollection<Group> Groups { get; set; } = new List<Group>();
        public ICollection<Magister> Magisters { get; set; } = new List<Magister>();
    }
}
