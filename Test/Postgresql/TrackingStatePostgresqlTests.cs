using TimeTracking.Service.Test.Databases;

namespace TimeTracking.Service.Test.Postgresql;

/// <summary>
///   Tracking state tests for PostgreSql Databases
/// </summary>
public sealed class TrackingStatePostgresqlTests : TrackingStateTests<PostgresContainerFixture>;
