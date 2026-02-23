using Microsoft.EntityFrameworkCore;
using Npgsql;
using Testcontainers.PostgreSql;
using TimeTracking.Persistence;
using TimeTracking.Persistence.Postgresql;

namespace TimeTracking.Service.Test.Databases;

/// <summary>
///   Test running on a postgresql Database
/// </summary>
public class PostgresContainerFixture: DatabaseFixtureBase
{
  #region Fields

  private PostgreSqlContainer _postgres = null!;

  #endregion

  #region Overrides

  /// <inheritdoc/>
  public override Context CreateDatabaseContext()
  {
    NpgsqlConnectionStringBuilder connectionStringBuilder = new(this.ConnectionString);
    connectionStringBuilder.IncludeErrorDetail = true;
    
    return new PostgresqlContext
    (
      new DbContextOptionsBuilder<PostgresqlContext>()
        .UseNpgsql(connectionStringBuilder.ToString())
        .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking)
        .EnableSensitiveDataLogging()
        .EnableDetailedErrors()
        .Options
    );
  }

  /// <inheritdoc/>
  protected override async Task InitializeDatabaseAsync()
  {
    this._postgres = new PostgreSqlBuilder()
      .WithDatabase("postgres")
      .WithUsername("postgres")
      .WithPassword("postgres")
      .Build();

    await this._postgres.StartAsync();
    ConnectionString = this._postgres.GetConnectionString();
  }

  /// <inheritdoc/>
  protected override async Task DisposeDatabaseAsync()
    => await this._postgres.DisposeAsync();

  #endregion
}