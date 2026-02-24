using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using TimeTracking.Persistence;
using TimeTracking.Persistence.Entities;
using TimeTracking.Persistence.PseudoEntities;
using TimeTracking.Service.Dto.Data;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Services;

/// <inheritdoc cref="ITimeTrackingService"/>
public class TimeTrackingService(Context context, ITimeHub? timeHub = null) : ITimeTrackingService
{
  #region Fields

  private readonly IDictionary<string,int> _userData = new ConcurrentDictionary<string, int>();

  #endregion
  
  #region TimeTrackingSide

  /// <inheritdoc cref="ITimeTrackingService.SetSideIdAsync"/>
  public async Task SetSideIdAsync(string username, int sideId, CancellationToken cancellationToken = default)
  {
    ActivityTracking tracking = await context.UpdateSideAsync(username, sideId, cancellationToken);
    if (tracking.ActivityId != 0)
    {
      await (timeHub?.StopTrackingAsync(username, cancellationToken) ?? Task.CompletedTask);
      await (timeHub?.StartTrackingAsync(username, tracking.ActivityId, tracking.Timestamp, cancellationToken) ?? Task.CompletedTask);
    }
  }

  /// <inheritdoc cref="ITimeTrackingService.GetSideIdAsync"/>
  public async Task<byte?> GetSideIdAsync(string username, CancellationToken cancellationToken = default)
  {
    TimeEntry? data = await context
      .TimeEntries
      .Include(entity => entity.Activity)
      .ThenInclude(entity => entity!.Workspace)
      .ThenInclude(entity => entity!.User)
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

  /// <inheritdoc cref="ITimeTrackingService.SetChargeAsync"/>
  public Task SetChargeAsync(string username, int charge, CancellationToken cancellationToken = default)
  {
    this._userData[username] = charge;
    
    return Task.CompletedTask;
  }

  /// <inheritdoc cref="ITimeTrackingService.GetChargeAsync"/>
  public Task<int> GetChargeAsync(string username, CancellationToken cancellationToken = default)
    => Task.FromResult
    (
      this._userData.ContainsKey(username) 
        ? this._userData[username] 
        : -1
    );

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
      fromUtc = from?.Date.ToUniversalTime(),
      toUtc = to?.Date.AddDays(1).AddMicroseconds(-1).ToUniversalTime();
    
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

    // force to sql to execute now so that timestamps retain their utc state and not converted by the database to the localtime
    List<TimeEntry> entries = await timeEntries
      .Skip(offset)
      .Take(count)
      .ToListAsync(cancellationToken: token);

    return entries.Select(timeEntry => new TimeEntryDto
    {
      Id = timeEntry.Id,
      Start = timeEntry.Start?.ToLocalTime(),
      End = timeEntry.End?.ToLocalTime(),
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

  /// <inheritdoc cref="ITimeTrackingService.StartTracking"/>
  public async Task<bool> StartTracking(string userName, StartActivityDto startActivityDto, CancellationToken token = default)
  {
    await context.StopTrackingAsync(userName, token);
    await (timeHub?.StopTrackingAsync(userName, token) ?? Task.CompletedTask);
    ActivityTracking tracking = await context.StartTrackingAsync(userName, startActivityDto.ActivityId, startActivityDto.Description, token);
    await (timeHub?.StartTrackingAsync(userName, startActivityDto.ActivityId, tracking.Timestamp, token) ?? Task.CompletedTask);

    return true;
  }

  /// <inheritdoc cref="ITimeTrackingService.StopTracking"/>
  public async Task<bool> StopTracking(string userName, CancellationToken token = default)
  {
    await context.StopTrackingAsync(userName, token);
    await (timeHub?.StopTrackingAsync(userName, token) ?? Task.CompletedTask);

    return true;
  }

  /// <inheritdoc cref="ITimeTrackingService.AddTimeEntryAsync"/>
  public async Task<bool> AddTimeEntryAsync(string userName, TimeEntryDto timeEntryDto, CancellationToken token = default)
  {
    Activity? activity = await context
      .Activities
      .AsTracking()
      .FirstOrDefaultAsync
      (
        a => a.Id == timeEntryDto.Activity.Id
             && a.Workspace != null
             && a.Workspace.User != null
             && a.Workspace.User.Username == userName,
        cancellationToken: token
      );
    
    if (activity == null)
    {
      return false;
    }

    TimeEntry timeEntry = new()
    {
      Activity = activity,
      Description = timeEntryDto.Description,
      Start = timeEntryDto.Start?.ToUniversalTime(),
      End = timeEntryDto.End?.ToUniversalTime(),
    };

    context.TimeEntries.Add(timeEntry);

    await context.SaveChangesAsync(token);

    return timeEntry.Id != 0L;
  }

  /// <inheritdoc cref="ITimeTrackingService.UpdateTimeEntryAsync"/>
  public async Task<bool> UpdateTimeEntryAsync(string userName, TimeEntryDto timeEntryDto, CancellationToken token = default)
  {
    TimeEntry? timeEntry = await context
      .TimeEntries
      .Include(timeEntry => timeEntry.Activity)
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
    timeEntry.Start = timeEntryDto.Start?.ToUniversalTime();
    timeEntry.End = timeEntryDto.End?.ToUniversalTime();

    if (
      timeEntry.Activity?.Id != timeEntryDto.Activity.Id
      && context.Activities.FirstOrDefault(a => a.Id == timeEntryDto.Activity.Id) is {} activity
    )
    {
      timeEntry.Activity = activity;
    }
    
    context.Update(timeEntry);
    await context.SaveChangesAsync(token);

    return true;
  }

  /// <inheritdoc cref="ITimeTrackingService.RemoteTimeEntry"/>
  public async Task<bool> RemoteTimeEntry(string userName, long timeEntryId, CancellationToken token = default)
  {
    TimeEntry? timeEntry = await context.TimeEntries.FirstOrDefaultAsync
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

  #endregion
  
  #region Private Methods

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