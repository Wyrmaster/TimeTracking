using TimeTracking.Service.Common;

namespace TimeTracking.Service.Extensions;

/// <summary>
///   Extensions resolving the authenticated user of a request
/// </summary>
public static class HttpContextExtension
{
  #region Extension Methods

  /// <summary>
  ///   Resolves the name of the authenticated user
  /// </summary>
  /// <param name="httpContext">context of the current request</param>
  /// <returns>the user name, null if the request is not authenticated</returns>
  public static string? GetUserName(this HttpContext httpContext) => httpContext.User.GetUserName();

  /// <summary>
  ///   Resolves the name of the authenticated user of an endpoint guarded by the <see cref="UserNameEndpointFilter"/>
  /// </summary>
  /// <param name="httpContext">context of the current request</param>
  /// <returns>the user name</returns>
  /// <exception cref="InvalidOperationException">the endpoint is not guarded by the filter</exception>
  public static string GetRequiredUserName(this HttpContext httpContext)
    => httpContext.GetUserName()
       ?? throw new InvalidOperationException($"Endpoint requires the {nameof(UserNameEndpointFilter)}.");

  #endregion
}
