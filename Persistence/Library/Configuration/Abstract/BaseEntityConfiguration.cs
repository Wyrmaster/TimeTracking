using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TimeTracking.Persistence.Entities.Abstract;

namespace TimeTracking.Persistence.Configuration.Abstract;

/// <summary>
///   Configuration for the <see cref="BaseEntity"/>
/// </summary>
/// <typeparam name="TEntity"></typeparam>
public abstract class BaseEntityConfiguration<TEntity>: IEntityTypeConfiguration<TEntity> where TEntity : BaseEntity
{
  #region EntityTypeConfiguration

  public void Configure(EntityTypeBuilder<TEntity> builder)
  {
    builder
      .HasKey(e => e.Id);

    builder
      .Property(e => e.Id)
      .HasColumnName("id");
    
    this.OnConfiguring(builder);
  }

  #endregion

  #region Abstract Methods

  /// <summary>
  ///   Add additional Configurations to the Entity
  /// </summary>
  /// <param name="builder"></param>
  protected abstract void OnConfiguring(EntityTypeBuilder<TEntity> builder);

  #endregion
}