namespace TimeTracking.Service.Extensions;

/// <summary>
///   Extension Methods for the HttpContext
/// </summary>
public static class HttpContextExtension
{
  #region Extension Methods

  /// <summary>
  ///   Resolve the username from the user claims
  /// </summary>
  /// <param name="httpContext"></param>
  /// <returns></returns>
  public static string? GetUserName(this HttpContext httpContext)
    => httpContext.User.Claims.FirstOrDefault(entry => entry.Type == "UserName")?.Value;

  #endregion
}