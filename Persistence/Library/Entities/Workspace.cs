using TimeTracking.Persistence.Entities.Abstract;
// ReSharper disable EntityFramework.ModelValidation.UnlimitedStringLength : set in the configuration file

namespace TimeTracking.Persistence.Entities;

/// <summary>
///   Workspace to link a set of activities
/// </summary>
public class Workspace: BaseEntity
{
  #region Properties

  /// <summary>
  ///   Name of the Workspace
  /// </summary>
  public string Name { get; set; } = string.Empty;

  /// <summary>
  ///   Description for this Workspace
  /// </summary>
  public string? Description { get; set; }

  /// <summary>
  ///   Flag to show if the current Workspace is the default one
  /// </summary>
  public bool IsDefault { get; set; }

  #endregion

  #region Shadow Properties

  /// <summary>
  ///   Activities linked to this Workspace
  /// </summary>
  public ICollection<Activity>? Activities { get; set; }

  /// <summary>
  ///   linked user for this workspace
  /// </summary>
  public User? User { get; set; }

  /// <summary>
  ///   shadow property to use as a navigation partner for the active workspace reference
  /// </summary>
  public User? ActiveWorkspaceUser { get; set; }

  #endregion
}