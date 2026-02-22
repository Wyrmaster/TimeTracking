using System.Security.Claims;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Extensions;

/// <summary>
///   Extension methods for SignalRHubs
/// </summary>
// ReSharper disable once InconsistentNaming
public static class IUserNameResolverExtension
{
  #region Extension Methods
  
  extension(IUserNameResolver self)
  {
    /// <summary>
    ///   Resolves the Username from the JWT Token claim
    /// </summary>
    /// <returns></returns>
    public string? GetUserName(ClaimsPrincipal? user) => user?.FindFirstValue("UserName");
  }

  #endregion
}