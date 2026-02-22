using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TimeTracking.Service.Common;
using TimeTracking.Service.Dto.Data;
using TimeTracking.Service.Extensions;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Controllers;

/// <summary>
///   Controller handling with workspaces
/// </summary>
[ApiController]
[Route("api/v1/workspace/")]
public class WorkspaceController(IWorkspaceService workspaceService) : UserNameController
{
  #region Endpoints
  
  /// <summary>
  ///   Get Workspaces
  /// </summary>
  /// <param name="offset">offset of the pagination</param>
  /// <param name="count">amount of activities to return</param>
  /// <param name="query"></param>
  /// <param name="token"></param>
  /// <returns></returns>
  [HttpGet]
  [Authorize]
  public async Task<IActionResult> GetWorkspacesAsync
  (
    [FromQuery] int offset = 0,
    [FromQuery] int count = 50,
    [FromQuery] string? query = null,
    CancellationToken token = default
  )
  {
    string? userName = this.GetUserName(this.User);

    if (string.IsNullOrEmpty(userName))
    {
      return this.Problem("User name cannot be null or empty.");
    }

    return this.Ok(await workspaceService.GetWorkspacesAsync(userName, offset, count, query, token));
  }

  /// <summary>
  ///   Add a new workspace
  /// </summary>
  /// <param name="workspace">Dto describing a new workspace</param>
  /// <param name="token"></param>
  /// <returns></returns>
  [Authorize]
  [HttpPost]
  public async Task<IActionResult> AddWorkspace([FromBody] WorkspaceDto workspace, CancellationToken token = default)
  {
    string? userName = this.GetUserName(this.User);

    if (string.IsNullOrEmpty(userName))
    {
      return this.Problem("User name cannot be null or empty.");
    }

    return this.Ok
    (
      await workspaceService.AddWorkspaceAsync
      (
        userName,
        workspace.Name,
        workspace.Description ?? string.Empty,
        token
      )
    );
  }
  
  /// <summary>
  ///   Removes a Workspace
  /// </summary>
  /// <param name="workspaceId">id of the workspace to remove</param>
  /// <param name="token"></param>
  /// <returns></returns>
  [Authorize]
  [HttpDelete("{workspaceId}/")]
  public async Task<IActionResult> RemoveWorkspace(long workspaceId, CancellationToken token = default)
  {
    string? userName = this.GetUserName(this.User);

    if (string.IsNullOrEmpty(userName))
    {
      return this.Problem("User name cannot be null or empty.");
    }

    return this.Ok
    (
      await workspaceService.RemoveWorkspaceAsync
      (
        userName,
        workspaceId,
        token
      )
    );
  }

  /// <summary>
  ///   Update the active workspace of a user to a given id
  /// </summary>
  /// <param name="workspaceId">workspace id to set active</param>
  /// <param name="token"></param>
  /// <returns></returns>
  [Authorize]
  [HttpPut("activate/{workspaceId}/")]
  public async Task<IActionResult> SetActiveWorkspace(long workspaceId, CancellationToken token = default)
  {
    string? userName = this.GetUserName(this.User);

    if (string.IsNullOrEmpty(userName))
    {
      return this.Problem("User name cannot be null or empty.");
    }
    
    return this.Ok(await workspaceService.SetActiveWorkspaceAsync(userName, workspaceId, token));
  }

  /// <summary>
  ///   Updates a workspace
  /// </summary>
  /// <param name="workspaceId">id of hte workspace to update</param>
  /// <param name="workspace"></param>
  /// <param name="token"></param>
  /// <returns></returns>
  [Authorize]
  [HttpPut("{workspaceId}/")]
  public async Task<IActionResult> UpdateWorkspace
  (
    long workspaceId,
    [FromBody] WorkspaceDto workspace,
    CancellationToken token = default
  )
  {
    string? userName = this.GetUserName(this.User);

    if (string.IsNullOrEmpty(userName))
    {
      return this.Problem("User name cannot be null or empty.");
    }
    
    return this.Ok
    (
      await workspaceService.UpdateWorkspaceAsync
      (
        userName,
        workspaceId,
        workspace.Name,
        workspace.Description ?? string.Empty,
        token
      )
    );
  }

  #endregion
}