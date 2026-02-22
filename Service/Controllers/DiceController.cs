using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TimeTracking.Service.Common;
using TimeTracking.Service.Extensions;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Controllers;

/// <summary>
///   Controller handling operations with dices 
/// </summary>
[ApiController]
[Route("api/v1/dice/")]
public class DiceController(ITimeTrackingService timeTrackingService) : UserNameController
{
  #region Endpoints
  
  /// <summary>
  ///   Update tracking by passing a new side id to the database
  /// </summary>
  /// <param name="sideId"></param>
  /// <returns></returns>
  [HttpPost("side/{sideId}/")]
  [Authorize]
  public async Task<IActionResult> UpdateSideAsync([FromRoute] int sideId)
  {
    string? userName = this.GetUserName(this.User);

    if (string.IsNullOrEmpty(userName))
    {
      return this.Problem("User name cannot be null or empty.");
    }
    
    await timeTrackingService.SetSideIdAsync(userName, sideId);

    return this.Ok();
  }

  /// <summary>
  ///   Update the charge this is not persisted in the database
  /// </summary>
  /// <param name="charge"></param>
  /// <returns></returns>
  [HttpPut("charge/{charge}")]
  [Authorize]
  public async Task<IActionResult> UpdateChargeAsync([FromRoute] int charge)
  {
    string? userName = this.GetUserName(this.User);

    if (string.IsNullOrEmpty(userName))
    {
      return this.Problem("User name cannot be null or empty.");
    }
    
    await timeTrackingService.SetChargeAsync(userName, charge);
    return this.Ok();
  }

  /// <summary>
  ///   Returns the current Charge of the tracker
  /// </summary>
  /// <returns></returns>
  [HttpGet("charge/{charge}")]
  [Authorize]
  public async Task<IActionResult> GetChargeAsync()
  {
    string? userName = this.GetUserName(this.User);

    if (string.IsNullOrEmpty(userName))
    {
      return this.Problem("User name cannot be null or empty.");
    }
    
    return this.Ok(await timeTrackingService.GetChargeAsync(userName));
  }

  #endregion
}