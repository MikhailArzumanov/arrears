using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace arrearsApi5_0.Migrations{
    public partial class AdministratorModelAddition : Migration{
        protected override void Up(MigrationBuilder migrationBuilder){
            migrationBuilder.CreateTable(
                name: "Administrators",
                columns: table => new{
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Login = table.Column<string>(type: "text", nullable: true),
                    Password = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>{
                    table.PrimaryKey("PK_Administrators", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder){
            migrationBuilder.DropTable(
                name: "Administrators");
        }
    }
}
