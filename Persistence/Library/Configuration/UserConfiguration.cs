using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TimeTracking.Persistence.Configuration.Abstract;
using TimeTracking.Persistence.Entities;

namespace TimeTracking.Persistence.Configuration;

/// <summary>
///   Configuration for the <see cref="User"/> Entity
/// </summary>
public class UserConfiguration: BaseEntityConfiguration<User>
{
  #region Overrides
  
  protected override void OnConfiguring(EntityTypeBuilder<User> builder)
  {
    builder
      .ToTable("users", "tt");
    
    // Relations Properties

    builder
      .HasMany(entity => entity.Activities)
      .WithOne(entity => entity.User);

    builder
      .HasOne(entity => entity.ActiveWorkspace)
      .WithOne()
      .HasPrincipalKey<User>(entity => entity.ActiveWorkspaceId)
      .IsRequired(false);
    
    builder
      .HasMany(entity => entity.Workspaces)
      .WithOne(entity => entity.User);
    
    // Properties
    
    builder
      .Property(entity => entity.Username)
      .HasColumnName("username")
      .HasMaxLength(64)
      .IsRequired();
    
    builder
      .Property(entity => entity.Password)
      .HasColumnName("password")
      .HasMaxLength(64)
      .IsRequired();
  }

  #endregion
}