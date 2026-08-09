namespace TimeTracking.Service.Dto.Data.Statistics;

/// <summary>
///   Data transfer object describing the time spent in one activity
/// </summary>
/// <param name="ActivityName">Name of an Activity</param>
/// <param name="Color">Color assigned to the Activity</param>
/// <param name="Duration">Time spent on this Activity</param>
public record StatisticActivityDto
(
  string ActivityName,
  int Color,
  long Duration
);