using Microsoft.EntityFrameworkCore;
using TimeTracking.Persistence;
using TimeTracking.Persistence.Entities;
using TimeTracking.Service.Dto.Data.Statistics;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Services;

/// <summary>
///   Default implementation 
/// </summary>
public class StatisticsService(Context context): IStatisticsService
{
  #region StatisticsService

  /// <inheritdoc cref="IStatisticsService.GetStatisticActivityAsync"/>
  public async Task<StatisticsDto?> GetStatisticActivityAsync
  (
    string userId,
    long[] acitivitiesToExclude,
    long? workspaceId = null,
    DateTime? start = null,
    DateTime? end = null,
    CancellationToken token = default
  )
  {
    long? actualWorkspaceId = workspaceId;
    actualWorkspaceId ??= (await context.Users.FirstOrDefaultAsync(entry => entry.Username == userId, token))?.ActiveWorkspaceId;

    if (actualWorkspaceId == null)
    {
      return null;
    }

    IEnumerable<TimeEntry> timeEntries = context
      .TimeEntries
      .Include(timeEntry => timeEntry.Activity)
      .ThenInclude(activity => activity!.Workspace)
      .ThenInclude(workspace => workspace!.User);

    if (start != null)
    {
      timeEntries = timeEntries.Where(entry => entry.Start >= start);
    }
    if (end != null)
    {
      timeEntries = timeEntries.Where(entry => entry.End <= end);
    }
    if (acitivitiesToExclude.Any())
    {
      timeEntries = timeEntries.Where(entry => entry.Activity != null && acitivitiesToExclude.Contains(entry.Activity.Id));
    }

    timeEntries = timeEntries.Where
    (entry => entry.Activity != null
              && entry.Activity.Workspace != null
              && entry.Activity.Workspace.Id == actualWorkspaceId
              && entry.Activity.Workspace.User != null
              && entry.Activity.Workspace.User.Username == userId
              && entry.Start != null
              && entry.End != null
    );

    return new StatisticsDto
    (
      // ReSharper disable PossibleMultipleEnumeration
      timeEntries.Select(entry => new StatisticTimeEntryDto
      (
        entry.Activity!.ActivityName,
        entry.Activity.Color,
        entry.Start!.Value.Date,
        (entry.End!.Value - entry.Start.Value).Ticks
      )),
      timeEntries
        .GroupBy(entry => entry.Activity!.ActivityName)
        .Select(entry => new StatisticActivityDto
        (
          entry.Key,
          entry.First().Activity!.Color,
          entry.Sum(te => (te.End!.Value - te.Start!.Value).Ticks)
        ))
    );
    // ReSharper restore PossibleMultipleEnumeration
  }

  #endregion
}