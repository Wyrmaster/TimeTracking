using Microsoft.AspNetCore.Mvc;
using TimeTracking.Service.Common;
using TimeTracking.Service.Dto;
using TimeTracking.Service.Extensions;
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

    group
      .MapPut("password/", Users.ChangePasswordAsync)
      .RequireAuthorization()
      .AddEndpointFilter<UserNameEndpointFilter>();
    
    return self;
  }
  
  #endregion
  
  #region Endpoints

  /// <summary>
  ///   Authenticate a User using a username and password
  /// </summary>
  /// <param name="context"></param>
  /// <param name="accountService"></param>
  /// <param name="credentials">credentials used to login a user</param>
  /// <param name="token"></param>
  /// <returns></returns>
  private static async Task<IResult> AuthenticateAsync
  (
    HttpContext context,
    IAccountService accountService,
    [FromBody] Credentials credentials,
    CancellationToken token = default
  )
  {
    Token? authenticationToken = await accountService.AuthenticateAsync(credentials.UserName, credentials.Password, token);
    
    return authenticationToken != null 
      ? Results.Ok(authenticationToken)
      : Results.Unauthorized();
  }

  /// <summary>
  ///   Creates a new user with the provided username and password.
  /// </summary>
  /// <param name="context"></param>
  /// <param name="accountService"></param>
  /// <param name="credentials">credentials used to login a user</param>
  /// <param name="token">Token for task cancellation.</param>
  /// <returns>An IActionResult containing a token</returns>
  private static async Task<IResult> CreateNewUserAsync
  (
    HttpContext context,
    IAccountService accountService,
    [FromBody] Credentials credentials,
    CancellationToken token = default
  )
  {
    Token? authenticationToken = await accountService.RegisterUserAsync(credentials.UserName, credentials.Password, token);

    return authenticationToken == null
      ? Results.Conflict()
      : Results.Ok(authenticationToken);
  }

  /// <summary>
  ///   Changes the password of the authenticated user
  /// </summary>
  /// <param name="context"></param>
  /// <param name="accountService"></param>
  /// <param name="changePassword">the current and the new password</param>
  /// <param name="token">Token for task cancellation.</param>
  /// <returns>No content on success, bad request if the current password is wrong</returns>
  private static async Task<IResult> ChangePasswordAsync
  (
    HttpContext context,
    IAccountService accountService,
    [FromBody] ChangePasswordDto changePassword,
    CancellationToken token = default
  )
  {
    if (string.IsNullOrWhiteSpace(changePassword.NewPassword))
    {
      return Results.BadRequest();
    }

    string userName = context.GetRequiredUserName();

    bool changed = await accountService.ChangePasswordAsync
    (
      userName,
      changePassword.OldPassword,
      changePassword.NewPassword,
      token
    );

    return changed
      ? Results.NoContent()
      : Results.BadRequest();
  }

  #endregion
}