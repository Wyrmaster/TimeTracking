using TimeTracking.Service.Test.Databases;

namespace TimeTracking.Service.Test.Postgresql;

/// <summary>
///   Workspace tests for PostgreSql Databases
/// </summary>
public sealed class WorkspacePostgresqlTests : WorkspaceTests<PostgresContainerFixture>;
