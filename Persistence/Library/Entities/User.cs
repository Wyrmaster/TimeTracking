using TimeTracking.Persistence.Entities.Abstract;

// ReSharper disable EntityFramework.ModelValidation.UnlimitedStringLength : set in the configuration class

namespace TimeTracking.Persistence.Entities;

/// <summary>
///   Entity Describing a User
/// </summary>
public class User: BaseEntity
{
  #region Properties

  /// <summary>
  ///   Username of the Current USer
  /// </summary>
  public required string Username { get; set; }
  
  /// <summary>
  ///   Password for the current user
  /// </summary>
  public required string Password { get; set; }
  
  /// <summary>
  ///   Id of the Active Workspace
  /// </summary>
  public Guid? ActiveWorkspaceId { get; set; }
  
  #endregion

  #region Shadoww Properties

  /// <summary>
  ///   Linked Activities
  /// </summary>
  public ICollection<Activity>? Activities { get; set; }

  /// <summary>
  ///   Linked workspaces for this user
  /// </summary>
  public ICollection<Workspace>? Workspaces { get; set; }

  /// <summary>
  ///   reference to the active workspace
  /// </summary>
  public Workspace? ActiveWorkspace { get; set; }
  
  #endregion
}