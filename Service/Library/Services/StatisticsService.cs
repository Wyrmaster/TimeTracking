using System.Globalization;
using System.Text;
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
  #region Constants

  private const char Separator = '\t';

  #endregion

  #region StatisticsService

  /// <inheritdoc cref="IStatisticsService.GetStatisticActivityAsync"/>
  public async Task<StatisticsDto?> GetStatisticActivityAsync
  (
    string username,
    long[] activitiesToExclude,
    long? workspaceId = null,
    DateTime? start = null,
    DateTime? end = null,
    CancellationToken token = default
  )
  {
    long? actualWorkspaceId = workspaceId ?? await context
      .Users
      .Where(entry => entry.Username == username)
      .Select(entry => entry.ActiveWorkspaceId)
      .FirstOrDefaultAsync(token);

    if (actualWorkspaceId == null)
    {
      return null;
    }

    DateTime?
      startUtc = start?.ToUniversalTime(),
      endUtc = end?.ToUniversalTime();

    IQueryable<TimeEntry> timeEntries = context
      .TimeEntries
      .AsNoTracking()
      .Include(timeEntry => timeEntry.Activity)
      .ThenInclude(activity => activity!.Workspace)
      .ThenInclude(workspace => workspace!.User)
      .Where
      (entry => entry.Activity != null
                && entry.Activity.Workspace != null
                && entry.Activity.Workspace.Id == actualWorkspaceId
                && entry.Activity.Workspace.User != null
                && entry.Activity.Workspace.User.Username == username
                && entry.Start != null
                && entry.End != null
      );

    if (startUtc != null)
    {
      timeEntries = timeEntries.Where(entry => entry.Start >= startUtc);
    }
    if (endUtc != null)
    {
      timeEntries = timeEntries.Where(entry => entry.End <= endUtc);
    }
    if (activitiesToExclude.Any())
    {
      timeEntries = timeEntries.Where(entry => !activitiesToExclude.Contains(entry.Activity!.Id));
    }

    // durations are calculated in memory, as not every database is able to subtract timestamps
    List<TimeEntry> entries = await timeEntries
      .OrderBy(entry => entry.Start)
      .ToListAsync(token);

    return new StatisticsDto
    (
      entries
        .Select(entry => new StatisticTimeEntryDto
        (
          entry.Activity!.ActivityName,
          entry.Activity.Color,
          entry.Start!.Value,
          entry.End!.Value,
          (entry.End!.Value - entry.Start.Value).Ticks
        ))
        .ToList(),
      entries
        .GroupBy(entry => entry.Activity!.ActivityName)
        .Select(entry => new StatisticActivityDto
        (
          entry.Key,
          entry.First().Activity!.Color,
          entry.Sum(te => (te.End!.Value - te.Start!.Value).Ticks)
        ))
        .ToList()
    );
  }

  /// <inheritdoc cref="IStatisticsService.GetStatisticsTsvAsync"/>
  public async Task<string?> GetStatisticsTsvAsync
  (
    string username,
    long[] activitiesToExclude,
    StatisticsExportType exportType,
    long? workspaceId = null,
    DateTime? start = null,
    DateTime? end = null,
    CancellationToken token = default
  )
  {
    StatisticsDto? statistics = await this.GetStatisticActivityAsync
    (
      username,
      activitiesToExclude,
      workspaceId,
      start,
      end,
      token
    );

    if (statistics == null)
    {
      return null;
    }

    StringBuilder builder = new();

    if (exportType == StatisticsExportType.Summary)
    {
      StatisticsService.AppendRow(builder, "Activity", "Duration", "Hours");

      foreach (StatisticActivityDto activity in statistics.Statistics)
      {
        StatisticsService.AppendRow
        (
          builder,
          activity.ActivityName,
          StatisticsService.FormatDuration(activity.Duration),
          StatisticsService.FormatHours(activity.Duration)
        );
      }
    }
    else
    {
      StatisticsService.AppendRow(builder, "Activity", "Start", "End", "Duration", "Hours");

      foreach (StatisticTimeEntryDto timeEntry in statistics.TimeEntries)
      {
        StatisticsService.AppendRow
        (
          builder,
          timeEntry.ActivityName,
          StatisticsService.FormatTimestamp(timeEntry.Start),
          StatisticsService.FormatTimestamp(timeEntry.End),
          StatisticsService.FormatDuration(timeEntry.Duration),
          StatisticsService.FormatHours(timeEntry.Duration)
        );
      }
    }

    return builder.ToString();
  }

  #endregion

  #region Private Methods

  /// <summary>
  ///   Appends a single row of tab separated values, tabs and line breaks within the values are replaced by spaces
  /// </summary>
  /// <param name="builder">builder the row is appended to</param>
  /// <param name="values">values of the row</param>
  private static void AppendRow(StringBuilder builder, params string[] values)
  {
    builder
      .AppendJoin
      (
        Separator,
        values.Select(value => value
          .Replace('\t', ' ')
          .Replace('\r', ' ')
          .Replace('\n', ' '))
      )
      .Append('\n');
  }

  /// <summary>
  ///   Formats a timestamp stored in utc as ISO 8601
  /// </summary>
  /// <param name="timestamp">timestamp to format</param>
  /// <returns></returns>
  private static string FormatTimestamp(DateTime timestamp) => DateTime
    .SpecifyKind(timestamp, DateTimeKind.Utc)
    .ToString("yyyy-MM-ddTHH:mm:ssZ", CultureInfo.InvariantCulture);

  /// <summary>
  ///   Formats a duration given in ticks as hh:mm
  /// </summary>
  /// <param name="ticks">duration in ticks</param>
  /// <returns></returns>
  private static string FormatDuration(long ticks)
  {
    long totalMinutes = (long)Math.Round(TimeSpan.FromTicks(ticks).TotalMinutes);

    return $"{totalMinutes / 60:00}:{totalMinutes % 60:00}";
  }

  /// <summary>
  ///   Formats a duration given in ticks as decimal hours
  /// </summary>
  /// <param name="ticks">duration in ticks</param>
  /// <returns></returns>
  private static string FormatHours(long ticks) => TimeSpan
    .FromTicks(ticks)
    .TotalHours
    .ToString("0.00", CultureInfo.InvariantCulture);

  #endregion
}
