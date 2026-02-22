using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TimeTracking.Service.Common;
using TimeTracking.Service.Dto.Data;
using TimeTracking.Service.Extensions;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Controllers;

/// <summary>
///   Controller handling operations with the tracked times 
/// </summary>
[ApiController]
[Route("api/v1/timetracking/")]
public class TimeTrackingController(ITimeTrackingService timeTrackingService) : UserNameController
{
  #region Endpoints

  /// <summary>
  ///   Get Activities of the current workspace
  /// </summary>
  /// <param name="workspaceId"></param>
  /// <param name="offset">offset of the pagination</param>
  /// <param name="count">amount of activities to return</param>
  /// <param name="activities">optional ids to of activities to filter for</param>
  /// <param name="from">timestamp indicating from which time the time entries should be taken</param>
  /// <param name="to">timestamp indicating until which time the time entries should be taken</param>
  /// <param name="token"></param>
  /// <returns></returns>
  [HttpGet("{workspaceId?}/")]
  [Authorize]
  public async Task<IActionResult> GetTimeEntriesAsync
  (
    [FromRoute] long? workspaceId = null,
    [FromQuery] int offset = 0,
    [FromQuery] int count = int.MaxValue,
    [FromQuery] DateTime? from = null,
    [FromQuery] DateTime? to = null,
    [FromQuery] long[]? activities = null,
    CancellationToken token = default
  )
  {
    string? userName = this.GetUserName(this.User);

    if (string.IsNullOrEmpty(userName))
    {
      return this.Problem("User name cannot be null or empty.");
    }
    
    return this.Ok(await timeTrackingService.GetTimeEntriesAsync(userName, workspaceId, offset, count, from, to, activities, token));
  }

  /// <summary>
  ///   Start Tracking given Activity
  /// </summary>
  /// <param name="startActivityDto">dto describing the tracking start of an activity</param>
  /// <param name="token"></param>
  /// <returns></returns>
  [Authorize]
  [HttpPost("startTracking/")]
  public async Task<IActionResult> StartTrackingAsync([FromBody] StartActivityDto startActivityDto, CancellationToken token = default)
  {
    string? userName = this.GetUserName(this.User);

    if (string.IsNullOrEmpty(userName))
    {
      return this.Problem("User name cannot be null or empty.");
    }
    
    return this.Ok(await timeTrackingService.StartTracking(userName, startActivityDto, token));
  }

  /// <summary>
  ///   Stop Tracking activities
  /// </summary>
  /// <param name="token"></param>
  /// <returns></returns>
  [Authorize]
  [HttpPost("stopTracking/")]
  public async Task<IActionResult> StopTrackingAsync(CancellationToken token = default)
  {
    string? userName = this.GetUserName(this.User);

    if (string.IsNullOrEmpty(userName))
    {
      return this.Problem("User name cannot be null or empty.");
    }
    
    return this.Ok(await timeTrackingService.StopTracking(userName, token));
  }

  /// <summary>
  /// Adds a new time entry for the current user.
  /// </summary>
  /// <param name="timeEntryDto">The data transfer object containing details of the time entry to be added.</param>
  /// <param name="token">The cancellation token to observe while waiting for the task to complete.</param>
  /// <returns>An <see cref="IActionResult"/> indicating the result of the operation.</returns>
  [Authorize]
  [HttpPost]
  public async Task<IActionResult> AddTimeEntryAsync([FromBody] TimeEntryDto timeEntryDto, CancellationToken token = default)
  {
    string? userName = this.GetUserName(this.User);

    if (string.IsNullOrEmpty(userName))
    {
      return this.Problem("User name cannot be null or empty.");
    }
    
    return this.Ok(await timeTrackingService.AddTimeEntryAsync(userName, timeEntryDto, token));
  }

  /// <summary>
  ///   Updates an existing time entry with new details.
  /// </summary>
  /// <param name="timeEntryDto">The data transfer object containing updated time entry details.</param>
  /// <param name="token">A token to observe while performing the operation, used to propagate notification that the operation should be canceled.</param>
  /// <returns>An <see cref="IActionResult"/> indicating the result of the update operation.</returns>
  [Authorize]
  [HttpPut]
  public async Task<IActionResult> UpdateTimeEntryAsync
  (
    [FromBody] TimeEntryDto timeEntryDto,
    CancellationToken token = default
  )
  {
    string? userName = this.GetUserName(this.User);

    if (string.IsNullOrEmpty(userName))
    {
      return this.Problem("User name cannot be null or empty.");
    }
    
    return await timeTrackingService.UpdateTimeEntryAsync(userName, timeEntryDto, token)
      ? this.Ok(true)
      : this.Problem($"Time entry with id {timeEntryDto.Id} not found.");
  }

  /// <summary>
  /// Removes a time entry with the specified ID.
  /// </summary>
  /// <param name="timeEntryId">The ID of the time entry to be removed.</param>
  /// <param name="token">Cancellation token to cancel the operation if needed.</param>
  /// <returns>An <see cref="IActionResult"/> indicating the result of the operation.</returns>
  [Authorize]
  [HttpDelete("{timeEntryId}/")]
  public async Task<IActionResult> RemoteTimeEntryAsync(long timeEntryId, CancellationToken token = default)
  {
    string? userName = this.GetUserName(this.User);

    if (string.IsNullOrEmpty(userName))
    {
      return this.Problem("User name cannot be null or empty.");
    }
    
    return this.Ok(await timeTrackingService.RemoteTimeEntry(userName, timeEntryId, token));
  }

  #endregion
}