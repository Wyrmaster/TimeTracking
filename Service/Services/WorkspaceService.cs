using Microsoft.EntityFrameworkCore;
using TimeTracking.Persistence;
using TimeTracking.Persistence.Entities;
using TimeTracking.Persistence.PseudoEntities;
using TimeTracking.Service.Dto.Data;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Services;

/// <inheritdoc cref="IWorkspaceService"/>
public class WorkspaceService(Context context): IWorkspaceService
{
  #region WorkspaceService

  /// <inheritdoc cref="IWorkspaceService.GetWorkspacesAsync"/>
  public Task<IEnumerable<WorkspaceDto>> GetWorkspacesAsync(string userName, int offset = 0, int count = 50, string? query = null,
    CancellationToken token = default)
  {
    IEnumerable<Workspace> workspaces = context
      .Workspaces
      .Include(entity => entity.User)
      .Include(entity => entity.ActiveWorkspaceUser)
      .Where(entity => entity.User != null
                       && entity.User.Username == userName
                       && (string.IsNullOrEmpty(query) || entity.Name.ToLower().Contains(query.ToLower())))
      .Skip(offset)
      .Take(count);
    
    return Task.FromResult(workspaces.Select(workspace => new WorkspaceDto
    {
      Id = workspace.Id,
      Name = workspace.Name,
      Description = workspace.Description,
      IsActive = workspace.ActiveWorkspaceUser != null
    }));
  }

  /// <inheritdoc cref="IWorkspaceService.AddWorkspaceAsync"/>
  public async Task<long> AddWorkspaceAsync(string userName, string workspaceName, string description = "", CancellationToken token = default)
  {
    Workspace workspace = new()
    {
      Name = workspaceName,
      Description = description,
      IsDefault = false,
      User = await context.Users.AsTracking().SingleAsync(entry => entry.Username == userName, token)
    };

    await context.Workspaces.AddAsync(workspace, token);
    
    await context.SaveChangesAsync(token);

    return workspace.Id;
  }

  /// <inheritdoc cref="IWorkspaceService.RemoveWorkspaceAsync"/>
  public async Task<bool> RemoveWorkspaceAsync(string userName, long workspaceId, CancellationToken token = default)
  {
    Workspace? workspace = await context
      .Workspaces
      .SingleOrDefaultAsync
      (
        entry => entry.User != null
                 && entry.User.Username == userName
                 && entry.Id == workspaceId
                 && !entry.IsDefault,
        token
      );

    if (workspace == null)
    {
      return false;
    }
    
    context.Workspaces.Remove(workspace);
    await context.SaveChangesAsync(token);

    return true;
  }

  /// <inheritdoc cref="IWorkspaceService.UpdateWorkspaceAsync"/>
  public async Task<bool> UpdateWorkspaceAsync(string userName, long workspaceId, string workspaceName, string description, CancellationToken token = default)
  {
    Workspace? workspace = await context
      .Workspaces
      .AsTracking()
      .SingleOrDefaultAsync
      (
        entry => entry.User != null
                 && entry.User.Username == userName
                 && entry.Id == workspaceId, token
      );

    if (workspace == null)
    {
      return false;
    }
    
    workspace.Name = workspaceName;
    workspace.Description = description;
    
    return await context.SaveChangesAsync(token) > 0;
  }

  /// <inheritdoc cref="IWorkspaceService.SetActiveWorkspaceAsync"/>
  public async Task<ActivityTracking> SetActiveWorkspaceAsync(string userName, long workspaceId, CancellationToken token = default)
    => await context.UpdateActiveWorkspace(workspaceId, userName, token);

  #endregion
}