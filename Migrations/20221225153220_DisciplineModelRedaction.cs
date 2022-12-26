using Microsoft.EntityFrameworkCore.Migrations;

namespace arrearsApi5_0.Migrations{
    public partial class DisciplineModelRedaction : Migration{
        protected override void Up(MigrationBuilder migrationBuilder){
            migrationBuilder.AddColumn<string>(
                name: "PassType",
                table: "Disciplines",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Semestr",
                table: "Disciplines",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Year",
                table: "Disciplines",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder){
            migrationBuilder.DropColumn(
                name: "PassType",
                table: "Disciplines");

            migrationBuilder.DropColumn(
                name: "Semestr",
                table: "Disciplines");

            migrationBuilder.DropColumn(
                name: "Year",
                table: "Disciplines");
        }
    }
}
