using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using TimeTracking.Persistence;
using TimeTracking.Persistence.SqLite;

namespace TimeTracking.Service.Test.Databases;

/// <summary>
///   Fixture for a Sqlite Database
/// </summary>
public class SqliteContainerFixture: DatabaseFixtureBase
{
  #region Fields

  private string _path = null!;

  #endregion
  
  #region Overrides

  /// <inheritdoc/>
  public override Context CreateDatabaseContext() =>
    new SqLiteContext
    (
      new DbContextOptionsBuilder<SqLiteContext>()
        .UseSqlite(this.ConnectionString)
        .UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking)
        .EnableSensitiveDataLogging()
        .EnableDetailedErrors()
        .Options
    );

  protected override Task InitializeDatabaseAsync()
  {
    SqliteConnectionStringBuilder connectionStringBuilder = new();
    this._path = Path.Combine(Path.GetTempPath(), $"TimeTracking_Test_{Guid.NewGuid()}.db");
    connectionStringBuilder.DataSource = this._path;
    connectionStringBuilder.Pooling = false;
    
    this.ConnectionString = connectionStringBuilder.ToString();
    
    return Task.CompletedTask;
  }

  protected override Task DisposeDatabaseAsync()
  {
    SqliteConnection.ClearAllPools();
    
    File.Delete(this._path);
    
    return Task.CompletedTask;
  }

  #endregion
}