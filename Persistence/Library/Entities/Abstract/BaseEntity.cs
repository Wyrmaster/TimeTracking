namespace TimeTracking.Persistence.Entities.Abstract;

/// <summary>
///   Base Entity for every entity describing its own table
/// </summary>
public abstract class BaseEntity
{
  #region Properties

  /// <summary>
  ///   Primary Key Identifier
  /// </summary>
  public Guid Id { get; set; }

  #endregion
}