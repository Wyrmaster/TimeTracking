using Microsoft.EntityFrameworkCore;
using Moq;
using TimeTracking.Persistence;
using TimeTracking.Persistence.Entities;
using TimeTracking.Service.Dto.Data;
using TimeTracking.Service.Interfaces;
using TimeTracking.Service.Services;
using TimeTracking.Service.Test.Databases;

namespace TimeTracking.Service.Test;

public abstract class ActivityTests<TFixture> :IAsyncLifetime
  where TFixture : DatabaseFixtureBase, new()
{
  #region Constants

  private const string User = "TestUser";

  #endregion
  
  #region Fields

  private Context _context = null!;
  // suppressed as it is defined in the setup
  private ITimeTrackingService _timeTracking = null!;
  
  private TFixture _fixture = null!;
  
  private readonly Mock<ITimeHub> _timeHub = new();

  #endregion
  
  #region AsyncLifetime

  /// <inheritdoc/>
  public async Task InitializeAsync()
  {
    this._fixture = new();
    await this._fixture.InitializeAsync();
    
    this._context = this._fixture.CreateDatabaseContext();
    
    this._timeTracking = new TimeTrackingService(this._context, this._timeHub.Object);

    Workspace workspace = new()
    {
      Name = "default",
      IsDefault = true,
      Activities = [],
    };
    
    User user = new()
    {
      Username = User,
      Password = "test",
      ActiveWorkspace = workspace
    };
    
    this._context.Users.Add(user);
    this._context.Workspaces.Add(workspace);
    await this._context.SaveChangesAsync();
    
    workspace.User = user;
    workspace.ActiveWorkspaceUser = user;
    
    this._context.Update(user);
    this._context.Update(workspace);
    
    await this._context.SaveChangesAsync();
  }

  /// <inheritdoc/>
  public async Task DisposeAsync()
  {
    await this._context.DisposeAsync();
    await this._fixture.DisposeAsync();
  }

  #endregion

  #region Tests
  
  [Fact(DisplayName = "Activity - Add")]
  public async Task AddNewActivityAsync()
  {
    IActivityService activityService = new ActivityService(this._context);

    long id = await activityService.AddNewActivityAsync(User, 1, "New Activity", string.Empty, 0x00ff00);

    Assert.Multiple
    (
      () => Assert.NotEqual(0, id),
      () => Assert.Equal(1, this._context.Activities.Count()),
      () =>
      {
        Activity? activity = this._context
          .Activities
          .Include(entity => entity.Workspace)
          .ThenInclude(entity => entity!.User)
          .FirstOrDefault();
        Assert.Multiple
        (
          () => Assert.NotNull(activity),
          () => Assert.Equal("New Activity", activity!.ActivityName),
          () => Assert.Equal(string.Empty, activity!.Description),
          () => Assert.Equal(0x00ff00, activity!.Color),
          () => Assert.Equal(User, activity!.Workspace!.User!.Username)
        );
      }
    );
  }

  [Fact(DisplayName = "Activity - Update")]
  public async Task UpdateActivityAsync()
  {
    Activity activity = new()
    {
      ActivityName = "Test Activity",
      Color = 0x00ff00,
      Description = string.Empty,
      Workspace = await this._context.Workspaces.AsTracking().FirstAsync()
    };
    
    this._context.Activities.Add(activity);

    await this._context.SaveChangesAsync();
    
    IActivityService activityService = new ActivityService(this._context);

    bool result = await activityService.UpdateActivityAsync
    (
      User,
      activity.Id,
      "Updated Activity",
      "Updated Description",
      0xff0000
    );
    
    activity = await this._context.Activities.FirstAsync();
    
    Assert.Multiple
    (
      () => Assert.True(result),
      () => Assert.Equal("Updated Activity", activity.ActivityName),
      () => Assert.Equal("Updated Description", activity.Description),
      () => Assert.Equal(0xff0000, activity.Color),
      () => Assert.Equal
        (
          User,
          this._context
            .Activities
            .Include(entity => entity.Workspace)
            .ThenInclude(entity => entity!.User)
            .FirstAsync()
            .GetAwaiter()
            .GetResult()
            .Workspace
            ?.User
            ?.Username
        )
    );
  }

  [Fact(DisplayName = "Activity - Remove")]
  public async Task RemoveActivityAsync()
  {
    // setup
    await this._context.Activities.AddAsync(new()
    {
      ActivityName = "New Activity",
      Description = "Some Description",
      Color = 0x00ff00,
      SideId = 7,
      Workspace = await this._context.Workspaces.AsTracking().FirstAsync()
    });
    await this._context.SaveChangesAsync();
    
    // arrange
    IActivityService activityService = new ActivityService(this._context);
    bool result = await activityService.RemoveActivityAsync(User, 1);
    
    // Assert
    Assert.Multiple
    (
      () => Assert.True(result),
      () => Assert.Empty(this._context.Activities)
    );
  }

  [Fact(DisplayName = "Activity - Get")]
  public async Task GetActivitiesAsync()
  {
    Workspace workspace = await this._context.Workspaces.AsTracking().FirstAsync();
    this._context.Activities.Add(new()
    {
      ActivityName = "Test Activity2",
      Color = 0x00ff00,
      Description = string.Empty,
      Workspace = workspace
    });
    this._context.Activities.Add(new()
    {
      ActivityName = "Test Activity3",
      Color = 0x00ff00,
      Description = string.Empty,
      Workspace = workspace
    });
    this._context.Activities.Add(new()
    {
      ActivityName = "Test Activity3",
      Color = 0x00ff00,
      Description = string.Empty,
      Workspace = workspace
    });
    
    await this._context.SaveChangesAsync();
    
    IActivityService activityService = new ActivityService(this._context);

    IEnumerable<ActivityDto> activities = await activityService.GetActivitiesAsync(User, 0, 2);

    Assert.Equal(2, activities.Count());
  }

  #endregion
}