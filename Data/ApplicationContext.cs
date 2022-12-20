using Microsoft.EntityFrameworkCore;
using arrearsApi5_0.Models;

namespace arrearsApi5_0.Data{
    public class ApplicationContext : DbContext{
        public ApplicationContext(DbContextOptions<ApplicationContext> options) : base(options) {
            //Database.EnsureCreated();
        }
        public DbSet<ArrearSheet> ArrearSheets { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Discipline> Disciplines { get; set; }
        public DbSet<Faculty> Faculties { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<Magister> Magisters { get; set; }
        public DbSet<Student> Students { get; set; }
        
    }
}