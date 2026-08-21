using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Exam.Migrations
{
    /// <inheritdoc />
    public partial class FixAppointmentSlotTimezone : Migration
    {
        /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Earlier UI versions sent local clinic time through toISOString(),
        // which persisted it five hours behind the clinic's local time.
        migrationBuilder.Sql("UPDATE [AppointmentSlots] SET [StartTime] = DATEADD(hour, 5, [StartTime]), [EndTime] = DATEADD(hour, 5, [EndTime])");
            migrationBuilder.AddColumn<string>(
                name: "Analyses",
                table: "MedicalRecords",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AnamnesisMorbi",
                table: "MedicalRecords",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AnamnesisVitae",
                table: "MedicalRecords",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "GeneralExamination",
                table: "MedicalRecords",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Recommendations",
                table: "MedicalRecords",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "StatusLocalis",
                table: "MedicalRecords",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("UPDATE [AppointmentSlots] SET [StartTime] = DATEADD(hour, -5, [StartTime]), [EndTime] = DATEADD(hour, -5, [EndTime])");
            migrationBuilder.DropColumn(
                name: "Analyses",
                table: "MedicalRecords");

            migrationBuilder.DropColumn(
                name: "AnamnesisMorbi",
                table: "MedicalRecords");

            migrationBuilder.DropColumn(
                name: "AnamnesisVitae",
                table: "MedicalRecords");

            migrationBuilder.DropColumn(
                name: "GeneralExamination",
                table: "MedicalRecords");

            migrationBuilder.DropColumn(
                name: "Recommendations",
                table: "MedicalRecords");

            migrationBuilder.DropColumn(
                name: "StatusLocalis",
                table: "MedicalRecords");
        }
    }
}
