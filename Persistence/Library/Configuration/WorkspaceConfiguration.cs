using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TimeTracking.Persistence.Configuration.Abstract;
using TimeTracking.Persistence.Entities;

namespace TimeTracking.Persistence.Configuration;

public class WorkspaceConfiguration: BaseEntityConfiguration<Workspace>
{
  #region Overrides

  protected override void OnConfiguring(EntityTypeBuilder<Workspace> builder)
  {
    builder
      .ToTable("workspace", "tt");
    
    // Relations
    
    builder
      .HasMany(entity => entity.Activities)
      .WithOne(entity => entity.Workspace);
    
    builder
      .HasOne(entity => entity.User)
      .WithMany(entity => entity.Workspaces);
    
    // Properties
    
    builder
      .Property(entity => entity.Name)
      .HasColumnName("name")
      .HasMaxLength(64)
      .IsRequired();
    
    builder
      .Property(entity => entity.Description)
      .HasColumnName("description")
      .HasMaxLength(256)
      .IsRequired(false);
    
    builder
      .Property(entity => entity.IsDefault)
      .HasColumnName("is_default")
      .IsRequired();
  }

  #endregion
}