using Microsoft.AspNetCore.Mvc;
using TimeTracking.Persistence.Entities;
using TimeTracking.Service.Dto.Data;
using TimeTracking.Service.Extensions;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Endpoints;

/// <summary>
///   Endpoints handling all activity operations 
/// </summary>
public static class Activities
{
  #region Extension Methods

  /// <summary>
  ///   Extension method registering the Activity Endpoints
  /// </summary>
  /// <param name="self"></param>
  /// <returns></returns>
  public static IEndpointRouteBuilder MapActivityEndpoints(this IEndpointRouteBuilder self)
  {
    var group = self
      .MapGroup("api/v1/activity/")
      .RequireAuthorization();

    group.MapGet("/", Activities.GetActivitiesAsync);

    group.MapPost("{workspaceId:long}/", Activities.AddActivityAsync);

    group.MapDelete("{activityId:long}/", Activities.RemoveActivityAsync);

    group.MapPut("{activityId:long}/", Activities.UpdateActivityAsync);

    group.MapGet("active/", Activities.GetActiveActivity);
    
    return self;
  }
  
  #endregion

  #region Endpoints

  /// <summary>
  ///   Get Activities of the current workspace
  /// </summary>
  /// <param name="context"></param>
  /// <param name="activityService"></param>
  /// <param name="workspaceId">id of the workspace to resolve</param>
  /// <param name="offset">offset of the pagination</param>
  /// <param name="count">amount of activities to return</param>
  /// <param name="query"></param>
  /// <param name="token"></param>
  /// <returns></returns>
  private static async Task<IResult> GetActivitiesAsync
  (
    HttpContext context,
    IActivityService activityService,
    [FromQuery] long? workspaceId = null,
    [FromQuery] int offset = 0,
    [FromQuery] int count = 50,
    [FromQuery] string? query = null,
    CancellationToken token = default
  )
  {
    string? userName = context.GetUserName();

    return string.IsNullOrEmpty(userName)
      ? Results.Problem("User name cannot be null or empty.")
      : Results.Ok(await activityService.GetActivitiesAsync(userName, offset, count, workspaceId, query, token));
  }

  /// <summary>
  ///   Add a new Activity
  /// </summary>
  /// <param name="context"></param>
  /// <param name="activityService"></param>
  /// <param name="workspaceId"></param>
  /// <param name="activity">dto object describing a new Activity</param>
  /// <param name="token"></param>
  /// <returns></returns>
  private static async Task<IResult> AddActivityAsync
  (
    HttpContext context,
    IActivityService activityService,
    [FromRoute] long workspaceId,
    [FromBody] ActivityDto activity,
    CancellationToken token = default
  )
  {
    string? userName = context.GetUserName();

    if (string.IsNullOrEmpty(userName))
    {
      return Results.Problem("User name cannot be null or empty.");
    }

    return Results.Ok
    (
      await activityService.AddNewActivityAsync
      (
        userName,
        workspaceId,
        activity.Name,
        activity.Description,
        activity.ActivityColor,
        token
      )
    );
  }

  /// <summary>
  ///   Removes an activity
  /// </summary>
  /// <param name="context"></param>
  /// <param name="activityService"></param>
  /// <param name="activityId">id of the activity to remove</param>
  /// <param name="token"></param>
  /// <returns></returns>
  private static async Task<IResult> RemoveActivityAsync
  (
    HttpContext context,
    IActivityService activityService,
    [FromRoute]long activityId,
    CancellationToken token = default
  )
  {
    string? userName = context.GetUserName();

    if (string.IsNullOrEmpty(userName))
    {
      return Results.Problem("User name cannot be null or empty.");
    }
    
    return Results.Ok(await activityService.RemoveActivityAsync(userName, activityId, token));
  }

  /// <summary>
  ///   Updates an activity
  /// </summary>
  /// <param name="context"></param>
  /// <param name="activityService"></param>
  /// <param name="activityId">id of the activity to update</param>
  /// <param name="activity">dto describing the activity to update</param>
  /// <param name="token"></param>
  /// <returns></returns>
  private static async Task<IResult> UpdateActivityAsync
  (
    HttpContext context,
    IActivityService activityService,
    [FromRoute] long activityId,
    [FromBody] ActivityDto activity,
    CancellationToken token = default
  )
  {
    string? userName = context.GetUserName();

    if (string.IsNullOrEmpty(userName))
    {
      return Results.Problem("User name cannot be null or empty.");
    }
    
    return Results.Ok
    (
      await activityService.UpdateActivityAsync
      (
        userName,
        activityId,
        activity.Name,
        activity.Description,
        activity.ActivityColor,
        token
      )
    );
  }

  /// <summary>
  ///   Returns the currently active activity for the authenticated user
  /// </summary>
  /// <param name="context"></param>
  /// <param name="activityService"></param>
  /// <param name="token"></param>
  /// <returns></returns>
  private static async Task<IResult> GetActiveActivity
  (
    HttpContext context,
    IActivityService  activityService,
    CancellationToken token = default
  )
  {
    string? userName = context.GetUserName();

    if (string.IsNullOrEmpty(userName))
    {
      return Results.Problem("User name cannot be null or empty.");
    }

    TimeEntry? timeEntry = await activityService.GetActivityAsync(userName, token);

    return timeEntry is { Activity: not null }
      ? Results.Ok(new ActiveActivityDto
        {
          Id = timeEntry.Activity.Id,
          TrackingSince = timeEntry.Start!.Value.ToLocalTime(),
          Name = timeEntry.Activity.ActivityName,
          Description = timeEntry.Activity.Description,
          ActivityColor = timeEntry.Activity.Color
        })
      : Results.Ok();
  }

  #endregion
}