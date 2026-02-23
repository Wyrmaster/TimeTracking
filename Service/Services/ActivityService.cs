using Microsoft.EntityFrameworkCore;
using TimeTracking.Persistence;
using TimeTracking.Persistence.Entities;
using TimeTracking.Service.Dto.Data;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Services;

/// <inheritdoc cref="IActivityService"/>
public class ActivityService(Context context) : IActivityService
{
  #region ActivityPersistence
  
  /// <inheritdoc cref="IActivityService.GetActivitiesAsync"/>
  public Task<IEnumerable<ActivityDto>> GetActivitiesAsync(string userName, int offset, int count, long? workspaceId, string? query,
    CancellationToken token)
  {
    IQueryable<Activity> activities = context
      .Activities
      .Include(entity => entity.Workspace)
      .ThenInclude(entity => entity!.User)
      .Where(entity => entity.Workspace != null
                       && entity.Workspace.User != null
                       && entity.Workspace.User.Username == userName
                       && (string.IsNullOrEmpty(query) || entity.ActivityName.ToLower().Contains(query.ToLower())));

    if (workspaceId.HasValue)
    {
      activities = activities.Where
      (
        entity => entity.Workspace != null
                  && entity.Workspace.Id == workspaceId
      );
    }
    else
    {
      activities = activities.Where
      (
        entity => entity.Workspace != null
                  && entity.Workspace.User != null
                  && entity.Workspace.User.ActiveWorkspaceId == entity.Workspace.Id
      );
    }

    return Task.FromResult<IEnumerable<ActivityDto>>(
      activities
        .Skip(offset)
        .Take(count)
        .Select(activity => new ActivityDto
        { 
          Id = activity.Id,
          Name = activity.ActivityName,
          Description = activity.Description,
          ActivityColor = activity.Color,
          Assigned = activity.SideId != null,
        })
    );
  }

  /// <inheritdoc cref="IActivityService.AddNewActivityAsync"/>
  public async Task<long> AddNewActivityAsync
  (
    string userName,
    long workspaceId,
    string activityName,
    string activityDescription,
    int activityColor,
    CancellationToken token = default
  )
  {
    Workspace? workspace = await context
      .Workspaces
      .Include(entity => entity.User)
      .AsTracking()
      .SingleOrDefaultAsync
    (
      entry => 
        entry.User != null
        && entry.User.Username == userName
        && entry.Id == workspaceId,
      cancellationToken: token
    );

    if (workspace == null)
    {
      return 0L;
    }
    
    Activity activity = new()
    {
      ActivityName = activityName,
      Description = activityDescription,
      Color = activityColor,
      Workspace = workspace
    };
    
    await context.Activities.AddAsync(activity, token);
    await context.SaveChangesAsync(token);

    return activity.Id;
  }

  /// <inheritdoc cref="IActivityService.RemoveActivityAsync"/>
  public async Task<bool> RemoveActivityAsync(string userName, long activityId, CancellationToken token = default)
  {
    Activity? activity = await context.Activities.SingleOrDefaultAsync(
      entry => entry.Workspace != null
               && entry.Workspace.User != null
               && entry.Workspace.User.Username == userName
               && entry.Id == activityId,
      cancellationToken: token
    );

    if (activity == null)
    {
      return false;
    }
    
    context.Activities.Remove(activity);

    return await context.SaveChangesAsync(token) > 0;
  }

  /// <inheritdoc cref="IActivityService.UpdateActivityAsync"/>
  public async Task<bool> UpdateActivityAsync
  (
    string userName,
    long activityId,
    string activityName,
    string activityDescription,
    int activityColor,
    CancellationToken token = default
  )
  {
    Activity? activity = await context.Activities.AsTracking().SingleOrDefaultAsync(
      entry => entry.Workspace != null
               && entry.Workspace.User != null
               && entry.Workspace.User.Username == userName
               && entry.Id == activityId,
      cancellationToken: token
    );

    if (activity == null)
    {
      return false;
    }
    
    activity.ActivityName = activityName;
    activity.Description = activityDescription;
    activity.Color = activityColor;
    
    return await context.SaveChangesAsync(token) > 0;
  }

  /// <inheritdoc cref="IActivityService.GetActivityAsync"/>
  public async Task<TimeEntry?> GetActivityAsync(string userName, CancellationToken token = default)
  {
    TimeEntry? timeEntry = await context.TimeEntries
      .Include(entity => entity.Activity)
      .ThenInclude(entity => entity!.Workspace)
      .ThenInclude(entity => entity!.User)
      .FirstOrDefaultAsync
      (
        entity => entity.Activity != null
                  && entity.Activity.Workspace != null
                  && entity.Activity.Workspace.User != null
                  && entity.Activity.Workspace.User.Username == userName 
                  && entity.End == null, cancellationToken: token
      );

    return timeEntry;
  }

  #endregion
}