using TimeTracking.Service.Test.Databases;

namespace TimeTracking.Service.Test.Postgresql;

/// <summary>
///   Time Tracking Dice tests for PostgreSql Databases
/// </summary>
public sealed class TimeTrackingDicePostgresqlTests : TimeTrackingDiceTests<PostgresContainerFixture>;
