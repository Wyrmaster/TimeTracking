using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TimeTracking.Persistence.Entities;
using TimeTracking.Persistence.Entities.Abstract;
using TimeTracking.Persistence.PseudoEntities;

namespace TimeTracking.Persistence.SqLite;

/// <summary>
///   Implementation for SQLite
/// </summary>
public class SqLiteContext : Context
{
  #region Constructor

  public SqLiteContext(DbContextOptions options) : base(options)
  {
  }

  #endregion

  #region Overrides

  /// <inheritdoc/>
  public override async Task<ActivityTracking> UpdateSideAsync(string username, int sideId, CancellationToken cancellationToken = default)
  {
    DateTime now = DateTime.UtcNow;

    await this.StartTrackingANewActivityAsync(username, sideId, now, cancellationToken);

    // get the current active timeentry and set it to end now
    TimeEntry? timeEntry = await
    (
      from u in this.Users
      join ws in this.Workspaces on u.ActiveWorkspaceId equals ws.Id
      // can be suppressed as it is converted to sql
      join a in this.Activities on ws.Id equals a.Workspace!.Id
      join t in this.TimeEntries on a.Id equals t.Activity!.Id
      where u.Username == username && t.End == null
      select t
    ).FirstOrDefaultAsync(cancellationToken);

    if (timeEntry != null)
    {
      timeEntry.End = now;
      this.Update(timeEntry);
    }

    await this.SaveChangesAsync(cancellationToken);

    return new()
    {
      ActivityId = timeEntry?.Activity?.Id ?? 0,
      Timestamp = now,
    };
  }

  /// <inheritdoc/>
  public override async Task<ActivityTracking> UpdateActiveWorkspace(long workspaceId, string username, CancellationToken cancellationToken = default)
  {
    DateTime now = DateTime.UtcNow;

    // get teh current tracking time entry
    TimeEntry? timeEntry = await (
      from u in this.Users
      join ws in this.Workspaces on u.ActiveWorkspaceId equals ws.Id
      // can be suppressed as it is converted to sql
      join a in this.Activities on u.Id equals a.Workspace!.Id
      join t in this.TimeEntries on a.Id equals t.Activity!.Id
      where u.Username == username && t.End == null
      select t
    ).FirstOrDefaultAsync(cancellationToken);

    int? sideId = timeEntry?.Activity?.SideId;

    // if available set the entry to end now
    if (timeEntry != null)
    {
      timeEntry.End = now;
      this.TimeEntries.Update(timeEntry);
    }
    
    // get the current logged in user
    User? user = await (
        from u in this.Users
        join ws in this.Workspaces on u.ActiveWorkspaceId equals ws.Id
        where u.Username == username
        select u
    ).AsTracking().FirstOrDefaultAsync(cancellationToken);
    
    // get the new workspace
    Workspace? workspace = await (
      from ws in this.Workspaces
      where ws.Id == workspaceId
      select ws
    ).AsTracking().FirstOrDefaultAsync(cancellationToken);
    
    // update the user with the new workspace
    if (user != null && workspace != null)
    {
      user.ActiveWorkspace = workspace;
      this.Users.Update(user);
    }

    // start tracking the new activity if available
    if (sideId != null)
    {
      await this.StartTrackingANewActivityAsync(username, sideId.Value, now, cancellationToken);
    }

    await this.SaveChangesAsync(cancellationToken);
    
    return new()
    {
      ActivityId = timeEntry?.Activity?.Id ?? 0,
      Timestamp = now,
    };
  }

  /// <inheritdoc/>
  public override async Task StopTrackingAsync(string username, CancellationToken cancellationToken = default)
  {
    TimeEntry? stoppedEntry = await this.StopTrackingWithTimestampAsync(username, DateTime.UtcNow, cancellationToken);
    this.Clean(stoppedEntry);
    await this.SaveChangesAsync(cancellationToken);
  }

