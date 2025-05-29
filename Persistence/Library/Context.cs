using System.Reflection;
using Microsoft.EntityFrameworkCore;
using TimeTracking.Persistence.Entities;

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

  #endregion

  #region Overrides

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);
    
    modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
  }

  #endregion
}