using Microsoft.AspNetCore.Mvc;
using TimeTracking.Service.Dto;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Controllers;

/// <summary>
///   Controller to handle user authentication
/// </summary>
[ApiController]
[Route("api/v1/authentication/")]
public class UserController: ControllerBase
{
  #region Fields

  private readonly IAuthenticationService _authenticationServiceService;

  #endregion
  
  #region Constructor

  public UserController(IAuthenticationService authenticationServiceService)
  {
    this._authenticationServiceService = authenticationServiceService;
  }
  
  #endregion

  #region Endpoints

  /// <summary>
  ///   Authenticate a User using a username and password
  /// </summary>
  /// <param name="credentials">credentials used to login a user</param>
  /// <param name="token"></param>
  /// <returns></returns>
  [HttpPost]
  public async Task<IActionResult> Authenticate([FromBody] Credentials credentials, CancellationToken token = default)
  {
    Token? authenticationToken = await this._authenticationServiceService.AuthenticateAsync(credentials.UserName, credentials.Password, token);
    
    return authenticationToken != null 
      ? this.Ok(authenticationToken)
      : this.Unauthorized();
  }

  /// <summary>
  ///   Creates a new user with the provided username and password.
  /// </summary>
  /// <param name="credentials">credentials used to login a user</param>
  /// <param name="token">Token for task cancellation.</param>
  /// <returns>An IActionResult containing a token</returns>
  [HttpPost("register/")]
  public async Task<IActionResult> CreateNewUser([FromBody] Credentials credentials, CancellationToken token = default)
    => this.Ok(await this._authenticationServiceService.RegisterUserAsync(credentials.UserName, credentials.Password, token));

  #endregion
}