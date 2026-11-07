using System.Security.Claims;
using HotChocolate.Authorization;
using TimeTracking.Persistence;
using TimeTracking.Persistence.Entities;
using TimeTracking.Service.Extensions;

namespace TimeTracking.Service.GraphQL;

/// <summary>
///   Graph QL Query for querying the time tracking
/// </summary>
public class TimeTrackingQuery
{
  #region Queries

  /// <summary>
  ///   Queries for the Workspaces
  /// </summary>
  /// <param name="user"></param>
  /// <returns></returns>
  [UsePaging(IncludeTotalCount = true)]
  [UseProjection]
  [UseFiltering]
  [UseSorting]
  [Authorize]
  public IQueryable<Workspace> GetWorkspaces(ClaimsPrincipal user, [Service] Context context)
  {
    string? userName = user.GetUserName();

    return userName == null 
      ? Enumerable
        .Empty<Workspace>()
        .AsQueryable()
      : context.Workspaces.Where(entry => 
          entry.User != null
          && entry.User.Username == userName
      );
  }

  /// <summary>
  ///   Queries for the Activities
  /// </summary>
  /// <param name="user"></param>
  /// <returns></returns>
  [UsePaging(IncludeTotalCount = true)]
  [UseProjection]
  [UseFiltering]
  [UseSorting]
  [Authorize]
  public IQueryable<Activity> GetActivities(ClaimsPrincipal user, [Service] Context context)
  {
    string? userName = user.GetUserName();
    
    return userName == null
      ? Enumerable
        .Empty<Activity>()
        .AsQueryable()
      : context.Activities.Where(entry => 
          entry.Workspace != null
          && entry.Workspace.User != null
          && entry.Workspace.User.Username == userName
      );
  }

  /// <summary>
  ///   Queries for the Time Entries
  /// </summary>
  /// <param name="user"></param>
  /// <returns></returns>
  [UsePaging(IncludeTotalCount = true)]
  [UseProjection]
  [UseFiltering]
  [UseSorting]
  [Authorize]
  public IQueryable<TimeEntry> GetTimeEntries(ClaimsPrincipal user, [Service] Context context)
  {
    string? userName = user.GetUserName();
    
    return userName == null
      ? Enumerable
        .Empty<TimeEntry>()
        .AsQueryable()
      : context.TimeEntries.Where(entry => 
          entry.Activity != null
          && entry.Activity.Workspace != null
          && entry.Activity.Workspace.User != null
          && entry.Activity.Workspace.User.Username == userName
      );
  }

  #endregion
}