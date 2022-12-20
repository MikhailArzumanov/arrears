using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace arrearsApi5_0.Models{
    public class DisciplineMagister{
        public int DisiplineId { get; set; }
        public Discipline Discipline { get; set; }
        public int MagisterId { get; set; }
        public Magister Magister { get; set; }
    }
}
