using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimeTracking.Persistence.Postgresql.Migrations
{
    /// <inheritdoc />
    public partial class Migration2ReviewFixes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // the tracking logic moved into the service layer, the procedures are not used anymore
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS update_dice_side_selection;");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS update_activity_assignment;");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS update_active_workspace;");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS start_tracking;");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS stop_tracking;");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS clean;");

            migrationBuilder.AlterColumn<string>(
                name: "password",
                schema: "tt",
                table: "users",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(64)",
                oldMaxLength: 64);

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

            migrationBuilder.AlterColumn<string>(
                name: "password",
                schema: "tt",
                table: "users",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256);

            migrationBuilder.Sql(Properties.Resources.Clean);
            migrationBuilder.Sql(Properties.Resources.StopTracking);
            migrationBuilder.Sql(Properties.Resources.StartTracking);
            migrationBuilder.Sql(Properties.Resources.UpdateActiveWorkspace);
            migrationBuilder.Sql(Properties.Resources.UpdateActivityAssignment);
            migrationBuilder.Sql(Properties.Resources.UpdateDiceSideSelection);
        }
    }
}
