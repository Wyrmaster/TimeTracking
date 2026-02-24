using TimeTracking.Persistence.Entities;

namespace TimeTracking.Service.Dto.Data;

/// <summary>
///   Transfer object describing a <see cref="TimeEntry"/>
/// </summary>
public record TimeEntryDto: IdDto
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

  /// <summary>
  ///   Activity the <see cref="TimeEntry"/> is assigned to
  /// </summary>
  public ActivityDto Activity { get; set; }

  #endregion
}