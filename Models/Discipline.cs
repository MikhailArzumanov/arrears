using System;
using System.Collections.Generic;

namespace arrearsApi5_0.Models{
    public class Discipline{
        public int Id           { get; set; }
        public string Name      { get; set; }
        public string ShortName { get; set; }
        public string PassType  { get; set; }
        public string Year      { get; set; }
        public string Semestr   { get; set; }
        public ICollection<Group> Groups { get; set; } = new List<Group>();
        public ICollection<Magister> Magisters { get; set; } = new List<Magister>();
    }
}
