namespace TimeTracking.Service.Dto.Data;

/// <summary>
///   Transfer object for active activity data.
/// </summary>
public record ActiveActivityDto: ActivityDto
{
  #region Properties
  
  /// <summary>
  ///   Timestamp 
  /// </summary>
  public DateTime TrackingSince { get; set; }

  #endregion
}