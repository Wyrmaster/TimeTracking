using Microsoft.EntityFrameworkCore;
using TimeTracking.Persistence;
using TimeTracking.Persistence.Entities;
using TimeTracking.Service.Dto.Data;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Services;

/// <inheritdoc cref="ITimeTrackingService"/>
public class TimeTrackingService(Context context, ITimeHub? timeHub = null) : ITimeTrackingService
{
  #region Constants

  /// <summary>
  ///   Time entries stopped before running this long are removed again, as they were most likely started by accident
  /// </summary>
  private static readonly TimeSpan MinimumDuration = TimeSpan.FromSeconds(60);

  #endregion

  #region TimeTrackingSide

  /// <inheritdoc cref="ITimeTrackingService.SetSideIdAsync"/>
  public async Task<ActivityTrackingDto> SetSideIdAsync(string username, int sideId, CancellationToken cancellationToken = default)
  {
    DateTime now = DateTime.UtcNow;

    await this.StopActiveTimeEntryAsync(username, now, cancellationToken);

    Activity? activity = sideId == 0
      ? null
      : await this.FindActivityBySideAsync(username, sideId, cancellationToken);

    if (activity != null)
    {
      this.AddTimeEntry(activity, string.Empty, now);
    }

    await context.SaveChangesAsync(cancellationToken);

    await this.NotifyAsync(username, activity?.Id, now, cancellationToken);

    return new ActivityTrackingDto(activity?.Id ?? 0, now);
  }

  /// <inheritdoc cref="ITimeTrackingService.GetSideIdAsync"/>
  public async Task<byte?> GetSideIdAsync(string username, CancellationToken cancellationToken = default)
  {
    TimeEntry? data = await context
      .TimeEntries
      .Include(entity => entity.Activity)
      .FirstOrDefaultAsync
      (
        entity => entity.End == null
                  && entity.Activity != null
                  && entity.Activity.Workspace != null
                  && entity.Activity.Workspace.User != null
                  && entity.Activity.Workspace.User.Username == username,
        cancellationToken: cancellationToken
      );

    return data?.Activity?.SideId ?? 0;
  }

  #endregion

  #region TimeTracking

  /// <inheritdoc cref="ITimeTrackingService.GetTimeEntriesAsync"/>
  public async Task<IEnumerable<TimeEntryDto>> GetTimeEntriesAsync
  (
    string userName,
    long? workspaceId = null,
    int offset = 0,
    int count = Int32.MaxValue,
    DateTime? from = null,
    DateTime? to = null,
    long[]? activities = null,
    CancellationToken token = default
  )
  {
    DateTime?
      fromUtc = from?.ToUniversalTime(),
      toUtc = to?.ToUniversalTime();
    
    IQueryable<TimeEntry> timeEntries = context
      .TimeEntries
      .Include(entity => entity.Activity)
      .ThenInclude(entity => entity!.Workspace)
      .ThenInclude(entity => entity!.User)
      .Where(entity => entity.Activity != null
                       && entity.Activity.Workspace != null
                       && entity.Activity.Workspace.User != null
                       && entity.Activity.Workspace.User.Username == userName
      );

    timeEntries = this.FilterByWorkspace(workspaceId, timeEntries);

    timeEntries = this.FilterByActivities(activities, timeEntries);
    
    timeEntries = this.FilterByDateRange(fromUtc, toUtc, timeEntries);
    
    timeEntries = timeEntries.OrderBy(entry => entry.Start);

    List<TimeEntry> entries = await timeEntries
      .Skip(offset)
      .Take(count)
      .ToListAsync(cancellationToken: token);

    return entries.Select(timeEntry => new TimeEntryDto
    {
      Id = timeEntry.Id,
      Start = timeEntry.Start,
      End = timeEntry.End,
      Description = timeEntry.Description,
      Activity = new ActivityDto
      {
        Id = timeEntry.Activity!.Id,
        Name = timeEntry.Activity.ActivityName,
        Description = timeEntry.Activity.Description,
        ActivityColor = timeEntry.Activity.Color,
        Assigned = timeEntry.Activity.SideId != null
      }
    });
  }

