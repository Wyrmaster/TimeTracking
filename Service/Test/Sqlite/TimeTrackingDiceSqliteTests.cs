using TimeTracking.Service.Test.Databases;

namespace TimeTracking.Service.Test.Sqlite;

/// <summary>
///   Time Tracking Dice tests for Sqlite Databases
/// </summary>
public sealed class TimeTrackingDiceSqliteTests : TimeTrackingDiceTests<SqliteContainerFixture>;
