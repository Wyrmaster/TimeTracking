using TimeTracking.Service.Test.Databases;

namespace TimeTracking.Service.Test.Postgresql;

/// <summary>
///   Activity tests for PostgreSql Databases
/// </summary>
public sealed class ActivityPostgresqlTests : ActivityTests<PostgresContainerFixture>;
