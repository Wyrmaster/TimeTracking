namespace TimeTracking.Service.Dto.Data;

/// <summary>
///   Transfer object describing the start of an Activity
/// </summary>
public class StartActivityDto
{
  #region Properties

  /// <summary>
  ///   Id of the Activity to start Tracking
  /// </summary>
  public long ActivityId { get; set; }

  /// <summary>
  ///   Description of the the current time segment
  /// </summary>
  public string Description { get; set; }

  #endregion
}