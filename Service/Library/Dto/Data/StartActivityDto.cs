namespace TimeTracking.Service.Dto.Data;

/// <summary>
///   Transfer object describing the activity to start tracking
/// </summary>
public record StartActivityDto
{
  #region Properties

  /// <summary>
  ///   Id of the activity to start tracking
  /// </summary>
  public required long ActivityId { get; init; }

  /// <summary>
  ///   Description of the new time entry
  /// </summary>
  public string Description { get; init; } = string.Empty;

  #endregion
}
