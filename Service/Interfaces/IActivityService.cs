using TimeTracking.Persistence.Entities;
using TimeTracking.Service.Dto.Data;

namespace TimeTracking.Service.Interfaces;

/// <summary>
///   Service Handling Activity interactions
/// </summary>
public interface IActivityService
{
  #region Methods

  /// <summary>
  ///   Add a new activity to a workspace of a user
  /// </summary>
  /// <param name="userName">name of the user</param>
  /// <param name="workspaceId">id of the workspace</param>
  /// <param name="activityName">name of the new activity</param>
  /// <param name="activityDescription">description of the new activity</param>
  /// <param name="activityColor">colorcode of the activity</param>
  /// <param name="token"></param>
  /// <returns></returns>
  Task<long> AddNewActivityAsync(string userName, long workspaceId, string activityName, string activityDescription, int activityColor, CancellationToken token = default);
  
  /// <summary>
  ///   Remove the Activity
  /// </summary>
  /// <param name="userName">name of the user</param>
  /// <param name="activityId">id of the acitivity to remove</param>
  /// <param name="token"></param>
  /// <returns></returns>
  Task<bool> RemoveActivityAsync(string userName, long activityId, CancellationToken token = default);
  
  /// <summary>
  ///   Updates the metadata of the activity
  /// </summary>
  /// <param name="userName">name of the user</param>
  /// <param name="activityId">id of the activity to update</param>
  /// <param name="activityName">new name of the activity</param>
  /// <param name="activityDescription">new description of the new activity</param>
  /// <param name="activityColor">new colorcode of the activity</param>
  /// <param name="token"></param>
  /// <returns></returns>
  Task<bool> UpdateActivityAsync(string userName, long activityId, string activityName, string activityDescription, int activityColor, CancellationToken token = default);


  /// <summary>
  /// Retrieves the details of a specific activity by its ID.
  /// </summary>
  /// <param name="userName">name of the user</param>
  /// <param name="token"></param>
  /// <returns></returns>
  Task<TimeEntry?> GetActivityAsync(string userName, CancellationToken token = default);

  #endregion

  /// <summary>
  /// Retrieve a list of activities for a user, with optional filtering by workspace and search query.
  /// </summary>
  /// <param name="userName">The name of the user requesting the activities.</param>
  /// <param name="offset">The number of activities to skip for pagination.</param>
  /// <param name="count">The number of activities to retrieve.</param>
  /// <param name="workspaceId">The ID of the workspace to filter activities, or null for all workspaces.</param>
  /// <param name="query">An optional search query to filter activities by name or description.</param>
  /// <param name="token">A token to monitor for cancellation requests.</param>
  /// <returns>
  /// An enumerator of activities matching the specified criteria.
  /// </returns>
  Task<IEnumerable<ActivityDto>> GetActivitiesAsync
  (
    string userName,
    int offset = 0,
    int count = 10,
    long? workspaceId = null,
    string? query = null,
    CancellationToken token = default
  );
}