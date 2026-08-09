using TimeTracking.Service.Dto.Data.Statistics;

namespace TimeTracking.Service.Interfaces;

/// <summary>
///   Interface describing 
/// </summary>
public interface IStatisticsService
{
  #region Methods

  /// <summary>
  ///   Get the statistics for a workspace in a specific time range
  /// </summary>
  /// <param name="username">Name of the user to resolve statistics for</param>
  /// <param name="acitivitiesToExclude">ids of activities to ignore in the statistics data set</param>
  /// <param name="workspaceId">selected workspace to generate statistics from. defaults to the current active</param>
  /// <param name="start">start of the timerange statistics should be generated</param>
  /// <param name="end">end of the timerange statistics should be generated</param>
  /// <param name="token"></param>
  /// <returns></returns>
  Task<StatisticsDto?> GetStatisticActivityAsync
  (
    string username,
    long[] acitivitiesToExclude,
    long? workspaceId = null,
    DateTime? start = null,
    DateTime? end = null,
    CancellationToken token = default
  );

  #endregion
}