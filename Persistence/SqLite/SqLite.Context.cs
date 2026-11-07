using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TimeTracking.Persistence.Entities;
using TimeTracking.Persistence.Entities.Abstract;

namespace TimeTracking.Persistence.SqLite;

/// <summary>
///   Implementation for SQLite
/// </summary>
public class SqLiteContext : Context
{
  #region Constructor

  public SqLiteContext(DbContextOptions options) : base(options)
  {
  }

  #endregion

  #region Overrides

  /// <inheritdoc/>
  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<Activity>(builder => this.SetIdToAutoGenerate(builder));
    modelBuilder.Entity<TimeEntry>(builder => this.SetIdToAutoGenerate(builder));
    modelBuilder.Entity<User>(builder => this.SetIdToAutoGenerate(builder));
    modelBuilder.Entity<Workspace>(builder => this.SetIdToAutoGenerate(builder));
  }

  #endregion

  #region Private Methods

  /// <summary>
  ///   Define default values
  /// </summary>
  /// <param name="builder"></param>
  /// <typeparam name="T"></typeparam>
  /// <returns></returns>
  private EntityTypeBuilder<T> SetIdToAutoGenerate<T>(EntityTypeBuilder<T> builder) where T : BaseEntity
  {
    builder
      .Property(e => e.Id)
      .HasAnnotation("Sqlite:Autoincrement", true);


    return builder;
  }

  #endregion
}