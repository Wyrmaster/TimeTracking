using Microsoft.AspNetCore.Mvc;
using TimeTracking.Service.Dto;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Endpoints;

/// <summary>
///   Endpoints handling all user operations 
/// </summary>
public static class Users
{
  #region Extension Methods

  /// <summary>
  ///   Extension method registering the Activity Endpoints
  /// </summary>
  /// <param name="self"></param>
  /// <returns></returns>
  public static IEndpointRouteBuilder MapAuthenticationEndpoints(this IEndpointRouteBuilder self)
  {
    var group = self
      .MapGroup("api/v1/authentication/");

    group.MapPost("", Users.AuthenticateAsync);
    group.MapPost("register/", Users.CreateNewUserAsync);
    
    return self;
  }
  
  #endregion
  
  #region Endpoints

  /// <summary>
  ///   Authenticate a User using a username and password
  /// </summary>
  /// <param name="context"></param>
  /// <param name="authenticationService"></param>
  /// <param name="credentials">credentials used to login a user</param>
  /// <param name="token"></param>
  /// <returns></returns>
  private static async Task<IResult> AuthenticateAsync
  (
    HttpContext context,
    IAuthenticationService authenticationService,
    [FromBody] Credentials credentials, CancellationToken token = default
  )
  {
    Token? authenticationToken = await authenticationService.AuthenticateAsync(credentials.UserName, credentials.Password, token);
    
    return authenticationToken != null 
      ? Results.Ok(authenticationToken)
      : Results.Unauthorized();
  }

  /// <summary>
  ///   Creates a new user with the provided username and password.
  /// </summary>
  /// <param name="context"></param>
  /// <param name="authenticationService"></param>
  /// <param name="credentials">credentials used to login a user</param>
  /// <param name="token">Token for task cancellation.</param>
  /// <returns>An IActionResult containing a token</returns>
  private static async Task<IResult> CreateNewUserAsync
  (
    HttpContext context,
    IAuthenticationService authenticationService,
    [FromBody] Credentials credentials,
    CancellationToken token = default
  )
    => Results.Ok(await authenticationService.RegisterUserAsync(credentials.UserName, credentials.Password, token));

  #endregion
}