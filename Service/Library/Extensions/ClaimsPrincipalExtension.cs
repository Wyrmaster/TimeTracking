using System.Security.Claims;

namespace TimeTracking.Service.Extensions;

/// <summary>
///   Extensions resolving the authenticated user from its claims
/// </summary>
public static class ClaimsPrincipalExtension
{
  #region Constants

  /// <summary>
  ///   Claim containing the name of the authenticated user
  /// </summary>
  public const string UserNameClaim = "UserName";

  #endregion

  #region Extension Methods

  /// <summary>
  ///   Resolves the name of the authenticated user
  /// </summary>
  /// <param name="principal">the authenticated principal</param>
  /// <returns>the user name, null if the principal carries none</returns>
  public static string? GetUserName(this ClaimsPrincipal? principal)
  {
    string? userName = principal?.FindFirstValue(UserNameClaim);

    return string.IsNullOrEmpty(userName) ? null : userName;
  }

  #endregion
}
