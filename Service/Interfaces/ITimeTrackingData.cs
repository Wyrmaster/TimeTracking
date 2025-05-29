namespace TimeTracking.Service.Interfaces;

/// <summary>
///   Interface describing the currently active side of a dice for each user
/// </summary>
public interface ITimeTrackingData
{
  #region Methods

  /// <summary>
  ///   set memorize the current active side of the dice
  /// </summary>
  /// <param name="username">username of the registered user</param>
  /// <param name="sideId">side id of the active side</param>
  void SetSideId(string username, int sideId);
  
  /// <summary>
  ///   Get the current side id for the queried user
  /// </summary>
  /// <param name="username">name of a user</param>
  /// <returns></returns>
  int GetSideId(string username);
  
  /// <summary>
  ///   Store the current charge of the dice of a specific user
  /// </summary>
  /// <param name="username">name of a user</param>
  /// <param name="charge">charge level</param>
  void SetCharge(string username, int charge);
  
  /// <summary>
  ///   Returns the current charge level of the dice of a specific user
  /// </summary>
  /// <param name="username">name of the user</param>
  /// <returns>current charge level</returns>
  int GetCharge(string username);

  #endregion
}