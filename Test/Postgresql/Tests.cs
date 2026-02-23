using TimeTracking.Service.Test.Databases;

namespace TimeTracking.Service.Test.Postgresql;

/// <summary>
///   Time Tracking Dice tests for PostgreSql Databases
/// </summary>
public sealed class ActivityActivityPostgesqlTests : ActivityTests<PostgresContainerFixture>;

/// <summary>
///   Time Tracking Dice tests for PostgreSql Databases
/// </summary>
public sealed class TimeTrackingDiceTestsPostgesqlTests : TimeTrackingDiceTests<PostgresContainerFixture>;

/// <summary>
///   Workspace tests for PostgreSql Databases
/// </summary>
public sealed class WorkspaceWorkspacePostgesqlTests : WorkspaceTests<PostgresContainerFixture>;

/// <summary>
///   User tests for PostgreSql Databases
/// </summary>
public sealed class UserPostgresqlTests : UserTest<PostgresContainerFixture>;