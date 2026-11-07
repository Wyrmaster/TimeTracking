namespace TimeTracking.Service.Dto.Data.Statistics;

/// <summary>
///   Describes which table of the statistics is exported
/// </summary>
public enum StatisticsExportType
{
  /// <summary>
  ///   One row per time entry
  /// </summary>
  Entries,

  /// <summary>
  ///   One row per activity containing the total time spent on it
  /// </summary>
  Summary
}
