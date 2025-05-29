using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TimeTracking.Persistence.Configuration.Abstract;
using TimeTracking.Persistence.Entities;

namespace TimeTracking.Persistence.Configuration;

/// <summary>
///   Configuration for the <see cref="TimeEntry"/> entity
/// </summary>
public class TimeEntryConfiguration: BaseEntityConfiguration<TimeEntry>
{
  #region Overrides
  
  protected override void OnConfiguring(EntityTypeBuilder<TimeEntry> builder)
  {
    builder
      .ToTable("time_entry", "tt");
    
    // Relations
    
    builder
      .HasOne(entity => entity.Activity)
      .WithMany(activity => activity.TimeEntries)
      .IsRequired();
    
    // Properties
    
    builder
      .Property(entity => entity.Description)
      .HasColumnName("description")
      .HasMaxLength(256)
      .IsRequired(false);
    
    builder
      .Property(entity => entity.Start)
      .HasColumnName("start")
      .IsRequired(false);
    
    builder
      .Property(entity => entity.End)
      .HasColumnName("end")
      .IsRequired(false);
  }

  #endregion
}