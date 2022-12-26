using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace arrearsApi5_0.Migrations{
    public partial class ArrearSheetModelRedaction : Migration{
        protected override void Up(MigrationBuilder migrationBuilder){
            migrationBuilder.AddColumn<DateTime>(
                name: "FromationDate",
                table: "ArrearSheets",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "MagisterId",
                table: "ArrearSheets",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Mark",
                table: "ArrearSheets",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "ArrearSheets",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ArrearSheets_MagisterId",
                table: "ArrearSheets",
                column: "MagisterId");

            migrationBuilder.AddForeignKey(
                name: "FK_ArrearSheets_Magisters_MagisterId",
                table: "ArrearSheets",
                column: "MagisterId",
                principalTable: "Magisters",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder){
            migrationBuilder.DropForeignKey(
                name: "FK_ArrearSheets_Magisters_MagisterId",
                table: "ArrearSheets");

            migrationBuilder.DropIndex(
                name: "IX_ArrearSheets_MagisterId",
                table: "ArrearSheets");

            migrationBuilder.DropColumn(
                name: "FromationDate",
                table: "ArrearSheets");

            migrationBuilder.DropColumn(
                name: "MagisterId",
                table: "ArrearSheets");

            migrationBuilder.DropColumn(
                name: "Mark",
                table: "ArrearSheets");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "ArrearSheets");
        }
    }
}
