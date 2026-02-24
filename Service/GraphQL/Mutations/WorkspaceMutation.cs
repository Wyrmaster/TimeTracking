using System.Security.Claims;
using HotChocolate.Authorization;
using TimeTracking.Persistence.PseudoEntities;
using TimeTracking.Service.Extensions;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.GraphQL.Mutations;

/// <summary>
///   GraphQL Mutation for Workspace interactions
/// </summary>
public partial class TimeTrackingMutation: IUserNameResolver
{
  #region Mutations

  /// <summary>
  ///   Add a new workspace
  /// </summary>
  /// <param name="user">User to add a new workspace to</param>
  /// <param name="workspaceName">name of the new workspace</param>
  /// <param name="description">description of the workspace</param>
  /// <param name="token"></param>
  /// <returns></returns>
  [Authorize]
  public Task<long> AddWorkspace(ClaimsPrincipal user, string workspaceName, string description = "", CancellationToken token = default)
  {
    string? userName = this.GetUserName(user);

    if (string.IsNullOrEmpty(userName))
    {
      return Task.FromResult(-1L);
    }

    return this._workspaceService.AddWorkspaceAsync(userName, workspaceName, description, token);
  }
  
  /// <summary>
  ///   Removes a Workspace
  /// </summary>
  /// <param name="user">User to add a new workspace to</param>
  /// <param name="workspaceId">id of the workspace to remove</param>
  /// <param name="token"></param>
  /// <returns></returns>
  [Authorize]
  public Task<bool> RemoveWorkspace(ClaimsPrincipal user, long workspaceId, CancellationToken token = default)
  {
    string? userName = this.GetUserName(user);

    if (string.IsNullOrEmpty(userName))
    {
      return Task.FromResult(false);
    }

    return this._workspaceService.RemoveWorkspaceAsync(userName, workspaceId, token);
  }

  /// <summary>
  ///   Update the active workspace of a user to a given id
  /// </summary>
  /// <param name="user">user to set the active workspace to</param>
  /// <param name="workspaceId">workspace id to set active</param>
  /// <param name="token"></param>
  /// <returns></returns>
  [Authorize]
  public async Task<bool> SetActiveWorkspace(ClaimsPrincipal user, long workspaceId, CancellationToken token = default)
  {
    string? userName = this.GetUserName(user);

    if (string.IsNullOrEmpty(userName))
    {
      return false;
    }
    
    ActivityTracking tracking = await this._context.UpdateActiveWorkspace(workspaceId, userName, token);
    
    return tracking.ActivityId != 0;
  }

  /// <summary>
  ///   Updates a workspace
  /// </summary>
  /// <param name="user">user to which the workspace belongs</param>
  /// <param name="workspaceId">id of hte workspace to update</param>
  /// <param name="workspaceName">new workspace name</param>
  /// <param name="description">new description of the workspace</param>
  /// <param name="token"></param>
  /// <returns></returns>
  [Authorize]
  public Task<bool> UpdateWorkspace
  (
    ClaimsPrincipal user,
    long workspaceId,
    string workspaceName,
    string description = "",
    CancellationToken token = default
  )
  {
    string? userName = this.GetUserName(user);

    if (string.IsNullOrEmpty(userName))
    {
      return Task.FromResult(false);
    }
    
    return this._workspaceService.UpdateWorkspaceAsync(userName, workspaceId, workspaceName, description, token);
  }

  #endregion
}