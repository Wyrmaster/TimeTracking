using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TimeTracking.Persistence.Postgresql.Migrations
{
    /// <inheritdoc />
    public partial class Migration0Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "tt");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:uuid-ossp", ",,");

            migrationBuilder.CreateTable(
                name: "activities",
                schema: "tt",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    activity_name = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    description = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    side_id = table.Column<byte>(type: "smallint", nullable: true),
                    Color = table.Column<int>(type: "integer", nullable: false),
                    workspace_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_activities", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "time_entry",
                schema: "tt",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    description = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    start = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    end = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    activity_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_time_entry", x => x.id);
                    table.ForeignKey(
                        name: "FK_time_entry_activities_activity_id",
                        column: x => x.activity_id,
                        principalSchema: "tt",
                        principalTable: "activities",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "users",
                schema: "tt",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    username = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    password = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    active_workspace_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "workspace",
                schema: "tt",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    description = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    is_default = table.Column<bool>(type: "boolean", nullable: false),
                    fk_user_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_workspace", x => x.id);
                    table.ForeignKey(
                        name: "FK_workspace_users_fk_user_id",
                        column: x => x.fk_user_id,
                        principalSchema: "tt",
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_activities_workspace_id",
                schema: "tt",
                table: "activities",
                column: "workspace_id");

            migrationBuilder.CreateIndex(
                name: "IX_time_entry_activity_id",
                schema: "tt",
                table: "time_entry",
                column: "activity_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_active_workspace_id",
                schema: "tt",
                table: "users",
                column: "active_workspace_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_workspace_fk_user_id",
                schema: "tt",
                table: "workspace",
                column: "fk_user_id");

            migrationBuilder.AddForeignKey(
                name: "FK_activities_workspace_workspace_id",
                schema: "tt",
                table: "activities",
                column: "workspace_id",
                principalSchema: "tt",
                principalTable: "workspace",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_users_workspace_active_workspace_id",
                schema: "tt",
                table: "users",
                column: "active_workspace_id",
                principalSchema: "tt",
                principalTable: "workspace",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_users_workspace_active_workspace_id",
                schema: "tt",
                table: "users");

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
