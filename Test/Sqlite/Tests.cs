using TimeTracking.Service.Test.Databases;

namespace TimeTracking.Service.Test.Sqlite;

/// <summary>
///   Time Tracking Dice tests for Sqlite Databases
/// </summary>
public sealed class ActivitySqliteTests : ActivityTests<SqliteContainerFixture>;

/// <summary>
///   Time Tracking Dice tests for Sqlite Databases
/// </summary>
public sealed class TimeTrackingDiceTestsSqliteTests : TimeTrackingDiceTests<SqliteContainerFixture>;

/// <summary>
///   Workspace tests for Sqlite Databases
/// </summary>
public sealed class WorkspaceWorkspaceSqliteTests : WorkspaceTests<SqliteContainerFixture>;

/// <summary>
///   User tests for SqliteSql Databases
/// </summary>
public sealed class UserSqliteTests : UserTest<SqliteContainerFixture>;