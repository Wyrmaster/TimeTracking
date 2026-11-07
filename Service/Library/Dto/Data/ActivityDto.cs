namespace TimeTracking.Service.Dto.Data;

/// <summary>
///   Transferobject for Activities
/// </summary>
public record ActivityDto: IdDto
{
  #region Properties

  /// <summary>
  ///   Name of the new Activity
  /// </summary>
  public string Name { get; set; }

  /// <summary>
  ///   Description of the Activity
  /// </summary>
  public string Description { get; set; }

  /// <summary>
  ///   Color asigned to this activity
  /// </summary>
  public int ActivityColor { get; set; }

  /// <summary>
  ///   Activity is assigned to an id
  /// </summary>
  public bool Assigned { get; set; }

  #endregion
}