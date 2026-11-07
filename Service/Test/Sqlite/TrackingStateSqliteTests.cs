using TimeTracking.Service.Test.Databases;

namespace TimeTracking.Service.Test.Sqlite;

/// <summary>
///   Tracking state tests for Sqlite Databases
/// </summary>
public sealed class TrackingStateSqliteTests : TrackingStateTests<SqliteContainerFixture>;
