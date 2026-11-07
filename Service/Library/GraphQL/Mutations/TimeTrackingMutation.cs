using System.Security.Claims;
using HotChocolate.Authorization;
using TimeTracking.Service.Dto.Data;
using TimeTracking.Service.Extensions;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.GraphQL.Mutations;

/// <summary>
///   GraphQL Mutations handling time tracking
/// </summary>
public partial class TimeTrackingMutation
{
  #region Fields

  private readonly ITimeTrackingService _timeTrackingService;
  private readonly IWorkspaceService _workspaceService;
  private readonly IActivityService _activityService;

  #endregion

  #region Constructor

  public TimeTrackingMutation
  (
    ITimeTrackingService timeTrackingService,
    IWorkspaceService workspaceService,
    IActivityService activityService
  )
  {
    this._timeTrackingService = timeTrackingService;
    this._workspaceService = workspaceService;
    this._activityService = activityService;
  }

  #endregion

  #region Mutations

  [Authorize]
  public Task<bool> StartTracking(ClaimsPrincipal user, long activityId, string description = "", CancellationToken token = default)
  {
    string? userName = user.GetUserName();

    if (userName == null)
    {
      return Task.FromResult(false);
    }

    return this._timeTrackingService.StartTrackingAsync
    (
      userName,
      new StartActivityDto { ActivityId = activityId, Description = description },
      token
    );
  }

  [Authorize]
  public async Task<bool> StopTracking(ClaimsPrincipal user, CancellationToken token = default)
  {
    string? userName = user.GetUserName();

    if (userName == null)
    {
      return false;
    }

    await this._timeTrackingService.StopTrackingAsync(userName, token);

    return true;
  }

  #endregion
}
