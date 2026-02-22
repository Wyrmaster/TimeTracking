using System.Reflection;
using Microsoft.EntityFrameworkCore;
using TimeTracking.Persistence.Entities;
using TimeTracking.Persistence.PseudoEntities;

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

  #region Abstract Methods

  /// <summary>
  ///   Update the side and track the times to the associeted activities
  /// </summary>
  /// <param name="username">associated username</param>
  /// <param name="sideId">new side id</param>
  /// <param name="cancellationToken"></param>
  public abstract Task<ActivityTracking> UpdateSideAsync(string username, int sideId, CancellationToken cancellationToken = default);
  
  /// <summary>
  ///   Updates the active workspace for a specific user
  /// </summary>
  /// <param name="workspaceId">id of the workspace to change to</param>
  /// <param name="username">name of the user where the active workspace should be changed</param>
  /// <param name="cancellationToken"></param>
  /// <returns></returns>
  public abstract Task<ActivityTracking> UpdateActiveWorkspace(long workspaceId,  string username, CancellationToken cancellationToken = default);

  /// <summary>
  ///   Stops the current active Activity
  /// </summary>
  /// <param name="username">name of the user where the active workspace should be changed</param>
  /// <param name="cancellationToken"></param>
  /// <returns></returns>
  public abstract Task StopTrackingAsync(string username, CancellationToken cancellationToken = default);

  /// <summary>
  ///   Starts tracking a given Activity
  /// </summary>
  /// <param name="username">name of the user where the active workspace should be changed</param>
  /// <param name="activityId">id of an activity to start tracking</param>
  /// <param name="description">description of a time tracking instance</param>
  /// <param name="cancellationToken"></param>
  /// <returns></returns>
  public abstract Task<ActivityTracking> StartTrackingAsync(string username, long activityId, string description = "", CancellationToken cancellationToken = default);

  #endregion

  #region Overrides

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);
    
    modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
  }

  /// <inheritdoc/>
  // overrides the parameterless syncronous save method as well
  public override int SaveChanges(bool acceptAllChangesOnSuccess)
  {
    int result = base.SaveChanges(acceptAllChangesOnSuccess);
    this.ChangeTracker.Clear();

    return result;
  }

  /// <inheritdoc/>
  // overrides the parameterless asynchronous save method as well
  public override async Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
  {
    int result = await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    this.ChangeTracker.Clear();
    
    return result;
  }

  #endregion
}