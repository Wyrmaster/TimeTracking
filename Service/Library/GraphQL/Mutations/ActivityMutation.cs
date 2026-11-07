using System.Security.Claims;
using HotChocolate.Authorization;
using TimeTracking.Service.Extensions;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.GraphQL.Mutations;

/// <summary>
///   GraphQL Mutation for Activity interactions
/// </summary>
public partial class TimeTrackingMutation
{
  #region Mutations

  /// <summary>
  ///   Add new Activity
  /// </summary>
  /// <param name="user">user to add the activity to</param>
  /// <param name="activityService">service handling the operation</param>
  /// <param name="workspaceId">id of the workspace to add the activity to</param>
  /// <param name="name">name of the new activity</param>
  /// <param name="description">description of the new activity</param>
  /// <param name="activityColor">color of the activity</param>
  /// <param name="token"></param>
  /// <returns></returns>
  [Authorize]
  public Task<long> AddActivity
  (
    ClaimsPrincipal user,
    [Service] IActivityService activityService,
    long workspaceId,
    string name,
    string description,
    int activityColor,
    CancellationToken token = default
  )
  {
    string? userName = user.GetUserName();

    if (userName == null)
    {
      return Task.FromResult(-1L);
    }
    
    return activityService.AddNewActivityAsync(userName, workspaceId, name, description, activityColor, token);
  }
  
  /// <summary>
  ///   Removes an activity
  /// </summary>
  /// <param name="user">user to remove the activity from</param>
  /// <param name="activityService">service handling the operation</param>
  /// <param name="activityId">id of the activity to remove</param>
  /// <param name="token"></param>
  /// <returns></returns>
  [Authorize]
  public Task<bool> RemoveActivity
  (
    ClaimsPrincipal user,
    [Service] IActivityService activityService,
    long activityId,
    CancellationToken token = default
  )
  {
    string? userName = user.GetUserName();

    if (userName == null)
    {
      return Task.FromResult(false);
    }
    
    return activityService.RemoveActivityAsync(userName, activityId, token);
  }
  
  /// <summary>
  ///   Updates an activity
  /// </summary>
  /// <param name="user">user to update the activity in</param>
  /// <param name="activityService">service handling the operation</param>
  /// <param name="activityId">id of the activity to update</param>
  /// <param name="name">new name of the activity</param>
  /// <param name="description">new description of the activity</param>
  /// <param name="activityColor">new color of the activity</param>
  /// <param name="token"></param>
  /// <returns></returns>
  [Authorize]
  public Task<bool> UpdateActivity
  (
    ClaimsPrincipal user,
    [Service] IActivityService activityService,
    long activityId,
    string name,
    string description,
    int activityColor,
    CancellationToken token = default
  )
  {
    string? userName = user.GetUserName();

    if (userName == null)
    {
      return Task.FromResult(false);
    }
    
    return activityService.UpdateActivityAsync(userName, activityId, name, description, activityColor, token);
  }

  #endregion
}