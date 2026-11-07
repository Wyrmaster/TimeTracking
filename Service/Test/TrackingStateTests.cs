using Microsoft.EntityFrameworkCore;
using TimeTracking.Persistence;
using TimeTracking.Persistence.Entities;
using TimeTracking.Service.Dto.Data;
using TimeTracking.Service.Interfaces;
using TimeTracking.Service.Services;
using TimeTracking.Service.Test.Databases;

namespace TimeTracking.Service.Test;

public abstract class TrackingStateTests<TFixture> : IAsyncLifetime
  where TFixture : DatabaseFixtureBase, new()
{
  #region Constants

  private const string User = "TestUser";

  #endregion

  #region Fields

  private Context _context = null!;

  /// <summary>
  ///   separate context used by the service, like a fresh context per request in production
  /// </summary>
  private Context _serviceContext = null!;

  private TFixture _fixture = null!;

  private ITimeTrackingService _timeTracking = null!;

  private Activity _activity = null!;

  #endregion

  #region AsyncLifetime

  /// <inheritdoc/>
  public async Task InitializeAsync()
  {
    this._fixture = new();
    await this._fixture.InitializeAsync();

    this._context = this._fixture.CreateDatabaseContext();

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

    this._activity = new()
    {
      ActivityName = "Coding",
      Description = string.Empty,
      Color = 0x00ff00,
      Workspace = workspace
    };

    this._context.Activities.Add(this._activity);
    this._context.Update(user);
    this._context.Update(workspace);

    await this._context.SaveChangesAsync();

    this._serviceContext = this._fixture.CreateDatabaseContext();
    this._timeTracking = new TimeTrackingService(this._serviceContext);
  }

  /// <inheritdoc/>
  public async Task DisposeAsync()
  {
    await this._serviceContext.DisposeAsync();
    await this._context.DisposeAsync();
    await this._fixture.DisposeAsync();
  }

  #endregion

  #region Tests

  [Fact(DisplayName = "Tracking State - Unchanged")]
  public async Task UnchangedStateAsync()
  {
    TrackingStateDto first = await this._timeTracking.GetTrackingStateAsync(User);
    TrackingStateDto second = await this._timeTracking.GetTrackingStateAsync(User);

    Assert.Multiple
    (
      () => Assert.Equal(first.Version, second.Version),
      () => Assert.Null(first.ActiveActivityId)
    );
  }

  [Fact(DisplayName = "Tracking State - Start and Stop Tracking")]
  public async Task StartStopTrackingAsync()
  {
    TrackingStateDto initial = await this._timeTracking.GetTrackingStateAsync(User);

    await this._timeTracking.StartTrackingAsync(User, new StartActivityDto { ActivityId = this._activity.Id, Description = string.Empty });
    TrackingStateDto started = await this._timeTracking.GetTrackingStateAsync(User);

    await this._timeTracking.StopTrackingAsync(User);
    TrackingStateDto stopped = await this._timeTracking.GetTrackingStateAsync(User);

    Assert.Multiple
    (
      () => Assert.NotEqual(initial.Version, started.Version),
      () => Assert.Equal(this._activity.Id, started.ActiveActivityId),
      () => Assert.NotEqual(started.Version, stopped.Version),
      () => Assert.Null(stopped.ActiveActivityId)
    );
  }

  [Fact(DisplayName = "Tracking State - Add Time Entry")]
  public async Task AddTimeEntryAsync()
  {
    TrackingStateDto initial = await this._timeTracking.GetTrackingStateAsync(User);

    DateTime start = DateTime.UtcNow.AddHours(-2);

    await this._timeTracking.AddTimeEntryAsync
    (
      User,
      new TimeEntryDto
      {
        Description = string.Empty,
        Start = start,
        End = start.AddHours(1),
        Activity = new ActivityDto { Id = this._activity.Id }
      }
    );

    TrackingStateDto added = await this._timeTracking.GetTrackingStateAsync(User);

    Assert.NotEqual(initial.Version, added.Version);
  }

  [Fact(DisplayName = "Stop Tracking - Removes entries shorter than a minute")]
  public async Task StopTrackingRemovesShortEntryAsync()
  {
    await this._timeTracking.StartTrackingAsync(User, new StartActivityDto { ActivityId = this._activity.Id, Description = string.Empty });
    await this._timeTracking.StopTrackingAsync(User);

    Assert.Empty(this._context.TimeEntries);
  }

  [Fact(DisplayName = "Stop Tracking - Keeps entries of a minute or longer")]
  public async Task StopTrackingKeepsLongEntryAsync()
  {
    await using (Context arrangeContext = this._fixture.CreateDatabaseContext())
    {
      arrangeContext.TimeEntries.Add(new TimeEntry
      {
        Activity = await arrangeContext
          .Activities
          .AsTracking()
          .FirstAsync(activity => activity.Id == this._activity.Id),
        Description = string.Empty,
        Start = DateTime.UtcNow.AddMinutes(-5),
      });
      await arrangeContext.SaveChangesAsync();
    }

    await this._timeTracking.StopTrackingAsync(User);

    TimeEntry entry = Assert.Single(this._context.TimeEntries);
    Assert.NotNull(entry.End);
  }

  #endregion
}
