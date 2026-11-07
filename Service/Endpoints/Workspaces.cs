using Microsoft.AspNetCore.Mvc;
using TimeTracking.Service.Dto.Data;
using TimeTracking.Service.Extensions;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Endpoints;

/// <summary>
///   Endpoints handling all workspace operations 
/// </summary>
public static class Workspaces
{
  #region Extension Methods

  /// <summary>
  ///   Extension method registering the Activity Endpoints
  /// </summary>
  /// <param name="self"></param>
  /// <returns></returns>
  public static IEndpointRouteBuilder MapWorkspaceEndpoints(this IEndpointRouteBuilder self)
  {
    var group = self
      .MapGroup("api/v1/workspace/")
      .RequireAuthorization();

    group.MapGet("", Workspaces.GetWorkspacesAsync);
    
    group.MapPost("", Workspaces.AddWorkspaceAsync);

    group.MapDelete("{workspaceId:long}/", Workspaces.RemoveWorkspaceAsync);

    group.MapPut("activate/{workspaceId:long}/", Workspaces.SetActiveWorkspaceAsync);
    
    group.MapPut("{workspaceId:long}/", Workspaces.UpdateWorkspace);
    
    return self;
  }
  
  #endregion
  
  #region Endpoints

  /// <summary>
  ///   Get Workspaces
  /// </summary>
  /// <param name="context"></param>
  /// <param name="workspaceService"></param>
  /// <param name="offset">offset of the pagination</param>
  /// <param name="count">amount of activities to return</param>
  /// <param name="query"></param>
  /// <param name="token"></param>
  /// <returns></returns>
  private static async Task<IResult> GetWorkspacesAsync
  (
    HttpContext context,
    IWorkspaceService workspaceService,
    [FromQuery] int offset = 0,
    [FromQuery] int count = 50,
    [FromQuery] string? query = null,
    CancellationToken token = default
  )
  {
    string? userName = context.GetUserName();

    if (string.IsNullOrEmpty(userName))
    {
      return Results.Problem("User name cannot be null or empty.");
    }

    return Results.Ok(await workspaceService.GetWorkspacesAsync(userName, offset, count, query, token));
  }

  /// <summary>
  ///   Add a new workspace
  /// </summary>
  /// <param name="context"></param>
  /// <param name="workspaceService"></param>
  /// <param name="workspace">Dto describing a new workspace</param>
  /// <param name="token"></param>
  /// <returns></returns>
  private static async Task<IResult> AddWorkspaceAsync
  (
    HttpContext context,
    IWorkspaceService workspaceService,
    [FromBody] WorkspaceDto workspace,
    CancellationToken token = default
  )
  {
    string? userName = context.GetUserName();

    if (string.IsNullOrEmpty(userName))
    {
      return Results.Problem("User name cannot be null or empty.");
    }

    return Results.Ok
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
  /// <param name="context"></param>
  /// <param name="workspaceService"></param>
  /// <param name="workspaceId">id of the workspace to remove</param>
  /// <param name="token"></param>
  /// <returns></returns>
  [HttpDelete("{workspaceId}/")]
  private static async Task<IResult> RemoveWorkspaceAsync
  (
    HttpContext context,
    IWorkspaceService workspaceService,
    long workspaceId,
    CancellationToken token = default
  )
  {
    string? userName = context.GetUserName();

    if (string.IsNullOrEmpty(userName))
    {
      return Results.Problem("User name cannot be null or empty.");
    }

    return Results.Ok
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
  /// <param name="context"></param>
  /// <param name="workspaceService"></param>
  /// <param name="workspaceId">workspace id to set active</param>
  /// <param name="token"></param>
  /// <returns></returns>
  [HttpPut("activate/{workspaceId}/")]
  private static async Task<IResult> SetActiveWorkspaceAsync
  (
    HttpContext context,
    IWorkspaceService workspaceService,
    long workspaceId,
    CancellationToken token = default
  )
  {
    string? userName = context.GetUserName();

    if (string.IsNullOrEmpty(userName))
    {
      return Results.Problem("User name cannot be null or empty.");
    }
    
    return Results.Ok(await workspaceService.SetActiveWorkspaceAsync(userName, workspaceId, token));
  }

  /// <summary>
  ///   Updates a workspace
  /// </summary>
  /// <param name="context"></param>
  /// <param name="workspaceService"></param>
  /// <param name="workspaceId">id of hte workspace to update</param>
  /// <param name="workspace"></param>
  /// <param name="token"></param>
  /// <returns></returns>
  [HttpPut("{workspaceId}/")]
  private static async Task<IResult> UpdateWorkspace
  (
    HttpContext context,
    IWorkspaceService workspaceService,
    long workspaceId,
    [FromBody] WorkspaceDto workspace,
    CancellationToken token = default
  )
  {
    string? userName = context.GetUserName();

    if (string.IsNullOrEmpty(userName))
    {
      return Results.Problem("User name cannot be null or empty.");
    }
    
    return Results.Ok
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