  /// <inheritdoc cref="ITimeTrackingService.StartTrackingAsync"/>
  public async Task<bool> StartTrackingAsync(string userName, StartActivityDto startActivityDto, CancellationToken token = default)
  {
    Activity? activity = await this.FindOwnedActivityAsync(userName, startActivityDto.ActivityId, token);

    if (activity == null)
    {
      return false;
    }

    DateTime now = DateTime.UtcNow;

    await this.StopActiveTimeEntryAsync(userName, now, token);
    this.AddTimeEntry(activity, startActivityDto.Description, now);

    await context.SaveChangesAsync(token);

    await this.NotifyAsync(userName, activity.Id, now, token);

    return true;
  }

  /// <inheritdoc cref="ITimeTrackingService.StopTrackingAsync"/>
  public async Task StopTrackingAsync(string userName, CancellationToken token = default)
  {
    DateTime now = DateTime.UtcNow;

    await this.StopActiveTimeEntryAsync(userName, now, token);
    await context.SaveChangesAsync(token);

    await this.NotifyAsync(userName, null, now, token);
  }

  /// <inheritdoc cref="ITimeTrackingService.SwitchTrackingWorkspaceAsync"/>
  public async Task<ActivityTrackingDto> SwitchTrackingWorkspaceAsync
  (
    string userName,
    Workspace workspace,
    CancellationToken token = default
  )
  {
    DateTime now = DateTime.UtcNow;

    // the activity on the same dice side keeps being tracked within the new workspace
    TimeEntry? stopped = await this.StopActiveTimeEntryAsync(userName, now, token);
    byte? sideId = stopped?.Activity?.SideId;

    Activity? activity = sideId == null
      ? null
      : await context
        .Activities
        .AsTracking()
        .FirstOrDefaultAsync
        (
          entity => entity.Workspace != null
                    && entity.Workspace.Id == workspace.Id
                    && entity.SideId == sideId,
          token
        );

    if (activity != null)
    {
      this.AddTimeEntry(activity, string.Empty, now);
    }

    return new ActivityTrackingDto(activity?.Id ?? 0, now);
  }

  /// <inheritdoc cref="ITimeTrackingService.AddTimeEntryAsync"/>
  public async Task<bool> AddTimeEntryAsync(string userName, TimeEntryDto timeEntryDto, CancellationToken token = default)
  {
    Activity? activity = timeEntryDto.Activity == null
      ? null
      : await this.FindOwnedActivityAsync(userName, timeEntryDto.Activity.Id, token);

    if (activity == null)
    {
      return false;
    }

    context.TimeEntries.Add(new TimeEntry
    {
      Activity = activity,
      Description = timeEntryDto.Description,
      Start = timeEntryDto.Start,
      End = timeEntryDto.End,
    });

    return await context.SaveChangesAsync(token) > 0;
  }

  /// <inheritdoc cref="ITimeTrackingService.UpdateTimeEntryAsync"/>
  public async Task<bool> UpdateTimeEntryAsync(string userName, TimeEntryDto timeEntryDto, CancellationToken token = default)
  {
    TimeEntry? timeEntry = await context
      .TimeEntries
      .AsTracking()
      .Include(entity => entity.Activity)
      .FirstOrDefaultAsync
      (
        entry => entry.Id == timeEntryDto.Id
                 && entry.Activity != null
                 && entry.Activity.Workspace != null
                 && entry.Activity.Workspace.User != null
                 && entry.Activity.Workspace.User.Username == userName,
        cancellationToken: token
      );

    if (timeEntry == null)
    {
      return false;
    }

    timeEntry.Description = timeEntryDto.Description;
    timeEntry.Start = timeEntryDto.Start;
    timeEntry.End = timeEntryDto.End;

    // only activities of the same user can be assigned, without an activity the current one is kept
    if (timeEntryDto.Activity != null && timeEntry.Activity?.Id != timeEntryDto.Activity.Id)
    {
      Activity? activity = await this.FindOwnedActivityAsync(userName, timeEntryDto.Activity.Id, token);

      if (activity == null)
      {
        return false;
      }

      timeEntry.Activity = activity;
    }

    await context.SaveChangesAsync(token);

    return true;
  }

