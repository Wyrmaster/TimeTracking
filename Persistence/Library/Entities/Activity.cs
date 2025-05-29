using TimeTracking.Persistence.Entities.Abstract;

// ReSharper disable EntityFramework.ModelValidation.UnlimitedStringLength : set in the configuration class

namespace TimeTracking.Persistence.Entities;

/// <summary>
///   Activities that can be linked to the side of one dice
/// </summary>
public class Activity: BaseEntity
{
  #region Properties

  /// <summary>
  ///   Name of the Activity
  /// </summary>
  public required string ActivityName { get; set; }

  /// <summary>
  ///   Description of an Activity
  /// </summary>
  public required string Description { get; set; }

  /// <summary>
  ///   id of the side of the dice
  /// </summary>
  public byte? SideId { get; set; }

  #endregion

  #region Shadow Properties

  /// <summary>
  ///   Linked time entries for this <see cref="Activity"/>
  /// </summary>
  public virtual ICollection<TimeEntry> TimeEntries { get; set; } = [];

  /// <summary>
  ///   Username of the User that created owns this <see cref="Activity"/>
  /// </summary>
  public virtual User? User { get; set; }

  public virtual Workspace? Workspace { get; set; }

  #endregion
}