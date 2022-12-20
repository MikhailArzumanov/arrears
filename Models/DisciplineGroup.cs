using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace arrearsApi5_0.Models{
    public class DisciplineGroup{
        public int DisciplineId { get; set; }
        public Discipline Discipline { get; set; }
        public int GroupId { get; set; }
        public Group Group { get; set; }
    }
}
