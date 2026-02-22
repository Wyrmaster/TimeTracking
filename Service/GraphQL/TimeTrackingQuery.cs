using System.Security.Claims;
using HotChocolate.Authorization;
using TimeTracking.Persistence;
using TimeTracking.Persistence.Entities;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.GraphQL;

/// <summary>
///   Graph QL Query for querying the time tracking
/// </summary>
public class TimeTrackingQuery: IUserNameResolver
{
  #region Fields
  
  private readonly Context _context;

  #endregion

  #region Constructor

  public TimeTrackingQuery(Context context)
  {
    this._context = context;
  }

  #endregion
  
  #region Queries

  /// <summary>
  ///   Queries for the Workspaces
  /// </summary>
  /// <param name="user"></param>
  /// <returns></returns>
  [UsePaging]
  [UseFiltering]
  [UseSorting]
  [Authorize]
  public IQueryable<Workspace> GetWorkspaces(ClaimsPrincipal user)
  {
    string? userName = user.FindFirstValue("UserName");

    return string.IsNullOrEmpty(userName) 
      ? Enumerable.Empty<Workspace>().AsQueryable()
      : this._context.Workspaces.Where(entry => 
          entry.User != null
          && entry.User.Username == userName
      );
  }

  /// <summary>
  ///   Queries for the Activities
  /// </summary>
  /// <param name="user"></param>
  /// <returns></returns>
  [UsePaging]
  [UseFiltering]
  [UseSorting]
  [Authorize]
  public IQueryable<Activity> GetActivities(ClaimsPrincipal user)
  {
    string? userName = user.FindFirstValue("UserName");
    
    return string.IsNullOrEmpty(userName)
      ? Enumerable.Empty<Activity>().AsQueryable()
      : this._context.Activities.Where(entry => 
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
  [UsePaging]
  [UseFiltering]
  [UseSorting]
  [Authorize]
  public IQueryable<TimeEntry> GetTimeEntries(ClaimsPrincipal user)
  {
    string? userName = user.FindFirstValue("UserName");
    
    return string.IsNullOrEmpty(userName)
      ? Enumerable.Empty<TimeEntry>().AsQueryable()
      : this._context.TimeEntries.Where(entry => 
          entry.Activity != null
          && entry.Activity.Workspace != null
          && entry.Activity.Workspace.User != null
          && entry.Activity.Workspace.User.Username == userName
      );
  }

  #endregion
}