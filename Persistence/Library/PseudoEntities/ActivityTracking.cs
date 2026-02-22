namespace TimeTracking.Persistence.PseudoEntities;

/// <summary>
///   Pseudoentity to extract the timestamp and the activity that starts tracking
/// </summary>
public class ActivityTracking
{
  #region Properties

  /// <summary>
  ///   Id of the Activity that starts tracking
  /// </summary>
  public long ActivityId { get; set; }

  /// <summary>
  ///   Timestamp the activity started tracking
  /// </summary>
  public DateTime Timestamp { get; set; }

  #endregion
}