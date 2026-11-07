using System.Reflection;
using Microsoft.EntityFrameworkCore;
using TimeTracking.Persistence.Entities;
using TimeTracking.Persistence.Converters;

namespace TimeTracking.Persistence;

/// <summary>
///   Generic Database Context
/// </summary>
public abstract class Context: DbContext
{
  #region Constructor

  protected Context(DbContextOptions options): base(options)
  {
    
  }

  #endregion

  #region Properties

  /// <summary>
  ///   Users
  /// </summary>
  public DbSet<User> Users { get; set; }

  /// <summary>
  ///   Activities
  /// </summary>
  public DbSet<Activity> Activities { get; set; }

  /// <summary>
  ///   TimeEntries 
  /// </summary>
  public DbSet<TimeEntry> TimeEntries { get; set; }

  /// <summary>
  ///   Workspaces
  /// </summary>
  public DbSet<Workspace> Workspaces { get; set; }

  #endregion

  #region Overrides

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);
    
    modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
  }

  /// <inheritdoc/>
  protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
  {
    base.ConfigureConventions(configurationBuilder);

    // every timestamp is stored and read as utc, independent of the database provider
    configurationBuilder
      .Properties<DateTime>()
      .HaveConversion<UtcDateTimeConverter>();
    configurationBuilder
      .Properties<DateTime?>()
      .HaveConversion<UtcDateTimeConverter>();
  }

  #endregion
}