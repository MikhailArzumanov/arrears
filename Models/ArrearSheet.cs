﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace arrearsApi5_0.Models{
    public class ArrearSheet{
        public int Id { get; set; }
        public Discipline Discipline { get; set; }
        public int DisciplineId { get; set; }
        public Student Student { get; set; }
        public int StudentId { get; set; }

    }
}