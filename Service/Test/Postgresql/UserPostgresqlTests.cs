using TimeTracking.Service.Test.Databases;

namespace TimeTracking.Service.Test.Postgresql;

/// <summary>
///   User tests for PostgreSql Databases
/// </summary>
public sealed class UserPostgresqlTests : UserTest<PostgresContainerFixture>;
