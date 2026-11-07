using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimeTracking.Persistence.SqLite.Migrations
{
    /// <inheritdoc />
    public partial class Migration1ReviewFixes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_users_username",
                schema: "tt",
                table: "users",
                column: "username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_users_username",
                schema: "tt",
                table: "users");
        }
    }
}
