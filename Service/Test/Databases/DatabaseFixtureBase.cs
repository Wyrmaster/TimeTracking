using Microsoft.EntityFrameworkCore;
using TimeTracking.Persistence;

namespace TimeTracking.Service.Test.Databases;

/// <summary>
///   Abstract base class for Database Fixtures
/// </summary>
public abstract class DatabaseFixtureBase: IAsyncLifetime
{
  #region Fields

  public string ConnectionString = null!;

  #endregion

  #region Abstract Methods

  /// <summary>
  ///   Creates a new EF Core Context
  /// </summary>
  /// <returns></returns>
  public abstract Context CreateDatabaseContext();
  
  /// <summary>
  ///   Initializes the database.
  /// </summary>
  /// <returns></returns>
  protected abstract Task InitializeDatabaseAsync();
  
  /// <summary>
  ///   Database Cleanup
  /// </summary>
  /// <returns></returns>
  protected abstract Task DisposeDatabaseAsync();

  #endregion

  #region AsyncLifetime

  /// <inheritdoc/>
  public async Task InitializeAsync()
  {
    await InitializeDatabaseAsync();
    await using var context = this.CreateDatabaseContext();
    await context.Database.MigrateAsync();
  }

  /// <inheritdoc/>
  public async Task DisposeAsync() => await DisposeDatabaseAsync();

  #endregion
}