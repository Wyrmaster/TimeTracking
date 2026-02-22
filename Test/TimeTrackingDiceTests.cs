using Microsoft.EntityFrameworkCore;
using Moq;
using TimeTracking.Persistence;
using TimeTracking.Persistence.Entities;
using TimeTracking.Service.Dto.Data;
using TimeTracking.Service.Interfaces;
using TimeTracking.Service.Services;
using TimeTracking.Service.Test.Databases;

namespace TimeTracking.Service.Test;

/// <summary>
///   Generic Time tracking test to be tested by all database providers
/// </summary>
public abstract class TimeTrackingDiceTests<TFixture> :IAsyncLifetime
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
  }

  /// <inheritdoc/>
  public async Task DisposeAsync()
  {
    await this._context.DisposeAsync();
    await this._fixture.DisposeAsync();
  }

  #endregion

  #region Tests

  [Fact(DisplayName = "Dice TimeTracking - Start Tracking an activity by its side id")]
  public async Task StartTrackingWithDice()
  {
    // setup 
    long workSpaceId = BitConverter.ToInt64(Guid.NewGuid().ToByteArray().Take(sizeof(long)).ToArray());
    
    await this._context.Users.AddAsync(new()
    {
      Username = User,
      Password = "test",
      ActiveWorkspace = new()
      {
        Id = workSpaceId,
        Description = "test",
        Name = "test",
        IsDefault = true,
        Activities = [new()
        {
          ActivityName = "First Activity",
          Description = "First Activity",
          SideId = 1,
        }]
      },
      ActiveWorkspaceId = workSpaceId,
    });
    await this._context.SaveChangesAsync();

    // arrange
    await this._timeTracking.SetSideIdAsync(User, 1);

    // assert
    Assert.Multiple
    (
      () => Assert.Single(this._context.TimeEntries),
      () =>
      {
        TimeEntry? singleOrDefault = this._context.TimeEntries.SingleOrDefault();
        Assert.Multiple
        (
          () => Assert.NotNull(singleOrDefault),
          () => Assert.Null(singleOrDefault!.End)
        );
      }
    );
  }
  
  [Fact(DisplayName = "Dice TimeTracking - Stop Tracking an activity")]
  public async Task StartStopTrackingWithDice()
  {
    // setup 
    long workSpaceId = BitConverter.ToInt64(Guid.NewGuid().ToByteArray().Take(sizeof(long)).ToArray());

    this._context.Users.Add(new()
    {
      Username = User,
      Password = "test",
      ActiveWorkspaceId = workSpaceId,
      ActiveWorkspace = new()
      {
        Id = workSpaceId,
        Description = "test",
        Name = "test",
        IsDefault = true,
        Activities = [
          new()
          {
            ActivityName = "First Activity",
            Description = "First Activity", 
            SideId = 1,
            TimeEntries = [
              new()
              {
                Start = DateTime.UtcNow.AddMinutes(-10),
                Description = "",
              }
            ]
          }
        ]
      }
    });
    await this._context.SaveChangesAsync();
  
    // arrange
    await this._timeTracking.SetSideIdAsync(User, 0);
  
    // assert
    Assert.Multiple
    (
      () => Assert.Single(this._context.TimeEntries),
      () =>
      {
        TimeEntry? singleOrDefault = this._context.TimeEntries.SingleOrDefault();
        Assert.Multiple
        (
          () => Assert.NotNull(singleOrDefault),
          () => Assert.NotNull(singleOrDefault!.End)
        );
      }
    );
  }
  
  [Fact(DisplayName = "Dice TimeTracking - Stop Tracking an active activity and Start the new Activity")]
  public async Task StartAndStopNewTrackingDice()
  {
    // setup 
    long workSpaceId = BitConverter.ToInt64(Guid.NewGuid().ToByteArray().Take(sizeof(long)).ToArray());

    this._context.Users.Add(new()
    {
      Username = User,
      Password = "test",
      ActiveWorkspaceId = workSpaceId,
      ActiveWorkspace = new()
      {
        Id = workSpaceId,
        Description = "test",
        Name = "test",
        IsDefault = true,
        Activities = [
          new()
          {
            ActivityName = "First Activity",
            Description = "First Activity", 
            SideId = 1,
            TimeEntries = [
              new()
              {
                Start = DateTime.UtcNow.AddMinutes(-10),
                Description = "",
              }
            ]
          },
          new()
          {
            ActivityName = "Second Activity",
            Description = "",
            SideId = 2,
          }
        ]
      }
    });
    await this._context.SaveChangesAsync();
  
    // arrange
    await this._timeTracking.SetSideIdAsync(User, 2);
  
    // assert
    Assert.Multiple
    (
      () => Assert.Equal(2, this._context.TimeEntries.Count()),
      () =>
      {
        TimeEntry? firstActivity = this._context.TimeEntries.FirstOrDefault();
        TimeEntry? lastActivity = this._context.TimeEntries.Skip(1).FirstOrDefault();
        Assert.Multiple
        (
          () => Assert.NotNull(firstActivity),
          () => Assert.NotNull(lastActivity),
          () => Assert.NotNull(firstActivity!.End),
          () => Assert.True((firstActivity!.End - firstActivity.Start) > TimeSpan.FromMinutes(10)),
          () => Assert.Null(lastActivity!.End)
        );
      }
    );
  }

  [Fact(DisplayName = "TimeTracking - Add a Time Entry")]
  public async Task AddTimeEntry()
  {
    // setup 
    long workSpaceId = BitConverter.ToInt64(Guid.NewGuid().ToByteArray().Take(sizeof(long)).ToArray());

    this._context.Users.Add(new()
    {
      Username = User,
      Password = "test",
      ActiveWorkspaceId = workSpaceId,
      ActiveWorkspace = new()
      {
        Id = workSpaceId,
        Description = "test",
        Name = "test",
        IsDefault = true,
        Activities = [
          new()
          {
            ActivityName = "First Activity",
            Description = "First Activity", 
            SideId = 1,
            TimeEntries = [
              new()
              {
                Start = DateTime.UtcNow.AddMinutes(-10),
                Description = "",
              }
            ]
          }
        ]
      }
    });
    await this._context.SaveChangesAsync();
    // properly set the shadow properties
    (await this._context.Workspaces.AsTracking().FirstAsync()).User = await this._context.Users.AsTracking().FirstAsync();
    await this._context.SaveChangesAsync();
    
    // arrange
    ITimeTrackingService timeTrackingService = new TimeTrackingService(this._context, this._timeHub.Object);
    bool result = await timeTrackingService.AddTimeEntryAsync(User, new TimeEntryDto
    {
      Activity = await this._context.Activities
        .Select(entry => new ActivityDto
        {
          Id = entry.Id,
          Name = entry.ActivityName,
          Description = entry.Description,
          ActivityColor = entry.Color,
          Assigned = entry.SideId != null
        })
        .FirstAsync(entry => entry.Name == "First Activity"),
      Description = "Test Description",
      Start = DateTime.Now.AddMinutes(-5),
      End = DateTime.Now.AddMinutes(5),
    });

    // assert
    Assert.Multiple
    (
      () => Assert.True(result),
      () => Assert.Equal(2, this._context.TimeEntries.Count())
    );
  }

  [Fact(DisplayName = "TimeTracking - Update a Time Entry")]
  public async Task UpdateTimeEntry()
  {
    // setup 
    long workSpaceId = BitConverter.ToInt64(Guid.NewGuid().ToByteArray().Take(sizeof(long)).ToArray());

    this._context.Users.Add(new()
    {
      Username = User,
      Password = "test",
      ActiveWorkspaceId = workSpaceId,
      ActiveWorkspace = new()
      {
        Id = workSpaceId,
        Description = "test",
        Name = "test",
        IsDefault = true,
        Activities = [
          new()
          {
            ActivityName = "First Activity",
            Description = "First Activity", 
            SideId = 1,
            TimeEntries = [
              new()
              {
                Start = DateTime.UtcNow.AddMinutes(-10),
                Description = "",
              }
            ]
          },
          new()
          {
            ActivityName = "Second Activity",
            Description = "Second Activity",
            SideId = 2,
            TimeEntries = []
          }
        ]
      }
    });
    await this._context.SaveChangesAsync();
    // properly set the shadow properties
    (await this._context.Workspaces.AsTracking().FirstAsync()).User = await this._context.Users.AsTracking().FirstAsync();
    await this._context.SaveChangesAsync();

    DateTime
      start = DateTime.Now.AddMinutes(-10), 
      end = DateTime.Now.AddMinutes(-5);

    // arrange
    ITimeTrackingService timeTrackingService = new TimeTrackingService(this._context, this._timeHub.Object);
    const string testDescriptionUpdated = "Test Description Updated";
    await timeTrackingService.UpdateTimeEntryAsync(User, new TimeEntryDto
    {
      Id = (await this._context.TimeEntries.FirstAsync()).Id,
      Description = testDescriptionUpdated,
      Activity = await this._context.Activities
        .Select(entry => new ActivityDto
        {
          Id = entry.Id,
          Name = entry.ActivityName,
          Description = entry.Description,
          ActivityColor = entry.Color,
          Assigned = entry.SideId != null
        })
        .FirstAsync(a => a.Name == "Second Activity"),
      Start = start,
      End = end,
    });
    
    TimeEntry? entry = await this._context.TimeEntries.FirstOrDefaultAsync
    (
      e => e.Activity != null && e.Activity.SideId == 2
    );
    
    Assert.Multiple
    (
      () => Assert.NotNull(entry),
      () => Assert.Equal(testDescriptionUpdated, entry!.Description),
      () => Assert.Equal(start.ToString("u"), entry!.Start!.Value.ToLocalTime().ToString("u")),
      () => Assert.Equal(end.ToString("u"), entry!.End!.Value.ToLocalTime().ToString("u"))
    );
  }

  [Fact(DisplayName = "TimeTracking - Delete a Time Entry")]
  public async Task RemoveTimeEntry()
  {
    // setup 
    long workSpaceId = BitConverter.ToInt64(Guid.NewGuid().ToByteArray().Take(sizeof(long)).ToArray());

    this._context.Users.Add(new()
    {
      Username = User,
      Password = "test",
      ActiveWorkspaceId = workSpaceId,
      ActiveWorkspace = new()
      {
        Id = workSpaceId,
        Description = "test",
        Name = "test",
        IsDefault = true,
        Activities = [
          new()
          {
            ActivityName = "First Activity",
            Description = "First Activity", 
            SideId = 1,
            TimeEntries = [
              new()
              {
                Start = DateTime.UtcNow.AddMinutes(-10),
                Description = "",
              }
            ]
          },
          new()
          {
            ActivityName = "Second Activity",
            Description = "Second Activity",
            SideId = 2,
            TimeEntries = []
          }
        ]
      }
    });
    await this._context.SaveChangesAsync();
    // properly set the shadow properties
    (await this._context.Workspaces.AsTracking().FirstAsync()).User = await this._context.Users.AsTracking().FirstAsync();
    await this._context.SaveChangesAsync();
    this._context.ChangeTracker.Clear();
    
    // arrange
    ITimeTrackingService timeTrackingService = new TimeTrackingService(this._context, this._timeHub.Object);
    bool result = await timeTrackingService.RemoteTimeEntry(User, (await this._context.TimeEntries.FirstAsync()).Id);
    
    // Assert
    Assert.Multiple
    (
      () => Assert.True(result),
      () => Assert.Empty(this._context.TimeEntries)
    );
  }
  
  #endregion
}