using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TimeTracking.Persistence.Entities;
using TimeTracking.Persistence.Entities.Abstract;

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