using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TimeTracking.Persistence.Entities;
using TimeTracking.Service.Common;
using TimeTracking.Service.Dto.Data;
using TimeTracking.Service.Extensions;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Controllers;

/// <summary>
///   Controller handling operations with dices 
/// </summary>
[ApiController]
[Route("api/v1/activity/")]
public class ActivityController(IActivityService activityService) : UserNameController
{
  #region Endpoints

  /// <summary>
  ///   Get Activities of the current workspace
  /// </summary>
  /// <param name="workspaceId">id of the workspace to resolve</param>
  /// <param name="offset">offset of the pagination</param>
  /// <param name="count">amount of activities to return</param>
  /// <param name="query"></param>
  /// <param name="token"></param>
  /// <returns></returns>
  [HttpGet("{workspaceId?}/")]
  [Authorize]
  public async Task<IActionResult> GetActivitiesAsync
  (
    [FromQuery] int offset = 0,
    [FromQuery] int count = 50,
    [FromRoute] long? workspaceId = null,
    [FromQuery] string? query = null,
    CancellationToken token = default
  )
  {
    string? userName = this.GetUserName(this.User);

    if (string.IsNullOrEmpty(userName))
    {
      return this.Problem("User name cannot be null or empty.");
    }
    
    return this.Ok(await activityService.GetActivitiesAsync(userName, offset, count, workspaceId, query, token));
  }

  /// <summary>
  ///   Add a new Activity
  /// </summary>
  /// <param name="workspaceId"></param>
  /// <param name="activity">dto object describing a new Activity</param>
  /// <param name="token"></param>
  /// <returns></returns>
  [HttpPost("{workspaceId}/")]
  [Authorize]
  public async Task<IActionResult> AddActivityAsync
  (
    [FromRoute] long workspaceId,
    [FromBody] ActivityDto activity,
    CancellationToken token = default
  )
  {
    string? userName = this.GetUserName(this.User);

    if (string.IsNullOrEmpty(userName))
    {
      return this.Problem("User name cannot be null or empty.");
    }

    return this.Ok
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
  /// <param name="activityId">id of the activity to remove</param>
  /// <param name="token"></param>
  /// <returns></returns>
  [HttpDelete("{activityId}/")]
  [Authorize]
  public async Task<IActionResult> RemoveActivityAsync([FromRoute]long activityId, CancellationToken token = default)
  {
    string? userName = this.GetUserName(this.User);

    if (string.IsNullOrEmpty(userName))
    {
      return this.Problem("User name cannot be null or empty.");
    }
    
    return this.Ok(await activityService.RemoveActivityAsync(userName, activityId, token));
  }

  /// <summary>
  ///   Updates an activity
  /// </summary>
  /// <param name="activityId">id of the activity to update</param>
  /// <param name="activity">dto describing the activity to update</param>
  /// <param name="token"></param>
  /// <returns></returns>
  [HttpPut("{activityId}/")]
  [Authorize]
  public async Task<IActionResult> UpdateActivityAsync([FromRoute] long activityId, [FromBody] ActivityDto activity, CancellationToken token = default)
  {
    string? userName = this.GetUserName(this.User);

    if (string.IsNullOrEmpty(userName))
    {
      return this.Problem("User name cannot be null or empty.");
    }
    
    return this.Ok
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
  /// <param name="token"></param>
  /// <returns></returns>
  [HttpGet("active/")]
  [Authorize]
  public async Task<IActionResult> GetActiveActivity(CancellationToken token = default)
  {
    string? userName = this.GetUserName(this.User);

    if (string.IsNullOrEmpty(userName))
    {
      return this.Problem("User name cannot be null or empty.");
    }

    TimeEntry? timeEntry = await activityService.GetActivityAsync(userName, token);

    return this.Ok
    (
      timeEntry is { Activity: not null }
        ? new ActiveActivityDto
          {
            Id = timeEntry.Activity.Id,
            TrackingSince = timeEntry.Start!.Value.ToLocalTime(),
            Name = timeEntry.Activity.ActivityName,
            Description = timeEntry.Activity.Description,
            ActivityColor = timeEntry.Activity.Color
          }
        : null
    );
  }
  
  #endregion
}