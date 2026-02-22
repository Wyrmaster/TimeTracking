using TimeTracking.Persistence.PseudoEntities;
using TimeTracking.Service.Dto.Data;

namespace TimeTracking.Service.Interfaces;

/// <summary>
///   Service Handling Workspace interactions
/// </summary>
public interface IWorkspaceService
{
  #region Methods

  /// <summary>
  ///   Retrieves a list of workspaces associated with a user based on the specified parameters.
  /// </summary>
  /// <param name="userName">The username associated with the workspaces to retrieve.</param>
  /// <param name="offset">The starting index for the workspace retrieval. Default is 0.</param>
  /// <param name="count">The maximum number of workspaces to retrieve. Default is 50.</param>
  /// <param name="query">An optional query string to filter the retrieved workspaces.</param>
  /// <param name="token">A cancellation token to observe while waiting for the task to complete.</param>
  /// <returns>list of workspaces.</returns>
  Task<IEnumerable<WorkspaceDto>> GetWorkspacesAsync(string userName, int offset = 0, int count = 50,
    string? query = null, CancellationToken token = default);

  /// <summary>
  ///   Adds a new Workspace
  /// </summary>
  /// <param name="userName">User to add a new workspace to</param>
  /// <param name="workspaceName">name of the new workspace</param>
  /// <param name="description">description of the workspace</param>
  /// <param name="token"></param>
  /// <returns></returns>
  Task<long> AddWorkspaceAsync(string userName, string workspaceName, string description = "", CancellationToken token = default);
  
  /// <summary>
  ///   Removes a workspace from a user
  /// </summary>
  /// <param name="userName">User to add a new workspace to</param>
  /// <param name="workspaceId">id of the workspace to remove</param>
  /// <param name="token"></param>
  /// <returns></returns>
  Task<bool> RemoveWorkspaceAsync(string userName, long workspaceId, CancellationToken token = default);
  
  /// <summary>
  ///   Updates a workspace from a user
  /// </summary>
  /// <param name="userName">User to add a new workspace to</param>
  /// <param name="workspaceId">id of the workspace to update</param>
  /// <param name="workspaceName">new name of the workspace</param>
  /// <param name="description">new description of the workspace</param>
  /// <param name="token"></param>
  /// <returns></returns>
  Task<bool> UpdateWorkspaceAsync(string userName, long workspaceId, string workspaceName, string description, CancellationToken token = default);

  /// <summary>
  /// Sets the active workspace for a user and starts activity tracking.
  /// </summary>
  /// <param name="userName">The username associated with the workspace to set as active.</param>
  /// <param name="workspaceId">Id of the workspace to set as active.</param>
  /// <param name="token">A cancellation token to observe while waiting for the task to complete.</param>
  /// <returns>An <see cref="ActivityTracking"/> instance containing details about the started activity and its timestamp, or null if the operation fails.</returns>
  Task<ActivityTracking> SetActiveWorkspaceAsync(string userName, long workspaceId, CancellationToken token = default);

  #endregion
}