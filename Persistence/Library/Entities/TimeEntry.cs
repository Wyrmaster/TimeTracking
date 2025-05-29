using TimeTracking.Persistence.Entities.Abstract;

namespace TimeTracking.Persistence.Entities;

/// <summary>
///   Entry describing a time span
/// </summary>
public class TimeEntry: BaseEntity
{
  #region Properties

  /// <summary>
  ///   Description of a <see cref="TimeEntry"/>
  /// </summary>
  // ReSharper disable once EntityFramework.ModelValidation.UnlimitedStringLength : set in the configuration class
  public string? Description { get; set; }

  /// <summary>
  ///   Start of a <see cref="TimeEntry"/>
  /// </summary>
  public DateTime? Start { get; set; }

  /// <summary>
  ///   End of a <see cref="TimeEntry"/>
  /// </summary>
  public DateTime? End { get; set; }

  #endregion

  #region Shadow Properties

  /// <summary>
  ///   linked <see cref="Activity"/> to this <see cref="TimeEntry"/>
  /// </summary>
  public virtual Activity? Activity { get; set; }

  #endregion
}