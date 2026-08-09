using Microsoft.AspNetCore.Mvc;
using TimeTracking.Service.Dto.Data;
using TimeTracking.Service.Extensions;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Endpoints;

/// <summary>
///   Endpoints handling all Time Tracking Operations operations 
/// </summary>
public static class TimeTracking
{
  #region Extension Methods

  /// <summary>
  ///   Extension method registering the TimeTracking Endpoints
  /// </summary>
  /// <param name="self"></param>
  /// <returns></returns>
  public static IEndpointRouteBuilder MapTimeTrackingEndpoints(this IEndpointRouteBuilder self)
  {
    var group = self
      .MapGroup("api/v1/timetracking/")
      .RequireAuthorization();

    group.MapGet("{workspaceId:long?}/", TimeTracking.GetTimeEntriesAsync);
    
    group.MapPost("startTracking/", TimeTracking.StartTrackingAsync);
    
    group.MapPost("stopTracking/", TimeTracking.StopTrackingAsync);

    group.MapPost("", TimeTracking.AddTimeEntryAsync);

    group.MapPut("", TimeTracking.UpdateTimeEntryAsync);
    
    group.MapDelete("{timeEntryId:long}/", TimeTracking.RemoteTimeEntryAsync);
    
    return self;
  }

  #endregion
  
  #region Endpoints

  /// <summary>
  ///   Get Activities of the current workspace
  /// </summary>
  /// <param name="context"></param>
  /// <param name="timeTrackingService"></param>
  /// <param name="workspaceId"></param>
  /// <param name="offset">offset of the pagination</param>
  /// <param name="count">amount of activities to return</param>
  /// <param name="activities">optional ids to of activities to filter for</param>
  /// <param name="from">timestamp indicating from which time the time entries should be taken</param>
  /// <param name="to">timestamp indicating until which time the time entries should be taken</param>
  /// <param name="token"></param>
  /// <returns></returns>
  private static  async Task<IResult> GetTimeEntriesAsync
  (
    HttpContext context,
    ITimeTrackingService timeTrackingService,
    [FromRoute] long? workspaceId = null,
    [FromQuery] int offset = 0,
    [FromQuery] int count = int.MaxValue,
    [FromQuery] DateTime? from = null,
    [FromQuery] DateTime? to = null,
    [FromQuery] long[]? activities = null,
    CancellationToken token = default
  )
  {
    string? userName = context.GetUserName();

    if (string.IsNullOrEmpty(userName))
    {
      return Results.Problem("User name cannot be null or empty.");
    }
    
    return Results.Ok(await timeTrackingService.GetTimeEntriesAsync(userName, workspaceId, offset, count, from, to, activities, token));
  }

  /// <summary>
  ///   Start Tracking given Activity
  /// </summary>
  /// <param name="context"></param>
  /// <param name="timeTrackingService"></param>
  /// <param name="startActivityDto">dto describing the tracking start of an activity</param>
  /// <param name="token"></param>
  /// <returns></returns>
  private static  async Task<IResult> StartTrackingAsync
  (
    HttpContext context,
    ITimeTrackingService timeTrackingService,
    [FromBody] StartActivityDto startActivityDto,
    CancellationToken token = default
  )
  {
    string? userName = context.GetUserName();

    if (string.IsNullOrEmpty(userName))
    {
      return Results.Problem("User name cannot be null or empty.");
    }
    
    return Results.Ok(await timeTrackingService.StartTracking(userName, startActivityDto, token));
  }

  /// <summary>
  ///   Stop Tracking activities
  /// </summary>
  /// <param name="context"></param>
  /// <param name="timeTrackingService"></param>
  /// <param name="token"></param>
  /// <returns></returns>
  private static  async Task<IResult> StopTrackingAsync
  (
    HttpContext context,
    ITimeTrackingService timeTrackingService,
    CancellationToken token = default
  )
  {
    string? userName = context.GetUserName();

    if (string.IsNullOrEmpty(userName))
    {
      return Results.Problem("User name cannot be null or empty.");
    }
    
    return Results.Ok(await timeTrackingService.StopTracking(userName, token));
  }

  /// <summary>
  /// Adds a new time entry for the current user.
  /// </summary>
  /// <param name="context"></param>
  /// <param name="timeTrackingService"></param>
  /// <param name="timeEntryDto">The data transfer object containing details of the time entry to be added.</param>
  /// <param name="token">The cancellation token to observe while waiting for the task to complete.</param>
  /// <returns>An <see cref="IActionResult"/> indicating the result of the operation.</returns>
  private static async Task<IResult> AddTimeEntryAsync
  (
    HttpContext context,
    ITimeTrackingService timeTrackingService,
    [FromBody] TimeEntryDto timeEntryDto,
    CancellationToken token = default
  )
  {
    string? userName = context.GetUserName();

    if (string.IsNullOrEmpty(userName))
    {
      return Results.Problem("User name cannot be null or empty.");
    }
    
    return Results.Ok(await timeTrackingService.AddTimeEntryAsync(userName, timeEntryDto, token));
  }

  /// <summary>
  ///   Updates an existing time entry with new details.
  /// </summary>
  /// <param name="context"></param>
  /// <param name="timeTrackingService"></param>
  /// <param name="timeEntryDto">The data transfer object containing updated time entry details.</param>
  /// <param name="token">A token to observe while performing the operation, used to propagate notification that the operation should be canceled.</param>
  /// <returns>An <see cref="IResult"/> indicating the result of the update operation.</returns>
  private static async Task<IResult> UpdateTimeEntryAsync
  (
    HttpContext context,
    ITimeTrackingService timeTrackingService,
    [FromBody] TimeEntryDto timeEntryDto,
    CancellationToken token = default
  )
  {
    string? userName = context.GetUserName();

    if (string.IsNullOrEmpty(userName))
    {
      return Results.Problem("User name cannot be null or empty.");
    }
    
    return await timeTrackingService.UpdateTimeEntryAsync(userName, timeEntryDto, token)
      ? Results.Ok(true)
      : Results.Problem($"Time entry with id {timeEntryDto.Id} not found.");
  }

  /// <summary>
  /// Removes a time entry with the specified ID.
  /// </summary>
  /// <param name="context"></param>
  /// <param name="timeTrackingService"></param>
  /// <param name="timeEntryId">The ID of the time entry to be removed.</param>
  /// <param name="token">Cancellation token to cancel the operation if needed.</param>
  /// <returns>An <see cref="IActionResult"/> indicating the result of the operation.</returns>
  private static async Task<IResult> RemoteTimeEntryAsync
  (
    HttpContext context,
    ITimeTrackingService timeTrackingService,
    long timeEntryId,
    CancellationToken token = default
  )
  {
    string? userName = context.GetUserName();

    if (string.IsNullOrEmpty(userName))
    {
      return Results.Problem("User name cannot be null or empty.");
    }
    
    return Results.Ok(await timeTrackingService.RemoteTimeEntry(userName, timeEntryId, token));
  }

  #endregion
}