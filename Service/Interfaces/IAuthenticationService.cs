using TimeTracking.Service.Dto;

namespace TimeTracking.Service.Interfaces;

/// <summary>
///   Interface Authenticating a user
/// </summary>
public interface IAuthenticationService
{
  #region Methods

  /// <summary>
  ///   Authenticate user
  /// </summary>
  /// <param name="username">username to authenticate</param>
  /// <param name="password">password to authenticate the user with</param>
  /// <param name="cancellationToken"></param>
  /// <returns><c>TRUE</c> on a valid user otherwise <c>FALSE</c></returns>
  Task<Token?> AuthenticateAsync(string username, string password, CancellationToken cancellationToken = default);

  /// <summary>
  ///   Change the password of a user
  /// </summary>
  /// <param name="username">username to whose password to change</param>
  /// <param name="oldPassword">old password to change</param>
  /// <param name="newPassword">string to set the password to</param>
  /// <param name="cancellationToken"></param>
  /// <returns><c>TRUE</c> on a valid user otherwise <c>FALSE</c></returns>
  Task<bool> ChangePasswordAsync(string username, string oldPassword, string newPassword, CancellationToken cancellationToken = default);

  /// <summary>
  ///   Registers a new user
  /// </summary>
  /// <param name="username">The username of the user to register</param>
  /// <param name="password">The password for the new user</param>
  /// <param name="token">Token for task cancellation</param>
  /// <returns>The authentication token for the registered user</returns>
  Task<Token> RegisterUserAsync(string username, string password, CancellationToken token = default);

  #endregion
}