using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TimeTracking.Persistence.Configuration.Abstract;
using TimeTracking.Persistence.Entities;

namespace TimeTracking.Persistence.Configuration;

/// <summary>
///   Configuration Class for the <see cref="Activity"/> entity
/// </summary>
public class ActivityConfiguration: BaseEntityConfiguration<Activity>
{
  #region Overrides
  
  protected override void OnConfiguring(EntityTypeBuilder<Activity> builder)
  {
    builder
      .ToTable("activities", "tt");
    
    // Relations
    
    builder
      .HasMany(entity => entity.TimeEntries)
      .WithOne(entity => entity.Activity)
      .HasForeignKey("activity_id")
      .OnDelete(DeleteBehavior.Cascade)
      .IsRequired();
    
    // Properties
    
    builder
      .Property(entity => entity.Description)
      .HasColumnName("description")
      .HasMaxLength(256)
      .IsRequired(false);
    
    builder
      .Property(entity => entity.ActivityName)
      .HasColumnName("activity_name")
      .HasMaxLength(64)
      .IsRequired();
    
    builder
      .Property(entity => entity.SideId)
      .HasColumnName("side_id")
      .IsRequired(false);
  }

  #endregion
}