namespace TimeTracking.Service.Interfaces;

/// <summary>
///   Interface Authenticating a user
/// </summary>
public interface IAuthentication
{
  #region Methods

  /// <summary>
  ///   Authenticate user
  /// </summary>
  /// <param name="username"></param>
  /// <param name="password"></param>
  /// <returns><c>TRUE</c> on a valid user otherwise <c>FALSE</c></returns>
  Task<bool> AuthenticateAsync(string username, string password);

  /// <summary>
  ///   Change the password of a user
  /// </summary>
  /// <param name="username"></param>
  /// <param name="oldPassword"></param>
  /// <param name="newPassword"></param>
  /// <returns><c>TRUE</c> on a valid user otherwise <c>FALSE</c></returns>
  Task<bool> ChangePasswordAsync(string username, string oldPassword, string newPassword);

  #endregion
}