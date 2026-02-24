using System.Security.Claims;
using HotChocolate.Authorization;
using TimeTracking.Persistence;
using TimeTracking.Persistence.PseudoEntities;
using TimeTracking.Service.Extensions;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.GraphQL.Mutations;

/// <summary>
///   GraphQL Mutations handling time tracking
/// </summary>
public partial class TimeTrackingMutation
{
  #region Fields

  private readonly ITimeHub _timeHub;
  private readonly IWorkspaceService _workspaceService;
  private readonly IActivityService _activityService;
  private readonly Context _context;

  #endregion

  #region Constructor

  public TimeTrackingMutation(ITimeHub timeHub, IWorkspaceService workspaceService, IActivityService activityService, Context context)
  {
    this._timeHub = timeHub;
    this._workspaceService = workspaceService;
    this._activityService = activityService;
    this._context = context;
  }

  #endregion

  #region Mutations

  /// <summary>
  ///   Start Tracking given Activity
  /// </summary>
  /// <param name="user">user that starts tracking an activity</param>
  /// <param name="activityId">activity to start tracking</param>
  /// <param name="description">description used for the current time entry</param>
  /// <param name="token"></param>
  /// <returns></returns>
  [Authorize]
  public async Task<bool> StartTracking(ClaimsPrincipal user, long activityId, string description = "", CancellationToken token = default)
  {
    string? userName = this.GetUserName(user);

    if (string.IsNullOrEmpty(userName))
    {
      return false;
    }

    await this._context.StopTrackingAsync(userName, token);
    await this._timeHub.StopTrackingAsync(userName, token);
    ActivityTracking tracking = await this._context.StartTrackingAsync(userName, activityId, description, token);
    await this._timeHub.StartTrackingAsync(userName, activityId, tracking.Timestamp, token);
    
    return true;
  }

  /// <summary>
  ///   Stop Tracking activities
  /// </summary>
  /// <param name="user">user that stops tracking the activity</param>
  /// <param name="token"></param>
  /// <returns></returns>
  [Authorize]
  public async Task<bool> StopTracking(ClaimsPrincipal user, CancellationToken token = default)
  {
    string? userName = this.GetUserName(user);

    if (string.IsNullOrEmpty(userName))
    {
      return false;
    }

    await this._context.StopTrackingAsync(userName, token);
    await this._timeHub.StopTrackingAsync(userName, token);
    
    return true;
  }

  #endregion
}