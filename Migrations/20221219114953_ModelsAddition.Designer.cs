﻿// <auto-generated />
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using arrearsApi5_0.Data;

namespace arrearsApi5_0.Migrations{
    [DbContext(typeof(ApplicationContext))]
    [Migration("20221219114953_ModelsAddition")]
    partial class ModelsAddition{
        protected override void BuildTargetModel(ModelBuilder modelBuilder){
#pragma warning disable 612, 618
            modelBuilder
                .UseIdentityByDefaultColumns()
                .HasAnnotation("Relational:MaxIdentifierLength", 63)
                .HasAnnotation("ProductVersion", "5.0.0");

            modelBuilder.Entity("DisciplineGroup", b =>{
                    b.Property<int>("DisciplinesId")
                        .HasColumnType("integer");

                    b.Property<int>("GroupsId")
                        .HasColumnType("integer");

                    b.HasKey("DisciplinesId", "GroupsId");

                    b.HasIndex("GroupsId");

                    b.ToTable("DisciplineGroup");
                });

            modelBuilder.Entity("DisciplineMagister", b =>{
                    b.Property<int>("DisciplinesId")
                        .HasColumnType("integer");

                    b.Property<int>("MagistersId")
                        .HasColumnType("integer");

                    b.HasKey("DisciplinesId", "MagistersId");

                    b.HasIndex("MagistersId");

                    b.ToTable("DisciplineMagister");
                });

            modelBuilder.Entity("arrearsApi5_0.Models.ArrearSheet", b =>{
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .UseIdentityByDefaultColumn();

                    b.Property<int>("DisciplineId")
                        .HasColumnType("integer");

                    b.Property<int>("StudentId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("DisciplineId");

                    b.HasIndex("StudentId");

                    b.ToTable("ArrearSheets");
                });

            modelBuilder.Entity("arrearsApi5_0.Models.Department", b =>{
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .UseIdentityByDefaultColumn();

                    b.Property<int>("FacultyId")
                        .HasColumnType("integer");

                    b.Property<string>("Login")
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.Property<string>("Password")
                        .HasColumnType("text");

                    b.Property<string>("ShortName")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("FacultyId");

                    b.ToTable("Departments");
                });

            modelBuilder.Entity("arrearsApi5_0.Models.Discipline", b =>{
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .UseIdentityByDefaultColumn();

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.Property<string>("ShortName")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Disciplines");
                });

            modelBuilder.Entity("arrearsApi5_0.Models.Faculty", b =>{
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .UseIdentityByDefaultColumn();

                    b.Property<string>("Login")
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.Property<string>("Password")
                        .HasColumnType("text");

                    b.Property<string>("ShortName")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.ToTable("Faculties");
                });

            modelBuilder.Entity("arrearsApi5_0.Models.Group", b =>{
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .UseIdentityByDefaultColumn();

                    b.Property<int>("DepartmentId")
                        .HasColumnType("integer");

                    b.Property<string>("Login")
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.Property<string>("Password")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("DepartmentId");

                    b.ToTable("Groups");
                });

            modelBuilder.Entity("arrearsApi5_0.Models.Magister", b =>{
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .UseIdentityByDefaultColumn();

                    b.Property<int>("DepartmentId")
                        .HasColumnType("integer");

                    b.Property<string>("Login")
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.Property<string>("Password")
                        .HasColumnType("text");

                    b.Property<string>("PatronymicName")
                        .HasColumnType("text");

                    b.Property<string>("Surname")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("DepartmentId");

                    b.ToTable("Magisters");
                });

            modelBuilder.Entity("arrearsApi5_0.Models.Student", b =>{
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .UseIdentityByDefaultColumn();

                    b.Property<int>("GroupId")
                        .HasColumnType("integer");

                    b.Property<string>("Login")
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .HasColumnType("text");

                    b.Property<string>("Password")
                        .HasColumnType("text");

                    b.Property<string>("PatronymicName")
                        .HasColumnType("text");

                    b.Property<string>("Surname")
                        .HasColumnType("text");

                    b.HasKey("Id");

                    b.HasIndex("GroupId");

                    b.ToTable("Students");
                });

            modelBuilder.Entity("DisciplineGroup", b =>{
                    b.HasOne("arrearsApi5_0.Models.Discipline", null)
                        .WithMany()
                        .HasForeignKey("DisciplinesId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("arrearsApi5_0.Models.Group", null)
                        .WithMany()
                        .HasForeignKey("GroupsId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("DisciplineMagister", b =>{
                    b.HasOne("arrearsApi5_0.Models.Discipline", null)
                        .WithMany()
                        .HasForeignKey("DisciplinesId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("arrearsApi5_0.Models.Magister", null)
                        .WithMany()
                        .HasForeignKey("MagistersId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("arrearsApi5_0.Models.ArrearSheet", b =>{
                    b.HasOne("arrearsApi5_0.Models.Discipline", "Discipline")
                        .WithMany()
                        .HasForeignKey("DisciplineId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("arrearsApi5_0.Models.Student", "Student")
                        .WithMany()
                        .HasForeignKey("StudentId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Discipline");

                    b.Navigation("Student");
                });

            modelBuilder.Entity("arrearsApi5_0.Models.Department", b =>{
                    b.HasOne("arrearsApi5_0.Models.Faculty", "Faculty")
                        .WithMany()
                        .HasForeignKey("FacultyId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Faculty");
                });

            modelBuilder.Entity("arrearsApi5_0.Models.Group", b =>{
                    b.HasOne("arrearsApi5_0.Models.Department", "Department")
                        .WithMany()
                        .HasForeignKey("DepartmentId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Department");
                });

            modelBuilder.Entity("arrearsApi5_0.Models.Magister", b =>
                {
                    b.HasOne("arrearsApi5_0.Models.Department", "Department")
                        .WithMany()
                        .HasForeignKey("DepartmentId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Department");
                });

            modelBuilder.Entity("arrearsApi5_0.Models.Student", b =>{
                    b.HasOne("arrearsApi5_0.Models.Group", "Group")
                        .WithMany()
                        .HasForeignKey("GroupId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Group");
                });
#pragma warning restore 612, 618
        }
    }
}
