namespace TimeTracking.Service.Interfaces;

/// <summary>
///   Keeps the last reported battery charge of each user's dice for the lifetime of the application
/// </summary>
public interface IDiceChargeStore
{
  #region Methods

  /// <summary>
  ///   Stores the charge level reported by the dice of a user
  /// </summary>
  /// <param name="username">name of the user</param>
  /// <param name="charge">charge level</param>
  void SetCharge(string username, int charge);

  /// <summary>
  ///   Resolves the last reported charge level of the dice of a user
  /// </summary>
  /// <param name="username">name of the user</param>
  /// <returns>charge level, -1 if the dice never reported one</returns>
  int GetCharge(string username);

  #endregion
}