  /// <inheritdoc/>
  public override async Task<ActivityTracking> StartTrackingAsync(string username, long activityId, string description = "", CancellationToken cancellationToken = default)
  {
    DateTime now = DateTime.UtcNow;

    await this.StopTrackingWithTimestampAsync(username, now, cancellationToken);

    // tracked, otherwise adding the time entry would insert the activity a second time
    Activity activity = await this.Activities
      .AsTracking()
      .FirstAsync(entry => entry.Id == activityId, cancellationToken: cancellationToken);
    
    this.TimeEntries.Add(new TimeEntry
    {
      Activity = activity,
      Description = description,
      Start = now,
    });
    
    await this.SaveChangesAsync(cancellationToken);

    return new()
    {
      ActivityId = activity.Id,
      Timestamp = now,
    };
  }
  
  /// <inheritdoc/>
  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<Activity>(builder => this.SetIdToAutoGenerate(builder));
    modelBuilder.Entity<TimeEntry>(builder => this.SetIdToAutoGenerate(builder));
    modelBuilder.Entity<User>(builder => this.SetIdToAutoGenerate(builder));
    modelBuilder.Entity<Workspace>(builder => this.SetIdToAutoGenerate(builder));
  }

  #endregion

  #region Private Methods

  /// <summary>
  ///   Start Tracking the new activity based on the dice side
  /// </summary>
  /// <param name="username">name of the user to start tracking a new activity</param>
  /// <param name="sideId">id of the side to update to</param>
  /// <param name="now">timestamp to use for tracking</param>
  /// <param name="cancellationToken"></param>
  private async Task StartTrackingANewActivityAsync
  (
    string username,
    int sideId,
    DateTime now,
    CancellationToken cancellationToken = default
  )
  { 
    if (sideId == 0)
    {
      return;
    }
    
    Activity? activity = await
    (
      from u in this.Users
      join ws in this.Workspaces on u.ActiveWorkspaceId equals ws.Id
      // can be suppressed as it is converted to sql
      join a in this.Activities on ws.Id equals a.Workspace!.Id
      where u.Username == username && a.SideId == sideId
      select a
    )
    .AsTracking()
    .FirstOrDefaultAsync(cancellationToken);

    if (activity != null)
    {
      activity.TimeEntries.Add(new() { Start = now });
    }
  }
  
  /// <summary>
  ///   Stops the current activity from tracking now
  /// </summary>
  /// <param name="username">name of the user on which to stop tracking an activity</param>
  /// <param name="now">timestamp to stop tracking at</param>
  /// <param name="cancellationToken"></param>
  private async Task<TimeEntry?> StopTrackingWithTimestampAsync(string username, DateTime now, CancellationToken cancellationToken = default)
  {
    // Stop tracking the previous active activity (set end timestamp)
    TimeEntry? entry = await (
      from u in this.Users
      join ws in this.Workspaces on u.ActiveWorkspaceId equals ws.Id
      // can be suppressed as it is converted to sql
      join a in this.Activities on u.Id equals a.Workspace !.Id
      join t in this.TimeEntries on a.Id equals t.Activity !.Id
      where u.Username == username && t.End == null
      select t
    ).FirstOrDefaultAsync(cancellationToken);

    if (entry != null)
    {
      entry.End = now;
      this.Update(entry);
    }

    return entry;
  }
  
  /// <summary>
  ///   Define default values
  /// </summary>
  /// <param name="builder"></param>
  /// <typeparam name="T"></typeparam>
  /// <returns></returns>
  private EntityTypeBuilder<T> SetIdToAutoGenerate<T>(EntityTypeBuilder<T> builder) where T : BaseEntity
  {
    builder
      .Property(e => e.Id)
      .HasAnnotation("Sqlite:Autoincrement", true);


    return builder;
  }

  /// <summary>
  ///   Removes the given, just stopped time entry if it has been active for less than 60 seconds
  /// </summary>
  /// <remarks>
  ///   The duration is calculated in memory, as sqlite stores timestamps as text and is therefore unable to
  ///   subtract them within a query.
  /// </remarks>
  /// <param name="stoppedEntry">time entry that just stopped tracking, null if nothing was tracked</param>
  private void Clean(TimeEntry? stoppedEntry)
  {
    if (stoppedEntry is { Start: not null, End: not null }
        && stoppedEntry.End.Value - stoppedEntry.Start.Value < TimeSpan.FromSeconds(60))
    {
      this.TimeEntries.Remove(stoppedEntry);
    }
  }

  #endregion
}