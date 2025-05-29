using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TimeTracking.Persistence.Entities;
using TimeTracking.Persistence.Entities.Abstract;

namespace TimeTracking.Persistence.Postgresql;

public class PostgresqlContext: Context
{
  #region Constructor
  
  public PostgresqlContext(DbContextOptions options) : base(options)
  {
    base.Database.Migrate();
  }

  #endregion

  #region Overrides

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
      .ValueGeneratedOnAdd()
      .HasDefaultValueSql("uuid_generate_v4()");

    return builder;
  }

  #endregion
}