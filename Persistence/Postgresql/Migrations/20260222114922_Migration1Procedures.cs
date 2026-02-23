using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimeTracking.Persistence.Postgresql.Migrations
{
    /// <inheritdoc />
    public partial class Migration1Procedures : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(Properties.Resources.Clean);
            migrationBuilder.Sql(Properties.Resources.StopTracking);
            migrationBuilder.Sql(Properties.Resources.StartTracking);
            migrationBuilder.Sql(Properties.Resources.UpdateActiveWorkspace);
            migrationBuilder.Sql(Properties.Resources.UpdateActivityAssignment);
            migrationBuilder.Sql(Properties.Resources.UpdateDiceSideSelection);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS update_dice_side_selection;");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS update_activity_assignment;");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS update_active_workspace;");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS stop_tracking;");
            migrationBuilder.Sql("DROP FUNCTION IF EXISTS start_tracking;");
            migrationBuilder.Sql("DROP PROCEDURE IF EXISTS clean;");
        }
    }
}
