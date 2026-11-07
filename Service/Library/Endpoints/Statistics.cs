using System.Text;
using Microsoft.AspNetCore.Mvc;
using TimeTracking.Service.Common;
using TimeTracking.Service.Dto.Data.Statistics;
using TimeTracking.Service.Extensions;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Endpoints;

/// <summary>
///   Endpoints handling all statistics operations 
/// </summary>
public static class Statistics
{
  #region Extension Methods

  /// <summary>
  ///   Extension method registering the statistics Endpoints
  /// </summary>
  /// <param name="self"></param>
  /// <returns></returns>
  public static IEndpointRouteBuilder MapStatisticsEndpoints(this IEndpointRouteBuilder self)
  {
    var group = self
      .MapGroup("api/v1/statistics/")
      .RequireAuthorization()
      .AddEndpointFilter<UserNameEndpointFilter>();
    
    group.MapGet("", Statistics.GetStatisticsAsync);

    group.MapGet("export/", Statistics.GetStatisticsExportAsync);
    
    return self;
  }

  #endregion

  #region Endpoints

  /// <summary>
  ///   Resolves the statistics
  /// </summary>
  /// <param name="context"></param>
  /// <param name="statisticsService">service calculating the statistics</param>
  /// <param name="workspaceId">(optional) id of the workspace to calculate statistics for defaults to the active workspace</param>
  /// <param name="activityIdsToExclude">(optional) collection activity ids to exclude</param>
  /// <param name="startDate">start of the date range to calculate statistics for</param>
  /// <param name="endDate">end of the date range to calculate statistics for</param>
  /// <param name="token"></param>
  /// <returns></returns>
  private static async Task<IResult> GetStatisticsAsync
  (
    HttpContext context,
    IStatisticsService statisticsService,
    [FromQuery] long? workspaceId = null,
    [FromQuery] long[]? activityIdsToExclude = null,
    [FromQuery] DateTime? startDate = null,
    [FromQuery] DateTime? endDate = null,
    CancellationToken token = default
  )
  {
    string userName = context.GetRequiredUserName();

    StatisticsDto? statistics = await statisticsService.GetStatisticActivityAsync
    (
      userName,
      activityIdsToExclude ?? [],
      workspaceId,
      startDate,
      endDate,
      token
    );
    
    if (statistics == null)
    {
      return Results.NotFound();
    }

    return Results.Ok(statistics);
  }

  /// <summary>
  ///   Exports the statistics as a tab separated values file
  /// </summary>
  /// <param name="context"></param>
  /// <param name="statisticsService">service calculating the statistics</param>
  /// <param name="type">which table to export, one row per time entry or one row per activity</param>
  /// <param name="workspaceId">(optional) id of the workspace to calculate statistics for defaults to the active workspace</param>
  /// <param name="activityIdsToExclude">(optional) collection activity ids to exclude</param>
  /// <param name="startDate">start of the date range to calculate statistics for</param>
  /// <param name="endDate">end of the date range to calculate statistics for</param>
  /// <param name="token"></param>
  /// <returns></returns>
  private static async Task<IResult> GetStatisticsExportAsync
  (
    HttpContext context,
    IStatisticsService statisticsService,
    [FromQuery] StatisticsExportType type = StatisticsExportType.Entries,
    [FromQuery] long? workspaceId = null,
    [FromQuery] long[]? activityIdsToExclude = null,
    [FromQuery] DateTime? startDate = null,
    [FromQuery] DateTime? endDate = null,
    CancellationToken token = default
  )
  {
    string userName = context.GetRequiredUserName();

    string? tsv = await statisticsService.GetStatisticsTsvAsync
    (
      userName,
      activityIdsToExclude ?? [],
      type,
      workspaceId,
      startDate,
      endDate,
      token
    );

    if (tsv == null)
    {
      return Results.NotFound();
    }

    string fileType = type
      .ToString()
      .ToLowerInvariant();

    return Results.File
    (
      Encoding.UTF8.GetBytes(tsv),
      "text/tab-separated-values",
      $"statistics-{fileType}.tsv"
    );
  }

  #endregion
}