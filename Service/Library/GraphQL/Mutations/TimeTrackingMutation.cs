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
  #region Mutations

  [Authorize]
  public Task<bool> StartTracking
  (
    ClaimsPrincipal user,
    [Service] ITimeTrackingService timeTrackingService,
    long activityId,
    string description = "",
    CancellationToken token = default
  )
  {
    string? userName = user.GetUserName();

    if (userName == null)
    {
      return Task.FromResult(false);
    }

    return timeTrackingService.StartTrackingAsync
    (
      userName,
      new StartActivityDto { ActivityId = activityId, Description = description },
      token
    );
  }

  [Authorize]
  public async Task<bool> StopTracking
  (
    ClaimsPrincipal user,
    [Service] ITimeTrackingService timeTrackingService,
    CancellationToken token = default
  )
  {
    string? userName = user.GetUserName();

    if (userName == null)
    {
      return false;
    }

    await timeTrackingService.StopTrackingAsync(userName, token);

    return true;
  }

  #endregion
}