  /// <inheritdoc cref="ITimeTrackingService.RemoveTimeEntryAsync"/>
  public async Task<bool> RemoveTimeEntryAsync(string userName, long timeEntryId, CancellationToken token = default)
  {
    TimeEntry? timeEntry = await context
      .TimeEntries
      .AsTracking()
      .FirstOrDefaultAsync
      (
        entry => entry.Id == timeEntryId
                 && entry.Activity != null
                 && entry.Activity.Workspace != null
                 && entry.Activity.Workspace.User != null
                 && entry.Activity.Workspace.User.Username == userName,
        cancellationToken: token
      );

    if (timeEntry == null)
    {
      return false;
    }
    
    context.TimeEntries.Remove(timeEntry);
    await context.SaveChangesAsync(token);
    
    return true;
  }

  /// <inheritdoc cref="ITimeTrackingService.GetTrackingStateAsync"/>
  public async Task<TrackingStateDto> GetTrackingStateAsync(string userName, CancellationToken token = default)
  {
    // only scalar projections are queried, so no entities are loaded or tracked
    IQueryable<TimeEntry> timeEntries = context
      .TimeEntries
      .AsNoTracking()
      .Where(entity => entity.Activity != null
                       && entity.Activity.Workspace != null
                       && entity.Activity.Workspace.User != null
                       && entity.Activity.Workspace.User.Username == userName
      );

    int count = await timeEntries.CountAsync(token);

    long? latestId = await timeEntries.MaxAsync(entity => (long?)entity.Id, token);

    var active = await timeEntries
      .Where(entity => entity.End == null)
      .Select(entity => new
      {
        entity.Id,
        ActivityId = entity.Activity!.Id,
        entity.Start
      })
      .FirstOrDefaultAsync(token);

    long? activeWorkspaceId = await context
      .Users
      .AsNoTracking()
      .Where(user => user.Username == userName)
      .Select(user => user.ActiveWorkspaceId)
      .FirstOrDefaultAsync(token);

    return new TrackingStateDto
    (
      $"{count}-{latestId}-{active?.Id}-{active?.Start?.Ticks}-{activeWorkspaceId}",
      active?.ActivityId
    );
  }

  #endregion
  
  #region Private Methods

  /// <summary>
  ///   Ends the time entry the user is currently tracking. Time entries shorter than <see cref="MinimumDuration"/> are
  ///   removed instead. The changes are not saved.
  /// </summary>
  /// <param name="userName">name of the user to stop tracking for</param>
  /// <param name="now">timestamp the time entry ends at</param>
  /// <param name="token"></param>
  /// <returns>the stopped time entry, null if nothing was tracked</returns>
  private async Task<TimeEntry?> StopActiveTimeEntryAsync(string userName, DateTime now, CancellationToken token)
  {
    TimeEntry? timeEntry = await context
      .TimeEntries
      .AsTracking()
      .Include(entity => entity.Activity)
      .FirstOrDefaultAsync
      (
        entity => entity.End == null
                  && entity.Activity != null
                  && entity.Activity.Workspace != null
                  && entity.Activity.Workspace.User != null
                  && entity.Activity.Workspace.User.Username == userName,
        token
      );

    if (timeEntry == null)
    {
      return null;
    }

    timeEntry.End = now;

    if (timeEntry.Start == null || now - timeEntry.Start.Value < MinimumDuration)
    {
      context.TimeEntries.Remove(timeEntry);
    }

    return timeEntry;
  }

  /// <summary>
  ///   Adds a new, running time entry to an activity. The changes are not saved.
  /// </summary>
  /// <param name="activity">tracked activity the time entry belongs to</param>
  /// <param name="description">description of the time entry</param>
  /// <param name="now">timestamp the time entry starts at</param>
  private void AddTimeEntry(Activity activity, string description, DateTime now)
    => context.TimeEntries.Add(new TimeEntry
    {
      Activity = activity,
      Description = description,
      Start = now,
    });

  /// <summary>
  ///   Finds an activity that belongs to the given user
  /// </summary>
  /// <param name="userName">name of the user</param>
  /// <param name="activityId">id of the activity</param>
  /// <param name="token"></param>
  /// <returns>the tracked activity, null if it does not exist or belongs to another user</returns>
  private Task<Activity?> FindOwnedActivityAsync(string userName, long activityId, CancellationToken token)
    => context
      .Activities
      .AsTracking()
      .FirstOrDefaultAsync
      (
        entity => entity.Id == activityId
                  && entity.Workspace != null
                  && entity.Workspace.User != null
                  && entity.Workspace.User.Username == userName,
        token
      );

