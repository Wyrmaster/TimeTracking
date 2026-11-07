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
  /// <param name="activitiesToExclude">ids of activities to ignore in the statistics data set</param>
  /// <param name="workspaceId">selected workspace to generate statistics from. defaults to the current active</param>
  /// <param name="start">start of the timerange statistics should be generated</param>
  /// <param name="end">end of the timerange statistics should be generated</param>
  /// <param name="token"></param>
  /// <returns></returns>
  Task<StatisticsDto?> GetStatisticActivityAsync
  (
    string username,
    long[] activitiesToExclude,
    long? workspaceId = null,
    DateTime? start = null,
    DateTime? end = null,
    CancellationToken token = default
  );

  /// <summary>
  ///   Get the statistics for a workspace in a specific time range as tab separated values
  /// </summary>
  /// <param name="username">Name of the user to resolve statistics for</param>
  /// <param name="activitiesToExclude">ids of activities to ignore in the statistics data set</param>
  /// <param name="exportType">which table of the statistics should be exported</param>
  /// <param name="workspaceId">selected workspace to generate statistics from. defaults to the current active</param>
  /// <param name="start">start of the timerange statistics should be generated</param>
  /// <param name="end">end of the timerange statistics should be generated</param>
  /// <param name="token"></param>
  /// <returns>the statistics as tab separated values including a header row, null if the workspace could not be resolved</returns>
  Task<string?> GetStatisticsTsvAsync
  (
    string username,
    long[] activitiesToExclude,
    StatisticsExportType exportType,
    long? workspaceId = null,
    DateTime? start = null,
    DateTime? end = null,
    CancellationToken token = default
  );

  #endregion
}