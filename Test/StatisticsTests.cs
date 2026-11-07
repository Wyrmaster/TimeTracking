using TimeTracking.Persistence;
using TimeTracking.Persistence.Entities;
using TimeTracking.Service.Dto.Data.Statistics;
using TimeTracking.Service.Interfaces;
using TimeTracking.Service.Services;
using TimeTracking.Service.Test.Databases;

namespace TimeTracking.Service.Test;

public abstract class StatisticsTests<TFixture> : IAsyncLifetime
  where TFixture : DatabaseFixtureBase, new()
{
  #region Constants

  private const string User = "TestUser";

  #endregion

  #region Fields

  private Context _context = null!;

  private TFixture _fixture = null!;

  private Activity _coding = null!;

  private Activity _meeting = null!;

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

    this._coding = new()
    {
      ActivityName = "Coding",
      Description = string.Empty,
      Color = 0x00ff00,
      Workspace = workspace
    };
    this._meeting = new()
    {
      ActivityName = "Meeting",
      Description = string.Empty,
      Color = 0xff0000,
      Workspace = workspace
    };

    this._context.Activities.AddRange(this._coding, this._meeting);

    DateTime start = new(2026, 11, 2, 8, 0, 0, DateTimeKind.Utc);

    this._context.TimeEntries.AddRange
    (
      new TimeEntry { Activity = this._coding, Start = start, End = start.AddHours(2) },
      new TimeEntry { Activity = this._coding, Start = start.AddHours(3), End = start.AddHours(4) },
      new TimeEntry { Activity = this._meeting, Start = start.AddHours(5), End = start.AddMinutes(330) }
    );

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

  [Fact(DisplayName = "Statistics - Get")]
  public async Task GetStatisticsAsync()
  {
    IStatisticsService statisticsService = new StatisticsService(this._context);

    StatisticsDto? statistics = await statisticsService.GetStatisticActivityAsync(User, []);

    Assert.Multiple
    (
      () => Assert.NotNull(statistics),
      () => Assert.Equal(3, statistics!.TimeEntries.Count()),
      () => Assert.Equal
      (
        TimeSpan.FromHours(3).Ticks,
        statistics!
          .Statistics
          .Single(activity => activity.ActivityName == "Coding")
          .Duration
      )
    );
  }

  [Fact(DisplayName = "Statistics - Exclude Activities")]
  public async Task GetStatisticsExcludingActivitiesAsync()
  {
    IStatisticsService statisticsService = new StatisticsService(this._context);

    StatisticsDto? statistics = await statisticsService.GetStatisticActivityAsync(User, [this._coding.Id]);

    Assert.Multiple
    (
      () => Assert.NotNull(statistics),
      () => Assert.Single(statistics!.TimeEntries),
      () => Assert.All(statistics!.TimeEntries, entry => Assert.Equal("Meeting", entry.ActivityName))
    );
  }

  [Fact(DisplayName = "Statistics - Export Entries")]
  public async Task ExportEntriesAsync()
  {
    IStatisticsService statisticsService = new StatisticsService(this._context);

    string? tsv = await statisticsService.GetStatisticsTsvAsync(User, [], StatisticsExportType.Entries);

    string[] rows = tsv!.Split('\n', StringSplitOptions.RemoveEmptyEntries);

    Assert.Multiple
    (
      () => Assert.Equal(4, rows.Length),
      () => Assert.Equal("Activity\tStart\tEnd\tDuration\tHours", rows[0]),
      () => Assert.Equal("Coding\t2026-11-02T08:00:00Z\t2026-11-02T10:00:00Z\t02:00\t2.00", rows[1])
    );
  }

  [Fact(DisplayName = "Statistics - Export Summary")]
  public async Task ExportSummaryAsync()
  {
    IStatisticsService statisticsService = new StatisticsService(this._context);

    string? tsv = await statisticsService.GetStatisticsTsvAsync(User, [], StatisticsExportType.Summary);

    string[] rows = tsv!.Split('\n', StringSplitOptions.RemoveEmptyEntries);

    Assert.Multiple
    (
      () => Assert.Equal(3, rows.Length),
      () => Assert.Equal("Activity\tDuration\tHours", rows[0]),
      () => Assert.Contains("Coding\t03:00\t3.00", rows),
      () => Assert.Contains("Meeting\t00:30\t0.50", rows)
    );
  }

  #endregion
}
