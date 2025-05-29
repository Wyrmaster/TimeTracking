using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimeTracking.Persistence.Postgresql.Migrations
{
    /// <inheritdoc />
    public partial class Migration00Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "tt");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:uuid-ossp", ",,");

            migrationBuilder.CreateTable(
                name: "users",
                schema: "tt",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "uuid_generate_v4()"),
                    username = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    password = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    ActiveWorkspaceId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                    table.UniqueConstraint("AK_users_ActiveWorkspaceId", x => x.ActiveWorkspaceId);
                });

            migrationBuilder.CreateTable(
                name: "workspace",
                schema: "tt",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "uuid_generate_v4()"),
                    name = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    description = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    is_default = table.Column<bool>(type: "boolean", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ActiveWorkspaceUserId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_workspace", x => x.id);
                    table.ForeignKey(
                        name: "FK_workspace_users_ActiveWorkspaceUserId",
                        column: x => x.ActiveWorkspaceUserId,
                        principalSchema: "tt",
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_workspace_users_UserId",
                        column: x => x.UserId,
                        principalSchema: "tt",
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_workspace_users_id",
                        column: x => x.id,
                        principalSchema: "tt",
                        principalTable: "users",
                        principalColumn: "ActiveWorkspaceId");
                });

            migrationBuilder.CreateTable(
                name: "activities",
                schema: "tt",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "uuid_generate_v4()"),
                    activity_name = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    description = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    side_id = table.Column<byte>(type: "smallint", nullable: true),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkspaceId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_activities", x => x.id);
                    table.ForeignKey(
                        name: "FK_activities_users_UserId",
                        column: x => x.UserId,
                        principalSchema: "tt",
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_activities_workspace_WorkspaceId",
                        column: x => x.WorkspaceId,
                        principalSchema: "tt",
                        principalTable: "workspace",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "time_entry",
                schema: "tt",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "uuid_generate_v4()"),
                    description = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    start = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    end = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ActivityId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_time_entry", x => x.id);
                    table.ForeignKey(
                        name: "FK_time_entry_activities_ActivityId",
                        column: x => x.ActivityId,
                        principalSchema: "tt",
                        principalTable: "activities",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_activities_UserId",
                schema: "tt",
                table: "activities",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_activities_WorkspaceId",
                schema: "tt",
                table: "activities",
                column: "WorkspaceId");

            migrationBuilder.CreateIndex(
                name: "IX_time_entry_ActivityId",
                schema: "tt",
                table: "time_entry",
                column: "ActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_workspace_ActiveWorkspaceUserId",
                schema: "tt",
                table: "workspace",
                column: "ActiveWorkspaceUserId");

            migrationBuilder.CreateIndex(
                name: "IX_workspace_UserId",
                schema: "tt",
                table: "workspace",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "time_entry",
                schema: "tt");

            migrationBuilder.DropTable(
                name: "activities",
                schema: "tt");

            migrationBuilder.DropTable(
                name: "workspace",
                schema: "tt");

            migrationBuilder.DropTable(
                name: "users",
                schema: "tt");
        }
    }
}
