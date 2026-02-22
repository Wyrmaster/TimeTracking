namespace TimeTracking.Service.Dto.Data;

/// <summary>
///   Transfer object describing a Workspace
/// </summary>
public class WorkspaceDto: IdDto
{
  #region Properties

  /// <summary>
  ///   Name of the Workspace
  /// </summary>
  public string Name { get; set; }
  
  /// <summary>
  ///   Description of the Workspace
  /// </summary>
  public string? Description { get; set; }

  /// <summary>
  ///   Flag indicating that this Workspace is active
  /// </summary>
  public bool IsActive { get; set; }

  #endregion
}