using Microsoft.AspNetCore.Mvc;
using TimeTracking.Service.Extensions;
using TimeTracking.Service.Interfaces;

namespace TimeTracking.Service.Endpoints;

/// <summary>
///   Endpoints handling all dice operations 
/// </summary>
public static class Dices
{
  #region Extension Methods

  /// <summary>
  ///   Extension method registering the Dice Endpoints
  /// </summary>
  /// <param name="self"></param>
  /// <returns></returns>
  public static IEndpointRouteBuilder MapDiceEndpoints(this IEndpointRouteBuilder self)
  {
    var group = self
      .MapGroup("api/v1/dice/")
      .RequireAuthorization();

    group.MapPost("side/{sideId:int}/", Dices.UpdateSideAsync);
    group.MapPut("charge/{charge:int}/", Dices.UpdateChargeAsync);
    group.MapGet("charge/{charge:int}/", Dices.GetChargeAsync);
    
    return self;
  }

  #endregion

  #region Endpoints

  /// <summary>
  ///   Update tracking by passing a new side id to the database
  /// </summary>
  /// <param name="context"></param>
  /// <param name="timeTrackingService"></param>
  /// <param name="sideId"></param>
  /// <param name="token"></param>
  /// <returns></returns>
  private static  async Task<IResult> UpdateSideAsync
  (
    HttpContext context,
    ITimeTrackingService timeTrackingService,
    [FromRoute] int sideId,
    CancellationToken token = default
  )
  {
    string? userName = context.GetUserName();

    if (string.IsNullOrEmpty(userName))
    {
      return Results.Problem("User name cannot be null or empty.");
    }
    
    await timeTrackingService.SetSideIdAsync(userName, sideId, token);

    return Results.Ok();
  }

  /// <summary>
  ///   Update the charge this is not persisted in the database
  /// </summary>
  /// <param name="context"></param>
  /// <param name="timeTrackingService"></param>
  /// <param name="charge"></param>
  /// <param name="token"></param>
  /// <returns></returns>
  private static  async Task<IResult> UpdateChargeAsync
  (
    HttpContext context,
    ITimeTrackingService timeTrackingService,
    [FromRoute] int charge,
    CancellationToken token = default
  )
  {
    string? userName = context.GetUserName();

    if (string.IsNullOrEmpty(userName))
    {
      return Results.Problem("User name cannot be null or empty.");
    }
    
    await timeTrackingService.SetChargeAsync(userName, charge, token);
    return Results.Ok();
  }

  /// <summary>
  ///   Returns the current Charge of the tracker
  /// </summary>
  /// <returns></returns>
  private static async Task<IResult> GetChargeAsync
  (
    HttpContext context,
    ITimeTrackingService timeTrackingService,
    CancellationToken token = default
  )
  {
    string? userName = context.GetUserName();

    if (string.IsNullOrEmpty(userName))
    {
      return Results.Problem("User name cannot be null or empty.");
    }
    
    return Results.Ok(await timeTrackingService.GetChargeAsync(userName, token));
  }

  #endregion
}