  /// <summary>
  ///   Finds the activity assigned to a dice side within the active workspace of a user
  /// </summary>
  /// <param name="userName">name of the user</param>
  /// <param name="sideId">id of the dice side</param>
  /// <param name="token"></param>
  /// <returns></returns>
  private Task<Activity?> FindActivityBySideAsync(string userName, int sideId, CancellationToken token)
    => context
      .Activities
      .AsTracking()
      .FirstOrDefaultAsync
      (
        entity => entity.SideId == sideId
                  && entity.Workspace != null
                  && entity.Workspace.User != null
                  && entity.Workspace.User.Username == userName
                  && entity.Workspace.User.ActiveWorkspaceId == entity.Workspace.Id,
        token
      );

  /// <summary>
  ///   Notifies connected clients about a change of the tracked activity
  /// </summary>
  /// <param name="userName">name of the user</param>
  /// <param name="activityId">id of the activity that started tracking, null if tracking only stopped</param>
  /// <param name="now">timestamp of the change</param>
  /// <param name="token"></param>
  private async Task NotifyAsync(string userName, long? activityId, DateTime now, CancellationToken token)
  {
    if (timeHub == null)
    {
      return;
    }

    await timeHub.StopTrackingAsync(userName, token);

    if (activityId != null)
    {
      await timeHub.StartTrackingAsync(userName, activityId.Value, now, token);
    }
  }

  /// <summary>
  ///   Filters a set of time entries by workspace
  /// </summary>
  /// <param name="workspaceId">optional workspace id if this is <c>NULL</c> the default one is used</param>
  /// <param name="timeEntries">collection of time entries</param>
  /// <returns></returns>
  private IQueryable<TimeEntry> FilterByWorkspace(long? workspaceId, IQueryable<TimeEntry> timeEntries)
  {
    if (workspaceId.HasValue)
    {
      timeEntries = timeEntries
        .Where(entity => entity.Activity != null
                         && entity.Activity.Workspace != null
                         && entity.Activity.Workspace.Id == workspaceId
        );
    }
    else
    {
      timeEntries = timeEntries
        .Where(entity => entity.Activity != null 
                         && entity.Activity.Workspace != null 
                         && entity.Activity.Workspace.User != null
                         && entity.Activity.Workspace.User.ActiveWorkspaceId == entity.Activity.Workspace.Id
        );
    }

    return timeEntries;
  }
  
  /// <summary>
  ///   Filter a collection of time entries by activities
  /// </summary>
  /// <param name="activities">collection of activity ids</param>
  /// <param name="timeEntries">collection of time entries</param>
  /// <returns></returns>
  private IQueryable<TimeEntry> FilterByActivities(long[]? activities, IQueryable<TimeEntry> timeEntries)
  {
    if (activities is { Length: > 0 })
    {
      // force linq contains here so ef core can properly translate this into sql
      // nullability warning on activity can be ignored as this is translated to sql 
      timeEntries = timeEntries.Where(entry => Enumerable.Contains(activities, entry.Activity!.Id));
    }

    return timeEntries;
  }

  /// <summary>
  ///   Filters the provided time entries to include only those that fall within the specified date range.
  /// </summary>
  /// <param name="fromUtc">The start of the date range in UTC. Entries starting or ending after this date will be included.</param>
  /// <param name="toUtc">The end of the date range in UTC. Entries starting or ending before this date will be included.</param>
  /// <param name="timeEntries">The collection of time entries to filter.</param>
  /// <returns>A filtered collection of time entries that fall within the specified date range.</returns>
  private IQueryable<TimeEntry> FilterByDateRange(DateTime? fromUtc, DateTime? toUtc, IQueryable<TimeEntry> timeEntries)
  {
    if (fromUtc != null && toUtc != null)
    {
      timeEntries = timeEntries.Where
      (
        entry => fromUtc <= entry.Start && entry.Start <= toUtc
                 || fromUtc <= entry.End && entry.End <= toUtc
                 || entry.Start <= fromUtc && toUtc <= entry.End
                 || entry.End == null && entry.Start >= fromUtc && entry.Start <= DateTime.UtcNow
      );
    }

    return timeEntries;
  }

  #endregion
}