using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TimeTracking.Persistence.Entities;
using TimeTracking.Persistence.Entities.Abstract;
using TimeTracking.Persistence.PseudoEntities;

namespace TimeTracking.Persistence.Postgresql;

/// <summary>
///   <inheritdoc cref="Context"/> implemented for Postgresql
/// </summary>
public class PostgresqlContext: Context
{
  #region Constructor
  
  public PostgresqlContext(DbContextOptions options) : base(options)
  {
  }

  #endregion

  #region Overrides

  /// <inheritdoc/>
  public override async Task<ActivityTracking> UpdateSideAsync(string username, int sideId, CancellationToken cancellationToken = default) =>
    await this
      .Database
      .SqlQuery<ActivityTracking>($"SELECT * FROM update_dice_side_selection ({sideId}, {username}) AS t")
      .SingleAsync(cancellationToken);

  /// <inheritdoc/>
  public override Task<ActivityTracking> UpdateActiveWorkspace(long workspaceId, string username, CancellationToken cancellationToken = default)
    => this
        .Database
        .SqlQuery<ActivityTracking>($"SELECT * FROM update_active_workspace({workspaceId}, {username});")
        .AsEnumerable()
        .ToAsyncEnumerable()
        .SingleAsync(cancellationToken)
        .AsTask()
  ;

  /// <inheritdoc/>
  public override Task StopTrackingAsync(string username, CancellationToken cancellationToken = default)
    => this.Database.ExecuteSqlInterpolatedAsync($"CALL stop_tracking({username});", cancellationToken);

  /// <inheritdoc/>
  public override Task<ActivityTracking> StartTrackingAsync(string username, long activityId, string description = "", CancellationToken cancellationToken = default)
    => this
        .Database
        .SqlQuery<ActivityTracking>($"SELECT * FROM start_tracking({username}, {activityId}, {description});")
        .AsEnumerable()
        .ToAsyncEnumerable()
        .SingleAsync(cancellationToken)
        .AsTask()
  ;

  /// <inheritdoc/>
  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    modelBuilder.HasPostgresExtension("uuid-ossp");
    
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<Activity>(builder => this.SetIdToAutoGenerate(builder));
    modelBuilder.Entity<TimeEntry>(builder => this.SetIdToAutoGenerate(builder));
    modelBuilder.Entity<User>(builder => this.SetIdToAutoGenerate(builder));
    modelBuilder.Entity<Workspace>(builder => this.SetIdToAutoGenerate(builder));
  }

  #endregion

  #region Private Methods

  /// <summary>
  ///   Set the ID column to autogenerate with the postgres method
  /// </summary>
  /// <param name="builder"></param>
  /// <typeparam name="T"></typeparam>
  /// <returns></returns>
  private EntityTypeBuilder<T> SetIdToAutoGenerate<T>(EntityTypeBuilder<T> builder) where T : BaseEntity
  {
    builder
      .Property(entity => entity.Id)
      .UseIdentityColumn();

    return builder;
  }

  #endregion
}